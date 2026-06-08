
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import User

def email(to, subject, body):
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to], fail_silently=True)

def auditors():
    return User.objects.filter(role='auditor').values_list('email', flat=True)

def kyc_submitted(applicant_email, name, ref):
    email(applicant_email, 'KYC Submitted', f'Hi {name}, your KYC {ref} is under review.')
    for a in auditors():
        email(a, 'New KYC', f'New submission from {name} ({applicant_email}). Ref: {ref}')

def kyc_approved(applicant_email, name, ref):
    email(applicant_email, 'KYC Approved', f'Hi {name}, your KYC {ref} is approved. You are verified.')

def kyc_rejected(applicant_email, name, ref, remarks):
    email(applicant_email, 'KYC Rejected', f'Hi {name}, your KYC {ref} was rejected. Reason: {remarks}')

def kyc_resubmit(applicant_email, name, ref, remarks):
    email(applicant_email, 'KYC Resubmission', f'Hi {name}, your KYC {ref} needs changes. Note: {remarks}')