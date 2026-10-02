from django.utils import timezone
from datetime import timedelta
from .models import OtpCode, PendingRegistration, User
from .sms import send_otp


COOLDOWN_MINUTES = 2


def can_request_otp(phone: str) -> tuple[bool, str]:
    """
    بررسی cooldown — کاربر نباید در ۲ دقیقه اخیر کد گرفته باشد.
    Returns: (allowed, error_message)
    """
    cutoff = timezone.now() - timedelta(minutes=COOLDOWN_MINUTES)
    recent = OtpCode.objects.filter(phone=phone, created_at__gte=cutoff).exists()
    if recent:
        return False, f"لطفاً {COOLDOWN_MINUTES} دقیقه صبر کنید"
    return True, ""


def create_and_send_otp(phone: str) -> tuple[bool, str]:
    """
    ساخت کد جدید و ارسال پیامک.
    کدهای قبلی is_used=True می‌شوند (حذف نمی‌شوند).
    """
    allowed, msg = can_request_otp(phone)
    if not allowed:
        return False, msg

    # غیرفعال کردن کدهای قبلی
    OtpCode.objects.filter(phone=phone, is_used=False).update(is_used=True)

    code = OtpCode.generate_code()
    OtpCode.objects.create(phone=phone, code=code)

    sent = send_otp(phone, code)
    if not sent:
        return False, "ارسال پیامک با خطا مواجه شد. لطفاً مجدداً تلاش کنید"

    return True, "کد تأیید ارسال شد"


def verify_otp_and_get_user(phone: str, code: str) -> tuple[User | None, str]:
    """
    تأیید کد OTP.
    کاربر فقط زمانی ساخته می‌شود که قبلاً ثبت‌نام انجام شده باشد
    (PendingRegistration موجود باشد)؛ در غیر این صورت مشتری شناسایی نمی‌شود.
    Returns: (user_or_None, error_message)
    """
    try:
        otp = (
            OtpCode.objects
            .filter(phone=phone, is_used=False)
            .latest("created_at")
        )
    except OtpCode.DoesNotExist:
        return None, "کد معتبر یافت نشد"

    if not otp.is_valid():
        return None, "کد منقضی شده یا قبلاً استفاده شده است"

    if otp.code != code:
        # ضد حدس زدن کد — بعد از ۵ تلاش نادرست کد باطل می‌شود
        otp.attempts += 1
        if otp.attempts >= 5:
            otp.is_used = True
        otp.save(update_fields=["attempts", "is_used"])
        if otp.is_used:
            return None, "تعداد تلاش‌های ناموفق بیش از حد مجاز است؛ کد جدید درخواست کنید."
        return None, "کد وارد شده اشتباه است"

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    user = User.objects.filter(phone=phone).first()
    pending = PendingRegistration.objects.filter(phone=phone).first()

    if user is None:
        if pending is None:
            # شماره ثبت‌نام نکرده است — بدون ثبت‌نام مشتری ساخته نمی‌شود
            return None, "ابتدا ثبت‌نام را انجام دهید."
        user = User(phone=phone)
        user.password = pending.password
        user.save()
        pending.delete()
        return user, ""

    # کاربر قدیمی بدون پسورد (ثبت‌نام OTP قبلی) — پسورد ثبت‌نام جدید اعمال می‌شود
    if pending is not None:
        if not user.has_usable_password():
            user.password = pending.password
            user.save(update_fields=["password"])
        pending.delete()
    return user, ""
