import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime, timedelta

from app.core.config import settings

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length."""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def get_otp_subject(otp_type: str) -> str:
    """Get appropriate subject based on OTP type."""
    subjects = {
        "registration": "Study Tracker - Email Verification OTP",
        "login": "Study Tracker - Login OTP",
        "password_reset": "Study Tracker - Password Reset OTP"
    }
    return subjects.get(otp_type, "Study Tracker - OTP Code")

def get_otp_message(otp: str, otp_type: str, username: str = None) -> str:
    """Generate appropriate email message based on OTP type."""
    if otp_type == "registration":
        return f"""
Dear {username or 'User'},

Welcome to Study Tracker! 

Your email verification OTP is: {otp}

This OTP will expire in 10 minutes. Please enter this code to complete your registration.

If you didn't create an account with Study Tracker, please ignore this email.

Best regards,
Study Tracker Team
        """.strip()
    
    elif otp_type == "login":
        return f"""
Dear {username or 'User'},

Your login OTP is: {otp}

This OTP will expire in 10 minutes. Please enter this code to complete your login.

If you didn't request this OTP, please ignore this email.

Best regards,
Study Tracker Team
        """.strip()
    
    elif otp_type == "password_reset":
        return f"""
Dear {username or 'User'},

Your password reset OTP is: {otp}

This OTP will expire in 10 minutes. Please enter this code to reset your password.

If you didn't request a password reset, please ignore this email.

Best regards,
Study Tracker Team
        """.strip()
    
    else:
        return f"Your OTP code is: {otp}"

def send_otp_email(to_email: str, otp: str, otp_type: str = "registration", username: str = None) -> Optional[str]:
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
        msg['Subject'] = get_otp_subject(otp_type)
        
        body = get_otp_message(otp, otp_type, username)
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        return None
    except Exception as e:
        return str(e)

def get_otp_expiry_time() -> datetime:
    """Get OTP expiry time (10 minutes from now)."""
    return datetime.utcnow() + timedelta(minutes=10)
