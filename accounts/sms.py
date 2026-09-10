import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_kavenegar(phone: str, code: str) -> bool:
    """ارسال OTP از طریق کاوه‌نگار"""
    try:
        api_key = settings.KAVENEGAR_API_KEY
        url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
        params = {
            "receptor": phone,
            "token": code,
            "template": settings.KAVENEGAR_TEMPLATE,  # نام template در پنل کاوه‌نگار
        }
        response = requests.post(url, params=params, timeout=10)
        data = response.json()
        if data.get("return", {}).get("status") == 200:
            return True
        logger.error(f"Kavenegar error: {data}")
        return False
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return False


def send_otp_mellipayam(phone: str, code: str) -> bool:
    """ارسال OTP از طریق ملی‌پیام"""
    try:
        url = "https://rest.payamak-panel.com/api/SendSMS/SendSMS"
        payload = {
            "username": settings.MELLIPAYAM_USERNAME,
            "password": settings.MELLIPAYAM_PASSWORD,
            "to": phone,
            "from": settings.MELLIPAYAM_FROM,
            "text": f"کد تایید شما: {code}\nفروشگاه شامین",
            "isflash": False,
        }
        response = requests.post(url, json=payload, timeout=10)
        data = response.json()
        if data.get("RetStatus") == 1:
            return True
        logger.error(f"Mellipayam error: {data}")
        return False
    except Exception as e:
        logger.error(f"SMS send failed: {e}")
        return False


def send_otp(phone: str, code: str) -> bool:
    """انتخاب provider از settings"""
    provider = getattr(settings, "SMS_PROVIDER", "kavenegar")
    if provider == "mellipayam":
        return send_otp_mellipayam(phone, code)
    return send_otp_kavenegar(phone, code)
