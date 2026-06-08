import logging
import tempfile
import os
from deepface import DeepFace
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

class FaceMatchService:
    @staticmethod
    def verify_faces(id_image_file: InMemoryUploadedFile, selfie_file: InMemoryUploadedFile):
        
        temp_id_path = None
        temp_selfie_path = None
        
        try:
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_id:
                for chunk in id_image_file.chunks():
                    tmp_id.write(chunk)
                temp_id_path = tmp_id.name
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_selfie:
                for chunk in selfie_file.chunks():
                    tmp_selfie.write(chunk)
                temp_selfie_path = tmp_selfie.name
            
           
            liveness_result = FaceMatchService._detect_liveness(temp_selfie_path)
            is_live = liveness_result['is_live']
            liveness_score = liveness_result['liveness_score']
            
            match_result = FaceMatchService._match_faces(temp_id_path, temp_selfie_path)
            
            passed = match_result['passed'] and is_live
            
            if not is_live:
                message = 'Liveness check failed. Please use a live selfie, not a photo.'
            elif match_result['passed']:
                message = f"Face verified successfully! ({match_result['confidence']*100:.1f}% match)"
            else:
                message = 'Face verification failed. Please try again with better lighting.'
            
            return {
                'passed': passed,
                'score': match_result['confidence'],
                'distance': match_result['distance'],
                'message': message,
                'is_live': is_live,
                'liveness_score': liveness_score,
            }
                
        except Exception as e:
            logger.error(f"Face verification error: {str(e)}", exc_info=True)
            return {
                'passed': False,
                'score': 0,
                'distance': 2.0,
                'message': 'Face verification failed. Please try again.',
                'is_live': False,
                'liveness_score': 0,
            }
        
        finally:
            if temp_id_path and os.path.exists(temp_id_path):
                os.unlink(temp_id_path)
            if temp_selfie_path and os.path.exists(temp_selfie_path):
                os.unlink(temp_selfie_path)
    
    @staticmethod
    def _detect_liveness(image_path):
        
        try:
            faces = DeepFace.extract_faces(
                img_path=image_path,
                detector_backend='retinaface',  
                anti_spoofing=True,
                expand_percentage=0
            )
            
            if not faces:
                return {
                    'is_live': False,
                    'liveness_score': 0,
                    'message': 'No face detected in selfie'
                }
            
            face_info = faces[0]
            is_live = face_info.get('is_real', False)
            liveness_score = face_info.get('anti_spoofing_score', 0.0)
            
            return {
                'is_live': is_live,
                'liveness_score': round(liveness_score, 4),
                'message': 'Liveness check passed' if is_live else 'Liveness check failed'
            }
            
        except Exception as e:
            logger.error(f"Liveness detection error: {str(e)}")
            return {
                'is_live': False,
                'liveness_score': 0,
                'message': f'Liveness detection failed: {str(e)}'
            }
    
    @staticmethod
    def _match_faces(id_path, selfie_path):
        
        try:
            result = DeepFace.verify(
                img1_path=id_path,
                img2_path=selfie_path,
                model_name='Facenet512',
                distance_metric='euclidean',
                enforce_detection=False,  
                anti_spoofing=False,      
            )
            
            distance = result.get('distance', 1.0)
            threshold = result.get('threshold', 0.6)
            passed = result.get('verified', False)
            
            confidence = max(0, (1 - (distance / threshold)))
            confidence = round(confidence, 4)
            
            return {
                'passed': passed,
                'confidence': confidence,
                'distance': round(distance, 4),
                'threshold': threshold
            }
            
        except Exception as e:
            logger.error(f"Face matching error: {str(e)}")
            return {
                'passed': False,
                'confidence': 0,
                'distance': 2.0,
                'threshold': 0.6
            }