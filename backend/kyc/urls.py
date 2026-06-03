from django.urls import path
from . import views

urlpatterns = [
    path('verify-face/', views.FaceVerificationView.as_view(), name='verify-face'), 
    path('submit/', views.SubmitKYCView.as_view(), name='submit-kyc'),
    path('status/', views.KYCStatusView.as_view(), name='kyc-status'),
    path('application/<int:application_id>/', views.KYCApplicationDetailView.as_view(), name='kyc-detail'),
    path('update/<int:application_id>/', views.UpdateKYCView.as_view(), name='update-kyc'),
]