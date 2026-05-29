from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import KYCApplication
from .serializers import KYCSubmitSerializer, KYCApplicationSerializer, KYCStatusSerializer

class SubmitKYCView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        
        existing_app = KYCApplication.objects.filter(
            user=request.user
        ).exclude(status='rejected').first()
        
        if existing_app:
            return Response({
                'error': 'You already have an active KYC application',
                'application_id': existing_app.id,
                'status': existing_app.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCSubmitSerializer(data=request.data)
        
        if serializer.is_valid():
            application = serializer.save(
                user=request.user,
                status='pending'
            )
            
            return Response({
                'success': True,
                'message': 'KYC application submitted successfully',
                'application_id': application.id,
                'status': application.status
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