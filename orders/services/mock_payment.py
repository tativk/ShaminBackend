import uuid
from decimal import Decimal

from .base import (
    BasePaymentService,
    PaymentRequest,
    PaymentResult,
    VerifyRequest,
    VerifyResult,
)

# در حافظه نگه می‌داریم — فقط برای dev
_pending: dict[str, Decimal] = {}


class MockPaymentService(BasePaymentService):
    """
    شبیه‌ساز درگاه پرداخت برای محیط توسعه.
    هر authority که با FAIL_ شروع بشه، پرداخت رو ناموفق شبیه می‌زنه.
    """

    def __init__(self, base_url: str = 'http://localhost:8000'):
        self._base_url = base_url.rstrip('/')

    def request_payment(self, payment_req: PaymentRequest) -> PaymentResult:
        authority = f'MOCK-{uuid.uuid4().hex[:16].upper()}'
        _pending[authority] = payment_req.amount

        payment_url = (
            f'{self._base_url}/api/v1/orders/mock-gateway/'
            f'?Authority={authority}&order_id={payment_req.order_id}'
        )
        return PaymentResult(
            success=True,
            authority=authority,
            payment_url=payment_url,
        )

    def verify_payment(self, verify_req: VerifyRequest) -> VerifyResult:
        authority = verify_req.authority

        if authority.startswith('FAIL_'):
            return VerifyResult(success=False, error_message='پرداخت ناموفق (Mock)')

        stored_amount = _pending.pop(authority, None)
        if stored_amount is None:
            return VerifyResult(
                success=False,
                error_message='Authority یافت نشد یا قبلاً تأیید شده',
            )

        if stored_amount != verify_req.amount:
            return VerifyResult(
                success=False,
                error_message=f'مبلغ مغایرت دارد: {stored_amount} ≠ {verify_req.amount}',
            )

        ref_id = f'REF-{uuid.uuid4().hex[:12].upper()}'
        return VerifyResult(success=True, ref_id=ref_id)
