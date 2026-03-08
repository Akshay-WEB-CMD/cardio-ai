/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Thermometer, 
  ShieldCheck, 
  Camera, 
  FileText, 
  Bell, 
  User,
  ChevronRight,
  Zap,
  BrainCircuit,
  Loader2,
  Wind,
  CloudLightning,
  Timer,
  Share2,
  ShieldAlert,
  Microscope,
  Dna,
  Waves,
  ScanFace,
  Info,
  ExternalLink,
  X,
  Calendar,
  Clock,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { HeartPulse } from './components/HeartPulse';
import { HealthChart } from './components/HealthChart';
import { RiskScore } from './components/RiskScore';
import { ScannerOverlay } from './components/ScannerOverlay';
import { Toast, type ToastType } from './components/Toast';
import { ChatBot } from './components/ChatBot';
import { LoginPage } from './components/LoginPage';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { getAIClient } from './lib/ai';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';

// --- New Unique Components ---

const DigitalTwin = ({ bpm, risk }: { bpm: number; risk: number }) => {
  const scale = 1 + (bpm - 60) / 200;
  const color = risk > 20 ? '#ef4444' : risk > 10 ? '#f59e0b' : '#3b82f6';
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, scale, 1],
          filter: [`drop-shadow(0 0 10px ${color}44)`, `drop-shadow(0 0 30px ${color}88)`, `drop-shadow(0 0 10px ${color}44)`]
        }}
        transition={{
          duration: 60 / bpm,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <Heart className="w-32 h-32 fill-current" style={{ color }} />
      </motion.div>
      
      {/* Electrical Impulse Rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 2, opacity: [0, 0.5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut"
          }}
          className="absolute border border-current rounded-full w-24 h-24"
          style={{ color }}
        />
      ))}
      
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Bio-Digital Twin Active</span>
      </div>
    </div>
  );
};

const PredictiveTimeline = () => {
  const predictions = [
    { time: '20:00', event: 'Optimal Recovery', status: 'stable', icon: Zap },
    { time: '22:30', event: 'Resting Phase Start', status: 'stable', icon: Timer },
    { time: '03:00', event: 'Deep Sleep Peak', status: 'warning', icon: CloudLightning },
    { time: '07:00', event: 'Morning Cortisol Rise', status: 'stable', icon: Activity },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">AI Predictive Forecast</h3>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-500 font-bold uppercase">94% Accuracy</div>
      </div>
      <div className="space-y-3">
        {predictions.map((p, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <div className="text-[10px] font-mono opacity-40 w-10">{p.time}</div>
            <div className="relative flex flex-col items-center">
              <div className={cn(
                "w-2 h-2 rounded-full z-10 transition-all",
                p.status === 'stable' ? "bg-medical-blue" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              )} />
              {i !== predictions.length - 1 && <div className="w-[1px] h-8 bg-white/5 absolute top-2" />}
            </div>
            <div className="flex-1 flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer">
              <span className="text-xs font-medium">{p.event}</span>
              <p.icon className={cn("w-3 h-3", p.status === 'stable' ? "opacity-30" : "text-amber-500")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock data for charts
const generateData = (base: number, variance: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    value: base + Math.random() * variance - variance / 2
  }));
};

const heartRateData = generateData(72, 10, 20);
const oxygenData = generateData(98, 2, 20);
const bpData = generateData(120, 15, 20);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState(12);
  const [activeTab, setActiveTab] = useState('home');
  const [oncologyMode, setOncologyMode] = useState<'mammography' | 'ultrasound' | 'thermography' | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [scanQuality, setScanQuality] = useState<{ clarity: string; artifacts: string; focus: string } | null>(null);
  const [healthData, setHealthData] = useState({
    heartRate: 74,
    oxygen: 98,
    bpSystolic: 120,
    bpDiastolic: 80,
    stressIndex: 14,
    environmentTemp: 22,
    airQuality: 42,
    additionalNotes: '',
    cholesterol: '',
    glucose: '',
    hba1c: '',
    bmi: ''
  });
  const [manualInput, setManualInput] = useState({
    heartRate: '',
    oxygen: '',
    bpSystolic: '',
    bpDiastolic: '',
    additionalNotes: '',
    cholesterol: '',
    glucose: '',
    hba1c: '',
    bmi: ''
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [suggestedProvider, setSuggestedProvider] = useState<string>("Dr. Elena Rodriguez");

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Listen for the latest health data
    const q = query(
      collection(db, `users/${user.uid}/healthData`),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setHealthData(prev => ({
          ...prev,
          heartRate: data.heartRate,
          oxygen: data.oxygen,
          bpSystolic: data.bpSystolic,
          bpDiastolic: data.bpDiastolic,
          additionalNotes: data.additionalNotes || '',
          cholesterol: data.cholesterol || '',
          glucose: data.glucose || '',
          hba1c: data.hba1c || '',
          bmi: data.bmi || ''
        }));
        // Update risk score based on new data (simple logic for demo)
        const newScore = Math.min(100, Math.max(5, 
          (data.heartRate > 100 ? 20 : 5) + 
          (data.oxygen < 95 ? 30 : 5) + 
          (data.bpSystolic > 140 ? 25 : 5)
        ));
        setRiskScore(newScore);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !db) return;

    const q = query(
      collection(db, `users/${user.uid}/appointments`),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(apps);
    });

    return () => unsubscribe();
  }, [user]);

  const calculateRisk = (hr: number, ox: number, sys: number) => {
    return Math.min(100, Math.max(5, 
      (hr > 100 || hr < 50 ? 25 : 5) + 
      (ox < 95 ? 35 : 5) + 
      (sys > 140 || sys < 90 ? 30 : 5)
    ));
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) {
      showToast("Firebase not configured", "error");
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/healthData`), {
        heartRate: Number(manualInput.heartRate) || healthData.heartRate,
        oxygen: Number(manualInput.oxygen) || healthData.oxygen,
        bpSystolic: Number(manualInput.bpSystolic) || healthData.bpSystolic,
        bpDiastolic: Number(manualInput.bpDiastolic) || healthData.bpDiastolic,
        additionalNotes: manualInput.additionalNotes,
        cholesterol: manualInput.cholesterol || healthData.cholesterol,
        glucose: manualInput.glucose || healthData.glucose,
        hba1c: manualInput.hba1c || healthData.hba1c,
        bmi: manualInput.bmi || healthData.bmi,
        timestamp: new Date()
      });
      
      // Immediate local update for better UX
      const hr = Number(manualInput.heartRate) || healthData.heartRate;
      const ox = Number(manualInput.oxygen) || healthData.oxygen;
      const sys = Number(manualInput.bpSystolic) || healthData.bpSystolic;
      setRiskScore(calculateRisk(hr, ox, sys));
      setHealthData(prev => ({ 
        ...prev, 
        additionalNotes: manualInput.additionalNotes,
        cholesterol: manualInput.cholesterol || prev.cholesterol,
        glucose: manualInput.glucose || prev.glucose,
        hba1c: manualInput.hba1c || prev.hba1c,
        bmi: manualInput.bmi || prev.bmi
      }));
      
      showToast("Health data updated", "success");
      setManualInput({ 
        heartRate: '', 
        oxygen: '', 
        bpSystolic: '', 
        bpDiastolic: '', 
        additionalNotes: '',
        cholesterol: '',
        glucose: '',
        hba1c: '',
        bmi: ''
      });
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("Failed to save data", "error");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    showToast("Logged out successfully", "success");
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setAiReport(null);
    
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a Universal Health Intelligence engine for 'CardioGuard AI'. 
        Analyze the following comprehensive health data set and provide a clinical-grade interpretation.
        
        DATA SET:
        - Heart Rate: ${healthData.heartRate} BPM
        - Oxygen Saturation: ${healthData.oxygen}%
        - Blood Pressure: ${healthData.bpSystolic}/${healthData.bpDiastolic} mmHg
        - AI Risk Score: ${riskScore}%
        - Environmental Stress: ${healthData.stressIndex}%
        - Additional Health Context: ${healthData.additionalNotes || 'None provided'}
        - Last Scan Result: ${lastScanResult || 'No recent scans performed'}
        
        INSTRUCTIONS:
        1. Interpret ALL provided data, even if it's unconventional health data.
        2. Provide a structured analysis in Markdown.
        3. Sections: 'Data Synthesis', 'Clinical Correlations', 'Risk Stratification', and 'Personalized Action Plan'.
        4. Tone: Futuristic, professional, and highly precise.`,
      });
      
      setAiReport(response.text || "Failed to generate report.");
      showToast("Health report generated successfully", "success");
    } catch (error) {
      console.error("AI Error:", error);
      setAiReport("Error connecting to AI diagnostic engine. Please try again.");
      showToast("Failed to generate report", "error");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleScanComplete = async (base64Image: string, mimeType: string = "image/jpeg") => {
    setIsGeneratingReport(true);
    setAiReport(null);
    setScanQuality(null);
    
    try {
      const ai = getAIClient();
      let prompt = `You are a Universal Medical Document Interpreter. 
      Analyze this document which contains health-related data.
      
      TASK 1: Extract all relevant parameters, provide a clinical interpretation, and assess potential health risks. Format in Markdown with clear headings.
      
      TASK 2: Evaluate the technical quality of this document. Provide feedback on:
      - Clarity (High, Medium, Low)
      - Artifacts (None, Potential detected, Significant)
      - Focus (Optimal, Suboptimal, Poor)
      
      Return the quality evaluation at the VERY END of your response in a JSON block like this:
      QUALITY_EVAL: {"clarity": "...", "artifacts": "...", "focus": "..."}`;
      
      if (oncologyMode) {
        prompt = `You are a Specialized Oncology Imaging AI. Analyze this ${oncologyMode} image for breast cancer detection. 
        - Interpret any visual data provided, regardless of the specific format, as long as it relates to breast health.
        - Look for microcalcifications, masses, architectural distortion, acoustic patterns, or thermal anomalies.
        - Provide a detailed clinical assessment including 'Visual Findings', 'BI-RADS Category (Estimated)', and 'Oncological Next Steps'. 
        - Format in markdown.
        
        TASK 2: Evaluate the technical quality of this image. Provide feedback on:
        - Clarity (High, Medium, Low)
        - Artifacts (None, Potential detected, Significant)
        - Focus (Optimal, Suboptimal, Poor)
        
        Return the quality evaluation at the VERY END of your response in a JSON block like this:
        QUALITY_EVAL: {"clarity": "...", "artifacts": "...", "focus": "..."}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      });
      
      const fullText = response.text || "";
      const qualityMatch = fullText.match(/QUALITY_EVAL:\s*({.*})/);
      
      if (qualityMatch) {
        try {
          const quality = JSON.parse(qualityMatch[1]);
          setScanQuality(quality);
          showToast(`Scan Quality: Clarity ${quality.clarity}, Focus ${quality.focus}`, "success");
        } catch (e) {
          console.error("Failed to parse quality data", e);
        }
      }

      const reportText = fullText.replace(/QUALITY_EVAL:\s*{.*}/, "").trim();
      setAiReport(reportText || "AI could not interpret the scanned data.");
      setLastScanResult(reportText || null);
      
      // Suggest oncologist if scan results seem abnormal or if in oncology mode
      if (oncologyMode || reportText.toLowerCase().includes('abnormal') || reportText.toLowerCase().includes('mass') || reportText.toLowerCase().includes('calcification')) {
        setSuggestedProvider("Dr. Marcus Thorne");
      }

      showToast(oncologyMode ? `${oncologyMode} analysis complete` : "Scan analysis complete", "success");
      // Randomly update risk score for demo effect
      if (!oncologyMode) setRiskScore(Math.floor(Math.random() * 40) + 5);
    } catch (error: any) {
      console.error("AI Scan Error:", error);
      const errorMessage = error?.message || "Unknown error occurred during scan";
      setAiReport(`Failed to analyze scan: ${errorMessage}. Ensure the image is clear and try again.`);
      showToast(`AI Scan Error: ${errorMessage.substring(0, 50)}...`, "error");
    } finally {
      setIsGeneratingReport(false);
      setOncologyMode(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen medical-grid flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-medical-blue animate-spin" />
      </div>
    );
  }

  const heartRateData = generateData(healthData.heartRate, 5, 20);
  const oxygenData = generateData(healthData.oxygen, 1, 20);
  const bpData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    systolic: healthData.bpSystolic + Math.random() * 10 - 5,
    diastolic: healthData.bpDiastolic + Math.random() * 6 - 3
  }));

  const getGuardianStatus = () => {
    let insights = [];
    let confidence = 98;

    if (healthData.heartRate > 100) {
      insights.push("Tachycardia detected. Monitor exertion levels.");
      confidence -= 5;
    } else if (healthData.heartRate < 60) {
      insights.push("Bradycardia noted. Ensure this is your normal resting state.");
      confidence -= 3;
    }

    if (healthData.oxygen < 95) {
      insights.push("Oxygen saturation below optimal (95%). Check environment.");
      confidence -= 10;
    }

    if (healthData.bpSystolic > 140 || healthData.bpDiastolic > 90) {
      insights.push("Hypertensive trend identified. Monitor sodium intake.");
      confidence -= 8;
    }

    if (lastScanResult) {
      insights.push("Recent scan data integrated into current risk profile.");
    }

    if (insights.length === 0) {
      insights.push("All systems nominal. Hemodynamic stability confirmed.");
    }

    if (healthData.heartRate > 100 || healthData.heartRate < 60 || healthData.bpSystolic > 140) {
      if (suggestedProvider !== "Dr. Marcus Thorne") {
        setSuggestedProvider("Dr. Sarah Chen");
      }
    }

    return { 
      insights, 
      confidence: Math.max(confidence, 60),
      color: riskScore > 30 ? "text-red-500" : riskScore > 15 ? "text-amber-500" : "text-medical-blue",
      label: riskScore > 30 ? "Critical" : riskScore > 15 ? "Warning" : "Optimal"
    };
  };

  const status = getGuardianStatus();

  if (!user) {
    return <LoginPage onLoginSuccess={() => showToast("Welcome to CardioGuard AI", "success")} />;
  }

  return (
    <div className="min-h-screen medical-grid pb-24">
      {/* Header */}
      <header className="p-6 flex justify-between items-center sticky top-0 z-40 bg-medical-dark/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center glow-blue">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CardioGuard <span className="text-medical-blue">AI</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-semibold">Diagnostic Systems v4.2</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2 glass rounded-xl relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-medical-dark" />
          </button>
          <button className="p-2 glass rounded-xl">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-6xl mx-auto">
        {activeTab === 'home' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Digital Twin & Environmental Stats */}
              <div className="lg:col-span-4 space-y-6">
                <GlassCard className="p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-medical-blue to-transparent opacity-50" />
                  <DigitalTwin bpm={healthData.heartRate} risk={riskScore} />
                  
                  <div className="mt-12 w-full space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-medical-blue/20">
                          <Wind className="w-4 h-4 text-medical-blue" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Env. Stress Index</p>
                          <p className="text-lg font-bold">{healthData.stressIndex}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Air Quality</p>
                        <p className="text-xs font-bold text-emerald-500">EXCELLENT</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <Thermometer className="w-4 h-4 opacity-30 mb-2" />
                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Ambient Temp</p>
                        <p className="text-xl font-bold">{healthData.environmentTemp}°C</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <Droplets className="w-4 h-4 opacity-30 mb-2" />
                        <p className="text-[10px] uppercase tracking-wider opacity-40 font-bold">Humidity</p>
                        <p className="text-xl font-bold">45%</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <PredictiveTimeline />
                </GlassCard>
              </div>

              {/* Middle Column: Live Parameters & Charts */}
              <div className="lg:col-span-5 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Heart className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Heart Rate</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-bold">{healthData.heartRate}</h3>
                      <span className="text-xs opacity-40 font-medium">BPM</span>
                    </div>
                    <div className="mt-4 h-12">
                      <HeartPulse bpm={healthData.heartRate} />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Droplets className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-1">Oxygen Sat.</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-bold">{healthData.oxygen}</h3>
                      <span className="text-xs opacity-40 font-medium">%</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${healthData.oxygen}%` }}
                          className="h-full bg-medical-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Real-time Hemodynamics</h3>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-medical-blue" />
                        <span className="text-[10px] opacity-40 font-bold uppercase">Systolic</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span className="text-[10px] opacity-40 font-bold uppercase">Diastolic</span>
                      </div>
                    </div>
                  </div>
                  <HealthChart 
                    data={bpData} 
                    color="#3b82f6" 
                    dataKey="systolic" 
                    secondaryDataKey="diastolic"
                    secondaryColor="rgba(255,255,255,0.2)"
                  />
                </GlassCard>

                <GlassCard className="p-6 bg-gradient-to-br from-medical-blue/10 to-transparent border-medical-blue/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-medical-blue" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue">AI Guardian Status</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5", status.color)}>
                          {status.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                          Confidence: {status.confidence}%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="p-2 rounded-xl bg-medical-blue text-white hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {status.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={cn("w-1 h-1 rounded-full mt-1.5", status.color === 'text-medical-blue' ? 'bg-medical-blue' : status.color.replace('text-', 'bg-'))} />
                        <p className="text-xs font-medium opacity-80">{insight}</p>
                      </div>
                    ))}
                  </div>

                  {scanQuality && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[8px] uppercase opacity-40 mb-1">Clarity</p>
                        <p className="text-[10px] font-bold">{scanQuality.clarity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] uppercase opacity-40 mb-1">Artifacts</p>
                        <p className="text-[10px] font-bold">{scanQuality.artifacts}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] uppercase opacity-40 mb-1">Focus</p>
                        <p className="text-[10px] font-bold">{scanQuality.focus}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Right Column: Risk & Actions */}
              <div className="lg:col-span-3 space-y-6">
                <GlassCard className="p-6 text-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Cardiac Risk Score</h3>
                  <RiskScore score={riskScore} />
                  <p className="mt-6 text-[10px] opacity-40 leading-relaxed uppercase tracking-tighter">
                    Based on AI analysis of your current hemodynamics and history.
                  </p>
                </GlassCard>

                <div className="space-y-3">
                  <button 
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full group relative overflow-hidden p-4 rounded-2xl bg-white text-black font-bold flex items-center justify-between hover:pr-6 transition-all active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5" />
                      <span>AI Document Scan</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </button>

                  <button className="w-full group relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 font-bold flex items-center justify-between hover:bg-white/10 transition-all active:scale-95">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-medical-blue" />
                      <span>Guardian Sync</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-medical-blue/20 text-[8px] text-medical-blue uppercase">Live</div>
                  </button>

                  <button className="w-full group relative overflow-hidden p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-between hover:bg-red-500/20 transition-all active:scale-95">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5" />
                      <span>Emergency SOS</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Report Display */}
            <AnimatePresence>
              {aiReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6"
                >
                  <GlassCard glow="teal" className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-medical-teal">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Diagnostic Summary</span>
                      </div>
                      <button onClick={() => setAiReport(null)} className="text-[10px] uppercase opacity-50 hover:opacity-100">Dismiss</button>
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown>{aiReport}</ReactMarkdown>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : activeTab === 'oncology' ? (
          <div className="space-y-6">
            <GlassCard className="p-8 bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Microscope className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Breast Cancer Detection</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Multi-Modal AI Screening</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInfoModalOpen(true)}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Info className="w-5 h-5 text-pink-500" />
                </button>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">
                Utilize our advanced neural networks to analyze Mammography, Ultrasound, and Thermography scans with clinical precision.
              </p>
            </GlassCard>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { setOncologyMode('mammography'); setIsScannerOpen(true); }}
                className="group relative overflow-hidden p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-pink-500/20">
                    <ScanFace className="w-6 h-6 text-pink-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">Mammography Analysis</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-wider">X-Ray Neural Scan</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-all" />
              </button>

              <button 
                onClick={() => { setOncologyMode('ultrasound'); setIsScannerOpen(true); }}
                className="group relative overflow-hidden p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/20">
                    <Waves className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">Ultrasound Diagnostics</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-wider">Acoustic Imaging</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-all" />
              </button>

              <button 
                onClick={() => { setOncologyMode('thermography'); setIsScannerOpen(true); }}
                className="group relative overflow-hidden p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-orange-500/20">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold">Thermography Screening</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-wider">Infrared Angiogenesis Detection</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-all" />
              </button>
            </div>

            {aiReport && (
              <GlassCard glow="pink" className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-pink-500">
                    <Dna className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Oncology Analysis Result</span>
                  </div>
                  <button onClick={() => setAiReport(null)} className="text-[10px] uppercase opacity-50 hover:opacity-100">Dismiss</button>
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </GlassCard>
            )}
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="space-y-6">
            <GlassCard className="p-8 bg-gradient-to-br from-medical-blue/10 to-transparent border-medical-blue/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-medical-blue flex items-center justify-center shadow-lg shadow-medical-blue/20">
                  <Calendar className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Health Scheduler</h2>
                  <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">AI-Optimized Appointments</p>
                </div>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">
                Schedule follow-up consultations with specialized healthcare providers based on your latest AI health assessments.
              </p>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-medical-blue" />
                  Schedule New Consultation
                </h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user || !db) return;
                  setIsScheduling(true);
                  const formData = new FormData(e.currentTarget);
                  try {
                    await addDoc(collection(db, `users/${user.uid}/appointments`), {
                      provider: formData.get('provider'),
                      specialty: formData.get('specialty'),
                      date: formData.get('date'),
                      time: formData.get('time'),
                      type: formData.get('type'),
                      status: 'confirmed',
                      timestamp: new Date()
                    });
                    showToast("Appointment scheduled successfully", "success");
                    (e.target as HTMLFormElement).reset();
                  } catch (err) {
                    showToast("Failed to schedule appointment", "error");
                  } finally {
                    setIsScheduling(false);
                  }
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Healthcare Provider</label>
                    <select 
                      name="provider" 
                      required 
                      value={suggestedProvider}
                      onChange={(e) => setSuggestedProvider(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                    >
                      <option value="Dr. Sarah Chen" className="bg-medical-dark">Dr. Sarah Chen (Cardiologist)</option>
                      <option value="Dr. Marcus Thorne" className="bg-medical-dark">Dr. Marcus Thorne (Oncologist)</option>
                      <option value="Dr. Elena Rodriguez" className="bg-medical-dark">Dr. Elena Rodriguez (Internal Medicine)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Date</label>
                      <input type="date" name="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Time</label>
                      <input type="time" name="time" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Consultation Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                        <input type="radio" name="type" value="Virtual" defaultChecked className="text-medical-blue" />
                        <span className="text-xs">Virtual</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                        <input type="radio" name="type" value="In-Person" className="text-medical-blue" />
                        <span className="text-xs">In-Person</span>
                      </label>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isScheduling}
                    className="w-full bg-medical-blue text-white font-bold py-4 rounded-2xl glow-blue active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isScheduling ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm AI-Scheduled Slot"}
                  </button>
                </form>
              </GlassCard>

              <div className="space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-medical-teal" />
                  Upcoming Consultations
                </h3>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="p-8 text-center glass rounded-3xl opacity-30">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">No Appointments Scheduled</p>
                    </div>
                  ) : (
                    appointments.map((app) => (
                      <GlassCard key={app.id} className="p-4 border-l-4 border-medical-blue">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                              {app.provider.includes('Chen') ? '🫀' : app.provider.includes('Thorne') ? '🧬' : '🩺'}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{app.provider}</h4>
                              <p className="text-[10px] opacity-50 uppercase tracking-widest">{app.type} Consultation</p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                  <Calendar className="w-3 h-3 opacity-40" />
                                  {app.date}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                  <Clock className="w-3 h-3 opacity-40" />
                                  {app.time}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-[8px] text-emerald-500 font-bold uppercase">
                            {app.status}
                          </div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          <div className="space-y-6">
            <GlassCard className="flex flex-col items-center p-8 gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-medical-blue p-1">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.displayName || 'Health User'}</h2>
                <p className="text-sm opacity-50">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:opacity-70 transition-opacity">Sign Out</button>
            </GlassCard>

            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-medical-blue">
                <Activity className="w-5 h-5" />
                <h3 className="font-bold">Manual Health Input</h3>
              </div>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Heart Rate (BPM)</label>
                    <input 
                      type="number" 
                      value={manualInput.heartRate}
                      onChange={(e) => setManualInput({...manualInput, heartRate: e.target.value})}
                      placeholder={healthData.heartRate.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Oxygen (%)</label>
                    <input 
                      type="number" 
                      value={manualInput.oxygen}
                      onChange={(e) => setManualInput({...manualInput, oxygen: e.target.value})}
                      placeholder={healthData.oxygen.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">BP Systolic</label>
                    <input 
                      type="number" 
                      value={manualInput.bpSystolic}
                      onChange={(e) => setManualInput({...manualInput, bpSystolic: e.target.value})}
                      placeholder={healthData.bpSystolic.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">BP Diastolic</label>
                    <input 
                      type="number" 
                      value={manualInput.bpDiastolic}
                      onChange={(e) => setManualInput({...manualInput, bpDiastolic: e.target.value})}
                      placeholder={healthData.bpDiastolic.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Add Advanced Metrics</label>
                  <div className="flex flex-wrap gap-2">
                    {['Cholesterol', 'Glucose', 'HbA1c', 'BMI'].map((metric) => (
                      <button
                        key={metric}
                        type="button"
                        onClick={() => {
                          setSelectedMetrics(prev => 
                            prev.includes(metric) 
                              ? prev.filter(m => m !== metric) 
                              : [...prev, metric]
                          );
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                          selectedMetrics.includes(metric)
                            ? "bg-medical-blue border-medical-blue text-white"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                        )}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedMetrics.includes('Cholesterol') && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Cholesterol (mg/dL)</label>
                      <input 
                        type="number" 
                        value={manualInput.cholesterol}
                        onChange={(e) => setManualInput({...manualInput, cholesterol: e.target.value})}
                        placeholder={healthData.cholesterol || "e.g. 180"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  )}
                  {selectedMetrics.includes('Glucose') && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Glucose (mg/dL)</label>
                      <input 
                        type="number" 
                        value={manualInput.glucose}
                        onChange={(e) => setManualInput({...manualInput, glucose: e.target.value})}
                        placeholder={healthData.glucose || "e.g. 95"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  )}
                  {selectedMetrics.includes('HbA1c') && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">HbA1c (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={manualInput.hba1c}
                        onChange={(e) => setManualInput({...manualInput, hba1c: e.target.value})}
                        placeholder={healthData.hba1c || "e.g. 5.7"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  )}
                  {selectedMetrics.includes('BMI') && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">BMI (kg/m²)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={manualInput.bmi}
                        onChange={(e) => setManualInput({...manualInput, bmi: e.target.value})}
                        placeholder={healthData.bmi || "e.g. 22.5"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider opacity-50 ml-1">Additional Health Data / Notes</label>
                  <textarea 
                    value={manualInput.additionalNotes}
                    onChange={(e) => setManualInput({...manualInput, additionalNotes: e.target.value})}
                    placeholder="Enter any other health data (e.g., Cholesterol: 180, Glucose: 90, Daily Steps: 10000...)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-medical-blue min-h-[100px] resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-medical-blue text-white font-bold py-4 rounded-2xl glow-blue active:scale-95 transition-all"
                >
                  Update Health Profile
                </button>
              </form>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-medical-teal" />
                Connected Devices
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">⌚</div>
                    <div>
                      <p className="text-sm font-bold">Apple Watch Ultra</p>
                      <p className="text-[10px] opacity-50">Connected via HealthKit</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-medical-teal rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between p-3 glass rounded-xl opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">💍</div>
                    <div>
                      <p className="text-sm font-bold">Oura Ring Gen 3</p>
                      <p className="text-[10px] opacity-50">Not Connected</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-medical-blue uppercase tracking-widest">Connect</button>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] opacity-30">
            <Zap className="w-16 h-16 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Advanced Analytics Coming Soon</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="glass rounded-full p-2 flex justify-between items-center max-w-md mx-auto shadow-2xl">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "p-3 rounded-full transition-all flex items-center gap-2",
              activeTab === 'home' ? "bg-medical-blue text-white px-6" : "text-white/40"
            )}
          >
            <Activity className="w-6 h-6" />
            {activeTab === 'home' && <span className="text-sm font-bold">Home</span>}
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "p-3 rounded-full transition-all flex items-center gap-2",
              activeTab === 'stats' ? "bg-medical-blue text-white px-6" : "text-white/40"
            )}
          >
            <Zap className="w-6 h-6" />
            {activeTab === 'stats' && <span className="text-sm font-bold">Stats</span>}
          </button>
          <button 
            onClick={() => setActiveTab('oncology')}
            className={cn(
              "p-3 rounded-full transition-all flex items-center gap-2",
              activeTab === 'oncology' ? "bg-pink-500 text-white px-6" : "text-white/40"
            )}
          >
            <Microscope className="w-6 h-6" />
            {activeTab === 'oncology' && <span className="text-sm font-bold">Oncology</span>}
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={cn(
              "p-3 rounded-full transition-all flex items-center gap-2",
              activeTab === 'appointments' ? "bg-medical-blue text-white px-6" : "text-white/40"
            )}
          >
            <Calendar className="w-6 h-6" />
            {activeTab === 'appointments' && <span className="text-sm font-bold">Schedule</span>}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "p-3 rounded-full transition-all flex items-center gap-2",
              activeTab === 'profile' ? "bg-medical-blue text-white px-6" : "text-white/40"
            )}
          >
            <User className="w-6 h-6" />
            {activeTab === 'profile' && <span className="text-sm font-bold">Profile</span>}
          </button>
        </div>
      </nav>

      {/* Overlays */}
      <ScannerOverlay 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanComplete={handleScanComplete}
      />

      <ChatBot />

      <AnimatePresence>
        {isInfoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute inset-0 bg-medical-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/20">
                    <Info className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Modality Intelligence</h2>
                    <p className="text-xs uppercase tracking-widest opacity-50">How our AI interprets scans</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInfoModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-pink-500">
                    <ScanFace className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Mammography (X-Ray)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">AI Analysis Method</p>
                      <p className="text-xs leading-relaxed">Scans for high-density microcalcification clusters and architectural distortions using deep convolutional layers.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">Potential Findings</p>
                      <ul className="text-xs space-y-1 list-disc list-inside opacity-70">
                        <li>Spiculated masses</li>
                        <li>Pleomorphic calcifications</li>
                        <li>Asymmetric densities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Waves className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Ultrasound (Acoustic)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">AI Analysis Method</p>
                      <p className="text-xs leading-relaxed">Evaluates acoustic impedance, margin regularity, and internal echo patterns to differentiate solid vs. cystic tissue.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">Potential Findings</p>
                      <ul className="text-xs space-y-1 list-disc list-inside opacity-70">
                        <li>Hypoechoic masses</li>
                        <li>Posterior shadowing</li>
                        <li>Taller-than-wide orientation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Thermometer className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Thermography (Infrared)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">AI Analysis Method</p>
                      <p className="text-xs leading-relaxed">Detects infrared thermal asymmetry and hyper-vascularization patterns indicative of angiogenesis.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-2">Potential Findings</p>
                      <ul className="text-xs space-y-1 list-disc list-inside opacity-70">
                        <li>Focal hot spots</li>
                        <li>Vascular "delta" signs</li>
                        <li>Temp differentials &gt; 2°C</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-pink-500 flex-shrink-0" />
                <p className="text-[10px] uppercase tracking-wider leading-relaxed opacity-70">
                  Our AI models are trained on over 500,000 clinically verified scans. This tool is intended to assist clinical decision-making and does not replace professional biopsy.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
