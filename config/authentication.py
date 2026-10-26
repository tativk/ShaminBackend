from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed as JWTAuthFailed


class OptionalJWTAuthentication(BaseAuthentication):
    """
    نسخه‌ی «ملایم» JWT:
    - توکن معتبر → کاربر احراز هویت می‌شود
    - توکن نامعتبر/منقضی → به‌جای خطا، کاربر مهمان در نظر گرفته می‌شود
      (صفحات عمومی مثل لیست محصولات با توکن کهنه هم کار می‌کنند؛
      endpointهای محافظت‌شده 401 «credentials» می‌دهند و فرانت کاربر را به لاگین می‌برد)
    """

    def authenticate(self, request):
        try:
            return JWTAuthentication().authenticate(request)
        except (InvalidToken, JWTAuthFailed, AuthenticationFailed):
            return None

    def authenticate_header(self, request):
        return "Bearer"
