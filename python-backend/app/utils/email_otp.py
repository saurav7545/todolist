import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length."""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def send_otp_email(to_email: str, otp: str, subject: str = "Your OTP Code") -> Optional[str]:
    """Send an OTP to the user's email address."""
    try:
        smtp_server = settings.SMTP_SERVER
        smtp_port = settings.SMTP_PORT
        smtp_user = settings.SMTP_USER
        smtp_password = settings.SMTP_PASSWORD
        from_email = settings.FROM_EMAIL

        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        body = f"Your OTP code is: {otp}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        return None
    except Exception as e:
        return str(e)
