import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api';
import PaymentCallback from './PaymentCallback';

/**
 * اتصال صفحه‌ی نتیجه‌ی پرداخت به بک‌اند.
 * درگاه پرداخت فعلاً قطع است و هیچ جایی به این صفحه هدایت نمی‌شود؛
 * بعد از اتصال درگاه واقعی (زرین‌پال)، درگاه کاربر را با Authority و Status
 * به همین مسیر برمی‌گرداند و این کانیتنر نتیجه را از بک‌اند استعلام می‌کند.
 */
export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const authority = params.get('Authority') || '';
  const gatewayStatus = params.get('Status') || '';
  const [result, setResult] = useState({
    key: 'pending',
    orderId: null,
    referenceId: null,
  });

  useEffect(() => {
    if (!authority) {
      setResult({ key: 'unknown', orderId: null, referenceId: null });
      return;
    }
    let ignore = false;
    apiRequest(
      `/orders/payment/callback/?Authority=${encodeURIComponent(authority)}&Status=${encodeURIComponent(gatewayStatus)}`,
    )
      .then((data) => {
        if (ignore) return;
        // پاسخ موفق: {detail, order_id, ref_id} یا {detail, status} برای تراکنش پردازش‌شده
        const serverStatus = data.status;
        let key = 'failed';
        if (data.ref_id || serverStatus === 'paid') key = 'success';
        else if (serverStatus === 'cancelled') key = 'cancelled';
        else if (serverStatus === 'pending') key = 'pending';
        else if (serverStatus === 'failed') key = 'failed';
        setResult({
          key,
          orderId: data.order_id ?? null,
          referenceId: data.ref_id ?? null,
        });
      })
      .catch((err) => {
        if (ignore) return;
        setResult({
          key: String(err?.message || '').includes('یافت نشد') ? 'unknown' : 'failed',
          orderId: null,
          referenceId: null,
        });
      });
    return () => { ignore = true; };
  }, [authority, gatewayStatus]);

  return (
    <PaymentCallback
      status={result.key}
      orderId={result.orderId}
      referenceId={result.referenceId}
    />
  );
}
