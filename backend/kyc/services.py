
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
            
            result = DeepFace.verify(
                img1_path=temp_id_path,
                img2_path=temp_selfie_path,
                model_name='Facenet512', 
                distance_metric='euclidean',
                enforce_detection=True,

            )
            distance = result['distance']
            threshold = result['threshold']
            passed = result['verified']
            
            confidence = max(0, (1 - (distance / threshold)))
            confidence = round(confidence, 4)
            
            if passed:
                message = f'Face verified successfully! ({confidence*100:.1f}% match)'
            else:
                message = 'Face verification failed. Please try again with better lighting.'
            
            return {
                'passed': passed,
                'score': confidence,
                'distance': round(distance, 4),
                'message': message
            }
                
        except Exception as e:
            logger.error(f"Face verification error: {str(e)}")
            
            error_msg = str(e).lower()
            if "face could not be detected" in error_msg:
                return {
                    'passed': False,
                    'score': 0,
                    'distance': 2.0,
                    'message': 'No face detected. Please upload clearer images.'
                }
            elif "multiple faces" in error_msg:
                return {
                    'passed': False,
                    'score': 0,
                    'distance': 2.0,
                    'message': 'Multiple faces detected. Please upload single face images.'
                }
            else:
                return {
                    'passed': False,
                    'score': 0,
                    'distance': 2.0,
                    'message': 'Face verification failed. Please try again.'
                }
        
        finally:
            if temp_id_path and os.path.exists(temp_id_path):
                os.unlink(temp_id_path)
            if temp_selfie_path and os.path.exists(temp_selfie_path):
                os.unlink(temp_selfie_path)