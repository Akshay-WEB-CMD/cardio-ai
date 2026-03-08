import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, LogIn } from 'lucide-react';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { GlassCard } from './GlassCard';
import { AlertTriangle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth) {
      alert("Firebase is not configured. Please add your VITE_FIREBASE_* keys in the Secrets panel.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to sign in. Please check your Firebase configuration in the Secrets panel.");
    }
  };

  return (
    <div className="min-h-screen medical-grid flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-medical-blue flex items-center justify-center glow-blue">
            <ShieldCheck className="text-white w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">CardioGuard <span className="text-medical-blue">AI</span></h1>
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 font-semibold mt-2">Next-Gen Cardiac Protection</p>
          </div>
        </div>

        <GlassCard className="p-8 space-y-6">
          {!isFirebaseConfigured && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-yellow-500 uppercase">Configuration Required</p>
                <p className="text-[10px] opacity-70 leading-tight">Please set your Firebase API keys in the Secrets panel to enable authentication and data syncing.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-sm opacity-60">Sign in to access your AI-powered health dashboard and real-time monitoring.</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={!isFirebaseConfigured}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-medical-dark px-2 opacity-40">Secure Access</span></div>
          </div>

          <p className="text-[10px] opacity-40 leading-relaxed">
            By continuing, you agree to CardioGuard AI's Terms of Service and Privacy Policy. Your medical data is encrypted and protected.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};
