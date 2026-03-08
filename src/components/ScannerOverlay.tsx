import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, ShieldCheck, Upload, Beaker } from 'lucide-react';
import { SAMPLE_REPORTS } from '../constants/testData';

interface ScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (imageData: string, mimeType: string) => void;
}

export const ScannerOverlay = ({ isOpen, onClose, onScanComplete }: ScannerOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSamples, setShowSamples] = React.useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("pdf") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                const mimeType = result.split(';')[0].split(':')[1];
                const base64Data = result.split(',')[1];
                onScanComplete(base64Data, mimeType);
                onClose();
              };
              reader.readAsDataURL(file);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, onScanComplete, onClose]);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [isOpen]);

  const handleScan = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Target a reasonable resolution for AI analysis (max 1024px)
      const maxDim = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        // Use a lower quality to reduce payload size and prevent XHR errors
        const imageData = canvas.toDataURL('image/jpeg', 0.6);
        const base64Data = imageData.split(',')[1];
        
        setTimeout(() => {
          onScanComplete(base64Data, 'image/jpeg');
          onClose();
        }, 500);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const base64Data = result.split(',')[1];
        
        // If it's a large file, we should ideally resize it here too
        // For now, let's just pass it through with the correct mime type
        onScanComplete(base64Data, mimeType);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        >
          <canvas ref={canvasRef} className="hidden" />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*,.pdf" 
            className="hidden" 
          />
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
            <div className="w-full flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest">Live Scanner Active</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSamples(!showSamples)} 
                  className="p-2 glass rounded-full flex items-center gap-2 px-4 text-amber-400 border-amber-400/30"
                >
                  <Beaker className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Test Data</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 glass rounded-full flex items-center gap-2 px-4"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                </button>
                <button onClick={onClose} className="p-2 glass rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSamples && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute top-24 left-8 right-8 z-30 glass p-6 rounded-3xl border-white/10"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Select Test Scenario</h3>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {SAMPLE_REPORTS.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => {
                          // Convert text to base64 for the scan complete handler
                          const base64 = btoa(sample.content);
                          onScanComplete(base64, 'text/plain');
                          onClose();
                        }}
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-bold">{sample.name}</p>
                          <p className="text-[10px] opacity-40 uppercase tracking-tighter">{sample.type} Analysis</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-medical-blue/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <ShieldCheck className="w-4 h-4 text-medical-blue" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative w-72 h-72">
              <div className="absolute inset-0 border-2 border-medical-blue/50 rounded-3xl" />
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-medical-blue shadow-[0_0_15px_rgba(14,165,233,0.8)] z-20"
              />
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-medical-blue" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-medical-blue" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-medical-blue" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-medical-blue" />
            </div>

            <div className="w-full flex flex-col items-center gap-6">
              <p className="text-center text-sm opacity-70 max-w-[250px]">
                Align your medical report or prescription within the frame, upload a file, or paste from clipboard
              </p>
              <button
                onClick={handleScan}
                className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full bg-white group-hover:scale-90 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
