# AI Guardian: Universal Health Monitor & Diagnostic Assistant

AI Guardian is a cutting-edge medical companion that uses Google's Gemini AI to interpret medical documents, provide oncology-specific imaging analysis, and monitor real-time health metrics.

## 🚀 Features

- **AI Document Scan**: Analyze blood reports, prescriptions, and medical records via camera, file upload, or clipboard paste.
- **Oncology Mode**: Specialized analysis for mammography and breast health with BI-RADS estimation.
- **Real-time Monitoring**: Visualized heart rate, blood pressure, and oxygen saturation tracking.
- **Predictive Health Forecast**: AI-driven timeline predicting optimal recovery and resting phases.
- **Health ChatBot**: Instant answers to medical queries based on your scanned data.
- **Emergency SOS**: One-touch access to emergency services and medical history.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **AI Engine**: Google Gemini 1.5 Flash (via `@google/genai`)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-guardian-health-monitor.git
   cd ai-guardian-health-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Publishing Guide (Zero Feature Loss)

To publish this app without losing any features (AI Scanning, Chat, Oncology Mode, and Database), follow these steps:

### 1. Firebase Setup (Required for Login & History)
The app is currently configured with a demo Firebase project. For a production app:
- Go to [Firebase Console](https://console.firebase.google.com/).
- Create a new project.
- Enable **Authentication** (Google Provider).
- Enable **Firestore Database** (Start in production mode, add rules).
- Copy your config into `src/lib/firebase.ts`.

### 2. Gemini AI Setup (Required for Analysis)
- Get an API Key from [Google AI Studio](https://aistudio.google.com/).
- This key is required for all scanning and chat features.

### 3. Deploy to Vercel or Netlify
1. **Push to GitHub**: Upload your code to a repository.
2. **Connect to Hosting**: Link your GitHub repo to Vercel or Netlify.
3. **Set Environment Variables**: In the hosting dashboard, add:
   - `VITE_GEMINI_API_KEY`: (Your Gemini API Key)
4. **Deploy**: The app will build and go live.

> **Note**: If you use Vercel, the `netlify.toml` will be ignored, but Vercel handles SPAs automatically. If you use Netlify, the `netlify.toml` already included will handle routing correctly.

## 📄 License

MIT License
