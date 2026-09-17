from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass
class PaymentRequest:
    amount: Decimal          # به تومان
    order_id: int
    callback_url: str
    description: str = ''


@dataclass
class PaymentResult:
    success: bool
    authority: str = ''      # شناسه تراکنش درگاه
    payment_url: str = ''    # آدرس redirect به درگاه
    error_message: str = ''


@dataclass
class VerifyRequest:
    authority: str
    amount: Decimal


@dataclass
class VerifyResult:
    success: bool
    ref_id: str = ''         # شناسه پرداخت نهایی
    error_message: str = ''


class BasePaymentService(ABC):
    @abstractmethod
    def request_payment(self, payment_req: PaymentRequest) -> PaymentResult:
        """شروع فرآیند پرداخت و دریافت لینک درگاه"""
        ...

    @abstractmethod
    def verify_payment(self, verify_req: VerifyRequest) -> VerifyResult:
        """تأیید پرداخت پس از بازگشت کاربر از درگاه"""
        ...
