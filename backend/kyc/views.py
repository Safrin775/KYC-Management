from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .services import FaceMatchService
from django.shortcuts import get_object_or_404
from .models import AuditLog, KYCApplication
from .serializers import KYCSubmitSerializer, KYCApplicationSerializer, KYCStatusSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .emails import kyc_submitted 
from .emails import kyc_approved, kyc_rejected, kyc_resubmit 
class FaceVerificationView(APIView):
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        id_document = request.FILES.get('id_document')
        selfie = request.FILES.get('selfie')
        
        if not id_document:
            return Response({
                'success': False,
                'message': 'ID document is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not selfie:
            return Response({
                'success': False,
                'message': 'Selfie is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = FaceMatchService.verify_faces(id_document, selfie)
        
        return Response({
            'success': True,
            'passed': result['passed'],
            'score': result['score'],
            'distance': result['distance'],
            'message': result['message']
        }, status=status.HTTP_200_OK)

class SubmitKYCView(APIView):
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        mobile = request.data.get('mobile')
        if KYCApplication.objects.filter(mobile=mobile, status__in=['pending', 'approved']).exists():
            return Response({'error': 'Active application with this mobile already exists'})
            
        existing_app = KYCApplication.objects.filter(
            user=request.user,
            status='pending'
        ).first()

        if existing_app:
            return Response({
                'success': False,
                'error': 'You already have an active KYC application',
                'application_id': existing_app.id,
                'status': existing_app.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        id_document = request.FILES.get('id_document')
        selfie = request.FILES.get('selfie')
        
        if not id_document or not selfie:
            return Response({
                'success': False,
                'error': 'Both ID document and selfie are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        face_match_passed = request.data.get('face_match_passed') == 'true'
        face_match_skipped = request.data.get('face_match_skipped') == 'true'
        face_match_score = request.data.get('face_match_score')
        
        serializer = KYCSubmitSerializer(data=request.data)
        
        if serializer.is_valid():
            application = serializer.save(
                user=request.user,
                id_document=id_document,
                selfie=selfie,
                face_match_passed=face_match_passed,
                face_match_score=face_match_score,
                face_match_skipped=face_match_skipped,
                status='pending'
            )
            
            kyc_submitted(
            applicant_email=request.user.email,
            name=application.full_name,
            ref=application.id
        )
            return Response({
                'success': True,
                'message': 'KYC application submitted successfully',
                'application_id': application.id,
                'status': application.status,
                'face_verified': face_match_passed
            }, status=status.HTTP_201_CREATED)
            
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
class KYCStatusView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        application = KYCApplication.objects.filter(
            user=request.user
        ).first()
        
        if not application:
            return Response({
                'has_application': False,
                'message': 'No KYC application found'
            }, status=status.HTTP_200_OK)
        
        serializer = KYCStatusSerializer({
            'application_id': application.id,
            'status': application.status,
            'full_name': application.full_name,
            'submitted_at': application.submitted_at,
            'rejection_reason': application.rejection_reason,
            'reviewed_at': application.reviewed_at
        })
        
        return Response({
            'has_application': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class KYCApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, application_id):
        application = get_object_or_404(KYCApplication, id=application_id, user=request.user)
        serializer = KYCApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateKYCView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, application_id):
        application = get_object_or_404(KYCApplication, id=application_id, user=request.user)
        
        if application.status not in ['draft', 'incomplete']:
            return Response({
                'error': f'Cannot update application with status: {application.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCSubmitSerializer(application, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Application updated successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
#  Auditor Views   

class PendingApplicationsView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')
        applications = KYCApplication.objects.filter(status='pending')
        
        if date_from:
            applications = applications.filter(submitted_at__date__gte=date_from)
        if date_to:
            applications = applications.filter(submitted_at__date__lte=date_to)
        
        applications = applications.order_by('submitted_at')
        
        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'full_name': app.full_name,
                'status_filter':app.status,
                'mobile': app.mobile,
                'submitted_at': app.submitted_at,
                'face_match_passed': app.face_match_passed,
                'face_match_score': app.face_match_score,
                'face_match_percentage': round(app.face_match_score * 100, 1) if app.face_match_score else 0
                })
        
        return Response({
            'success': True,
            'count': len(data),
            'applications': data
        }, status=status.HTTP_200_OK)
        
class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, application_id):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        application = get_object_or_404(KYCApplication, id=application_id)
        
        
        return Response({
            'success': True,
            'application': {
                'id': application.id,
                'full_name': application.full_name,
                'dob': application.dob,
                'mobile': application.mobile,
                'pan_last4': application.pan_last4,
                'id_document_url': application.id_document.url if application.id_document else None,
                'selfie_url': application.selfie.url if application.selfie else None,
                'face_match_passed': application.face_match_passed,
                'face_match_score': application.face_match_score,
                'face_match_percentage': round(application.face_match_score * 100, 1) if application.face_match_score else 0,
                'status': application.status,
                'submitted_at': application.submitted_at,
                'rejection_reason': application.rejection_reason,
                'reviewed_by_email': application.reviewed_by.email if application.reviewed_by else None,
                'reviewed_at': application.reviewed_at,
            }
        }, status=status.HTTP_200_OK)
        
class ApproveApplicationView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, application_id):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        application = get_object_or_404(KYCApplication, id=application_id)
        
        if application.status != 'pending':
            return Response({
                'success': False,
                'error': f'Cannot approve application with status: {application.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        remarks = request.data.get('remarks', '')
        
        application.status = 'approved'
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        AuditLog.objects.create(
            application=application,
            auditor=request.user,
            action='approved',
            remarks=remarks
        )
        
        kyc_approved(
            applicant_email=application.user.email,
            name=application.full_name,
            ref=application.id
        )
        return Response({
            'success': True,
            'message': f'Application #{application_id} approved successfully',
            'status': 'approved'
        }, status=status.HTTP_200_OK)
        
        
class RejectApplicationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, application_id):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        remarks = request.data.get('remarks', '')
        
        if not remarks:
            return Response({
                'success': False,
                'error': 'Remarks are required for rejection'
            }, status=status.HTTP_400_BAD_REQUEST)
        application = get_object_or_404(KYCApplication, id=application_id)
        
        if application.status != 'pending':
            return Response({
                'success': False,
                'error': f'Cannot reject application with status: {application.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = 'rejected'
        application.rejection_reason = remarks
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        AuditLog.objects.create(
            application=application,
            auditor=request.user,
            action='rejected',
            remarks=remarks
        )
        
        kyc_rejected(
            applicant_email=application.user.email,
            name=application.full_name,
            ref=application.id,
            remarks=remarks
        )

        return Response({
            'success': True,
            'message': f'Application #{application_id} rejected',
            'status': 'rejected'
        }, status=status.HTTP_200_OK)
        
class ResubmitRequestView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, application_id):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        remarks = request.data.get('remarks', '')
        
        if not remarks:
            return Response({
                'success': False,
                'error': 'Remarks are required for resubmission request'
            }, status=status.HTTP_400_BAD_REQUEST)
        application = get_object_or_404(KYCApplication, id=application_id)
        
        if application.status != 'pending':
            return Response({
                'success': False,
                'error': f'Cannot request resubmission for application with status: {application.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = 'resubmit'
        application.rejection_reason = remarks
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        AuditLog.objects.create(
            application=application,
            auditor=request.user,
            action='resubmit',
            remarks=remarks
        )
        kyc_resubmit(
            applicant_email=application.user.email,
            name=application.full_name,
            ref=application.id,
            remarks=remarks
        )
        return Response({
            'success': True,
            'message': f'Resubmission requested for application #{application_id}',
            'status': 'resubmit'
        }, status=status.HTTP_200_OK)
        
from kyc.models import AuditLog

class AuditLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        action_filter = request.query_params.get('action')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        logs = AuditLog.objects.select_related('application', 'auditor').all()

        if action_filter:
            logs = logs.filter(action=action_filter)
        if date_from:
            logs = logs.filter(created_at__date__gte=date_from)
        if date_to:
            logs = logs.filter(created_at__date__lte=date_to)

        logs = logs.order_by('-created_at')

        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 20) 
        paginator = Paginator(logs, page_size)

        try:
            paginated_logs = paginator.page(page)
        except PageNotAnInteger:
            paginated_logs = paginator.page(1)
        except EmptyPage:
            paginated_logs = paginator.page(paginator.num_pages)

        data = []
        for log in paginated_logs:
            data.append({
                'id': log.id,
                'application_id': log.application.id,
                'applicant_name': log.application.full_name,
                'auditor_email': log.auditor.email,
                'action': log.action,
                'remarks': log.remarks,
                'created_at': log.created_at,
            })

        return Response({
            'success': True,
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': paginated_logs.number,
            'page_size': int(page_size),
            'logs': data,
        })
        
class ApprovedApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'auditor':
            return Response({
                'success': False,
                'error': 'Access denied. Auditor role required.'
            }, status=status.HTTP_403_FORBIDDEN)

        applications = KYCApplication.objects.filter(status='approved').order_by('-reviewed_at')

        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'full_name': app.full_name,
                'mobile': app.mobile,
                'reviewed_by_email': app.reviewed_by.email if app.reviewed_by else 'N/A',
                'reviewed_at': app.reviewed_at,
                'face_match_passed': app.face_match_passed,
                'face_match_score': app.face_match_score,
            })
        return Response({'success': True, 'applications': data})



class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'auditor':
            return Response({'error': 'Access denied'}, status=403)

        total = KYCApplication.objects.exclude(status='draft').count()
        approved = KYCApplication.objects.filter(status='approved').count()
        rejected = KYCApplication.objects.filter(status='rejected').count()
        resubmit = KYCApplication.objects.filter(status='resubmit').count()
        pending = KYCApplication.objects.filter(status='pending').count()

        approval_rate = round((approved / total * 100) if total > 0 else 0, 1)

        scores = KYCApplication.objects.filter(
            face_match_score__isnull=False,
            status__in=['approved', 'rejected']
        ).values_list('face_match_score', flat=True)

        bins = [round(i * 0.1, 1) for i in range(11)]
        distribution = []
        for i in range(10):
            low = bins[i]
            high = bins[i+1]
            count = sum(1 for s in scores if low <= s < high)
            distribution.append({'range': f'{low}-{high}', 'count': count})

        return Response({
            'total_applications': total,
            'approved': approved,
            'rejected': rejected,
            'resubmit': resubmit,
            'pending': pending,
            'approval_rate': approval_rate,
            'score_distribution': distribution,
        })