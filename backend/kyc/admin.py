from django.contrib import admin
from .models import KYCApplication, AuditLog

@admin.register(KYCApplication)
class KYCApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'mobile', 'status', 'submitted_at', 'face_match_passed']
    list_filter = ['status', 'face_match_passed', 'submitted_at']
    search_fields = ['full_name', 'mobile', 'email']
    readonly_fields = ['submitted_at', 'updated_at', 'face_match_score']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'full_name', 'dob', 'mobile', 'pan_last4')
        }),
        ('Documents', {
            'fields': ('id_document', 'selfie')
        }),
        ('Face Matching', {
            'fields': ('face_match_score', 'face_match_passed', 'face_match_message')
        }),
        ('Status', {
            'fields': ('status', 'rejection_reason', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at')
        }),
    )
    
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'application', 'auditor', 'action', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['application__full_name', 'auditor__email']
    readonly_fields = ['created_at']
