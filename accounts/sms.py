import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_kavenegar(phone: str, code: str) -> bool:
    """Send an OTP using Kavenegar's Verify/Lookup API.

    True means Kavenegar accepted the request (it does not guarantee carrier
    delivery to the handset).
    """
    api_key = str(getattr(settings, "KAVENEGAR_API_KEY", "") or "").strip()
    template = str(getattr(settings, "KAVENEGAR_TEMPLATE", "") or "").strip()

    if not api_key:
        logger.error("Kavenegar is selected but KAVENEGAR_API_KEY is not configured.")
        return False
    if not template:
        logger.error("Kavenegar is selected but KAVENEGAR_TEMPLATE is not configured.")
        return False

    url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
    params = {
        "receptor": phone,
        "token": code,
        "template": template,
    }

    try:
        response = requests.post(url, data=params, timeout=(5, 20))
        response.raise_for_status()
        try:
            data = response.json()
        except ValueError:
            logger.error("Kavenegar returned a non-JSON response (HTTP %s).", response.status_code)
            return False

        provider_status = data.get("return", {}).get("status")
        if provider_status == 200:
            logger.info("Kavenegar accepted an OTP request for a recipient.")
            return True

        # Do not log the full request URL, API key, OTP, or recipient.
        message = data.get("return", {}).get("message", "unknown provider error")
        logger.error("Kavenegar rejected the OTP request (status=%r, message=%r).", provider_status, message)
        return False
    except requests.Timeout:
        logger.error("Kavenegar OTP request timed out.")
        return False
    except requests.RequestException as exc:
        # Avoid str(exc): it can include the URL containing the API key.
        logger.error("Kavenegar HTTP request failed (%s).", type(exc).__name__)
        return False
    except Exception as exc:
        logger.error("Unexpected Kavenegar error (%s).", type(exc).__name__)
        return False


def send_otp_mellipayam(phone: str, code: str) -> bool:
    """Send an OTP using the legacy Mellipayam integration."""
    try:
        username = str(getattr(settings, "MELLIPAYAM_USERNAME", "") or "").strip()
        password = str(getattr(settings, "MELLIPAYAM_PASSWORD", "") or "").strip()
        sender = str(getattr(settings, "MELLIPAYAM_FROM", "") or "").strip()
        if not username or not password or not sender:
            logger.error("Mellipayam is selected but its credentials/sender are not configured.")
            return False

        url = "https://rest.payamak-panel.com/api/SendSMS/SendSMS"
        payload = {
            "username": username,
            "password": password,
            "to": phone,
            "from": sender,
            "text": f"کد تایید شما: {code}\nفروشگاه شامین",
            "isflash": False,
        }
        response = requests.post(url, json=payload, timeout=(5, 20))
        response.raise_for_status()
        data = response.json()
        if data.get("RetStatus") == 1:
            return True
        logger.error("Mellipayam rejected the SMS request (RetStatus=%r).", data.get("RetStatus"))
        return False
    except requests.RequestException as exc:
        logger.error("Mellipayam HTTP request failed (%s).", type(exc).__name__)
        return False
    except (ValueError, TypeError) as exc:
        logger.error("Mellipayam returned an invalid response (%s).", type(exc).__name__)
        return False
    except Exception as exc:
        logger.error("Unexpected Mellipayam error (%s).", type(exc).__name__)
        return False


def send_otp(phone: str, code: str) -> bool:
    """Choose the explicitly configured SMS provider."""
    provider = str(getattr(settings, "SMS_PROVIDER", "console") or "console").strip().lower()

    if provider == "console":
        # Development only. This mode never sends an actual SMS.
        logger.warning("SMS_PROVIDER=console: OTP was not sent as an SMS (phone=%s).", phone)
        print(f"[DEV ONLY - NO SMS SENT] {phone}: {code}")
        return True
    if provider == "kavenegar":
        return send_otp_kavenegar(phone, code)
    if provider == "mellipayam":
        return send_otp_mellipayam(phone, code)

    logger.error("Unsupported SMS_PROVIDER value: %r. No SMS was sent.", provider)
    return False
