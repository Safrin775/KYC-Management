from rest_framework import serializers
from .models import KYCApplication

class KYCApplicationSerializer(serializers.ModelSerializer):
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = KYCApplication
        fields = [
            'id', 'user', 'user_email',
            'full_name', 'dob', 'mobile', 'pan_last4',
            'id_document', 'selfie',
            'face_match_score', 'face_match_passed', 'face_match_message',
            'status', 'rejection_reason',
            'submitted_at', 'updated_at', 'reviewed_at'
        ]
        read_only_fields = ['id', 'submitted_at', 'updated_at', 'reviewed_at']

class KYCSubmitSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = KYCApplication
        fields = [
            'full_name', 'dob', 'mobile', 'pan_last4',
            'id_document', 'selfie',
            'face_match_score', 'face_match_passed', 'face_match_message'
        ]
    
    def validate_dob(self, value):
        from datetime import date
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be 18 years or older")
        return value
    
    def validate_mobile(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Mobile number must be 10 digits")
        return value
    
    def validate_pan_last4(self, value):
        if not value.isdigit() or len(value) != 4:
            raise serializers.ValidationError("PAN last 4 must be 4 digits")
        return value

class KYCStatusSerializer(serializers.Serializer):
   
    application_id = serializers.IntegerField()
    status = serializers.CharField()
    full_name = serializers.CharField()
    submitted_at = serializers.DateTimeField()
    rejection_reason = serializers.CharField(allow_blank=True)
    reviewed_at = serializers.DateTimeField(allow_null=True)