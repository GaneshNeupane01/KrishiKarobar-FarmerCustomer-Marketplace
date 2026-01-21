from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
 ## Email verification logic removed

def send_verification_email(user, verification_url):
    """
    Send email verification email to user
    """
    subject = 'Verify Your Email - Krishi'
    
    # Render HTML email template
    html_message = render_to_string('email_verification.html', {
        'user': user,
        'verification_url': verification_url
    })
    
    # Create plain text version
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def create_verification_token(user):
    """
    Create or get existing email verification token for user
    """
    # Email verification logic removed

def verify_email_token(token):
    """
    Verify email token and mark user as verified
    """
    # Email verification logic removed

def resend_verification_email(user):
    """
    Resend verification email to user
    """
    # Delete existing verification if expired
    # Email verification logic removed
    
    # Create new verification
    # Email verification logic removed
    
    # Generate verification URL
    # Email verification logic removed
    
    # Send email
    # Email verification logic removed