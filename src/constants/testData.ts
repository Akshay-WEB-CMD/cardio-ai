export const SAMPLE_REPORTS = [
  {
    id: 'blood-work',
    name: 'General Blood Work',
    type: 'General',
    content: `PATIENT REPORT: Alex Rivera
DATE: 2024-06-12
-----------------------------------------
HEMOGLOBIN: 14.2 g/dL (Normal: 13.5-17.5)
GLUCOSE (FASTING): 112 mg/dL (Normal: 70-99) - ELEVATED
CHOLESTEROL: 225 mg/dL (Normal: <200) - HIGH
BLOOD PRESSURE: 138/88 mmHg - STAGE 1 HYPERTENSION
-----------------------------------------
NOTES: Patient reports occasional dizziness and thirst.`,
    mimeType: 'text/plain'
  },
  {
    id: 'mammogram',
    name: 'Mammography Analysis',
    type: 'Oncology',
    content: `CLINICAL RADIOLOGY REPORT
EXAM: BILATERAL MAMMOGRAM
-----------------------------------------
FINDINGS:
Right Breast: No suspicious masses or calcifications.
Left Breast: A 1.5cm spiculated mass is noted in the upper outer quadrant. 
Associated pleomorphic microcalcifications are present.
Architectural distortion is visible.
BI-RADS CATEGORY: 4 (Suspicious)
-----------------------------------------
RECOMMENDATION: Ultrasound-guided core biopsy recommended.`,
    mimeType: 'text/plain'
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound Diagnostics',
    type: 'Oncology',
    content: `ULTRASOUND IMAGING REPORT
EXAM: TARGETED BREAST ULTRASOUND
-----------------------------------------
FINDINGS:
At the 2 o'clock position of the left breast, corresponding to the mammographic abnormality, there is a 1.4 x 1.2 x 1.0 cm hypoechoic mass.
The mass has irregular margins and is taller-than-wide.
Posterior acoustic shadowing is present.
No increased vascularity noted on Doppler.
-----------------------------------------
IMPRESSION: Solid mass with suspicious features. BI-RADS 4C.`,
    mimeType: 'text/plain'
  },
  {
    id: 'thermography',
    name: 'Thermography Screening',
    type: 'Oncology',
    content: `INFRARED THERMOGRAPHY ANALYSIS
EXAM: BREAST THERMAL GRADIENT SCAN
-----------------------------------------
THERMAL FINDINGS:
Significant hyperthermic asymmetry noted in the left breast.
Delta-T (Temperature Difference): +2.4°C in the upper outer quadrant.
Vascular patterns show focal hyper-vascularity (angiogenesis) in the suspicious region.
Right breast shows normal thermal symmetry.
-----------------------------------------
TH-RATING: TH-5 (Severely Abnormal Thermal Pattern)`,
    mimeType: 'text/plain'
  },
  {
    id: 'prescription',
    name: 'Medical Prescription',
    type: 'Pharmacy',
    content: `CITY GENERAL HOSPITAL
Dr. Sarah Jenkins, MD
-----------------------------------------
PATIENT: Alex Rivera
RX: 
1. Lisinopril 10mg - 1 tablet daily for hypertension.
2. Metformin 500mg - 1 tablet twice daily with meals for blood sugar.
-----------------------------------------
REFILLS: 3
DATE: 2024-06-15`,
    mimeType: 'text/plain'
  },
  {
    id: 'bp-log',
    name: 'Blood Pressure Log',
    type: 'General',
    content: `WEEKLY BP MONITORING: Alex Rivera
-----------------------------------------
MON: 142/92 (AM), 138/88 (PM)
TUE: 145/95 (AM), 140/90 (PM)
WED: 139/89 (AM), 137/87 (PM)
THU: 148/98 (AM) - HIGH STRESS DAY
-----------------------------------------
AVERAGE: 141/91 mmHg
STATUS: Consistently elevated.`,
    mimeType: 'text/plain'
  }
];
