from django.urls import path

from . import views

urlpatterns = [
    path('verify-face/', views.FaceVerificationView.as_view(), name='verify-face'), 
    path('submit/', views.SubmitKYCView.as_view(), name='submit-kyc'),
    path('status/', views.KYCStatusView.as_view(), name='kyc-status'),
    path('application/<int:application_id>/', views.KYCApplicationDetailView.as_view(), name='kyc-detail'),
    path('update/<int:application_id>/', views.UpdateKYCView.as_view(), name='update-kyc'),
    path('auditor/pending/', views.PendingApplicationsView.as_view(), name='auditor-pending'),
    path('auditor/application/<int:application_id>/', views.ApplicationDetailView.as_view(), name='auditor-detail'),
    path('auditor/approve/<int:application_id>/', views.ApproveApplicationView.as_view(), name='auditor-approve'),
    path('auditor/reject/<int:application_id>/', views.RejectApplicationView.as_view(), name='auditor-reject'),
    path('auditor/resubmit/<int:application_id>/', views.ResubmitRequestView.as_view(), name='auditor-resubmit'),
    path('auditor/audit-log/', views.AuditLogView.as_view(), name='auditor-audit-log'),
    path('auditor/approved/', views.ApprovedApplicationsView.as_view(), name='auditor-approved'),
    path('auditor/analytics/', views.AnalyticsDashboardView.as_view(), name='analytics-dashboard'),]    
