from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator, MaxLengthValidator

class KYCApplication(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('resubmit', 'Resubmit Required'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='kyc_applications')
    full_name = models.CharField(max_length=250)
    dob = models.DateField(help_text="Date of Birth (YYYY-MM-DD)")
    mobile=models.CharField(max_length=15)
    pan_last4=models.CharField(max_length=4, validators=[MinLengthValidator(4),MaxLengthValidator(4)],help_text="Last 4 digits of PAN card")
    
    id_document=models.ImageField(upload_to='documents/%Y/%m/%d/',null=True, blank=True,help_text="Upload a valid ID document (Aadhaar/PAN)")
    selfie=models.ImageField(upload_to='selfies/%Y/%m/%d/',null=True, blank=True,help_text="Live selfie captured via webcam")
    face_match_score=models.FloatField(null=True, blank=True,help_text="Face match score (0-1)")
    face_match_passed=models.BooleanField(default=False,help_text="Did the face match pass the threshold?")
    face_match_message=models.CharField(max_length=255, null=True, blank=True,help_text="Message from face match process")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    rejection_reason = models.TextField( blank=True,help_text="Reason for rejection")
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.status}"
    
    class Meta:
        ordering = ['-submitted_at']
        
        
class AuditLog(models.Model):
    
    ACTION_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('resubmit', 'Requested Resubmission'),
    ]
    
    application = models.ForeignKey(KYCApplication, on_delete=models.CASCADE, related_name='audit_logs')
    auditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.auditor.email} - {self.action} - App #{self.application.id}"
    
    class Meta:
        ordering = ['-created_at']
