from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .services import FaceMatchService
from django.shortcuts import get_object_or_404
from .models import KYCApplication
from .serializers import KYCSubmitSerializer, KYCApplicationSerializer, KYCStatusSerializer

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
        
        existing_app = KYCApplication.objects.filter(
            user=request.user
        ).exclude(status='rejected').first()
        
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
        face_match_score = request.data.get('face_match_score')
        face_match_distance = request.data.get('face_match_distance')
        
        serializer = KYCSubmitSerializer(data=request.data)
        
        if serializer.is_valid():
            application = serializer.save(
                user=request.user,
                id_document=id_document,
                selfie=selfie,
                face_match_passed=face_match_passed,
                face_match_score=face_match_score,
                face_match_distance=face_match_distance,
                status='pending'
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