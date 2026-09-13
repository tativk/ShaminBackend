from django.conf import settings

from .base import BasePaymentService
from .mock_payment import MockPaymentService


def get_payment_service() -> BasePaymentService:
    """
    بعداً کافیه اینجا ZarinPal یا IDPay اضافه بشه
    و PAYMENT_SERVICE رو در .env عوض کنی.
    """
    provider = getattr(settings, 'PAYMENT_SERVICE', 'mock').lower()

    if provider == 'mock':
        return MockPaymentService(base_url=settings.BACKEND_BASE_URL)

    # آینده:
    # if provider == 'zarinpal':
    #     from .zarinpal import ZarinpalService
    #     return ZarinpalService(merchant_id=settings.ZARINPAL_MERCHANT_ID)

    raise ValueError(f'PAYMENT_SERVICE ناشناخته: {provider}')
