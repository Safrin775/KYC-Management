# KYC Management System
 The system collects minimal user information, verifies identity through a government-issued document, authenticates the user with real-time face matching, and routes completed applications to
an Auditor for final verification

## Setup Steps
 
### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+
- A Gmail account with an App Password enabled
- A Twilio account with a phone number
  
### Backend Setup
**1. Create and activate a virtual environment**
```bash
python -m venv venv
venv\Scripts\activate           
```
 
**2. Install dependencies**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers deepface mysqlclient twilio
```
**3.Run migrations**
```bash
python manage.py makemigrations accounts kyc auditor
python manage.py migrate
```
**4.Create superuser (admin & initial auditor)**
```bash
python manage.py createsuperuser
```
**5.Start the backend server**
```bash
python manage.py runserver
```

Backend runs at http://localhost:8000

### Frontend Setup
 
**1. Navigate to the frontend directory**
```bash
cd kyc_management/frontend
```
 
**2. Install dependencies**
```bash
npm install
```
 
**3. Start the development server**
```bash
npm start
```
Frontend runs at `http://localhost:3000`

## Tech Stack
 
### Backend
- **Django REST Framework** — API views and serializers
- **djangorestframework-simplejwt** — JWT authentication 
- **MySQL** — Primary database
- **DeepFace (Facenet512 + RetinaFace)** — Face matching and liveness/anti-spoofing detection
- **Twilio** — OTP via SMS
- **Django SMTP (Gmail)** — Email notifications
  
### Frontend
- **Material UI ** — UI components and theming
- **face-api.js** — Client-side face detection (TensorFlow.js)
- **react-webcam** — Live selfie capture

## Feature List
 
### Applicant
- Register and login with JWT authentication
- Multi-step KYC form (6 steps):
  - Personal Information (name, DOB, mobile, PAN last 4 digits)
  - OTP Verification via SMS (Twilio)
  - ID Document Upload (Aadhaar / PAN)
  - Live Selfie Capture via webcam
  - AI Face Match with liveness/anti-spoofing detection (DeepFace)
  - Review and Submit
- Track application status (Pending / Approved / Rejected / Resubmit Required)
- Email notification on every status change
### Auditor
- Login with auditor credentials
- Review Queue — all pending applications
- KYC Detail View — personal info, ID document, selfie
- Face Match Panel — confidence score, liveness score, PASS/FAIL badge
- Decision Panel — Approve / Reject / Request Resubmission with mandatory remarks
- Audit Log — paginated, filterable, timestamped record of all decisions
- Approved Applications list
- Analytics Dashboard — approval rates, face score distribution

## Demo Screnshots
### Auditor Dashboard

<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/be1aadec-c0c2-4816-8886-d47dbda49ae8" />
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/edef5d32-723c-4099-9795-702cd8cd93ad" />
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/82584bf2-879a-4423-ade1-9fe3c9188c77" />
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/170e2004-cfa2-44bb-a7e3-dc8da737c04b" />
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/881c9cc9-5bd8-4814-9c9a-69344f7a7c46" />

### Applicant Dashboard
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/4fbef145-9edf-42dd-8cfe-06faf1b3eda0" />
<img width="688" height="657" alt="image" src="https://github.com/user-attachments/assets/4c48494a-cb5a-4df3-9803-b436f59ce047" />




