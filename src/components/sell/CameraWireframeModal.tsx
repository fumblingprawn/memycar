'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, CameraOff, Loader2, RefreshCw } from 'lucide-react';
import { PhotoSlotKey } from '@/types/listing';

interface CameraWireframeModalProps {
  slotKey: PhotoSlotKey;
  isOpen: boolean;
  onClose: () => void;
  onImageCapture: (imageBlob: Blob) => void;
}

export default function CameraWireframeModal({
  slotKey,
  isOpen,
  onClose,
  onImageCapture,
}: CameraWireframeModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const initCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    // Check mediaDevices support
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Live camera viewfinder is not supported on this browser. Use standard camera capture.');
      setIsInitializing(false);
      return;
    }

    try {
      // Primary: Environment / Back camera with flexible mobile constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Auto-play blocked:', e));
        };
      }
    } catch (primaryErr) {
      console.warn('Environment camera failed, trying fallback video constraints:', primaryErr);
      try {
        // Fallback: Generic video stream (handles laptops/front cams or restricted environments)
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => console.warn('Fallback play blocked:', e));
          };
        }
      } catch (fallbackErr: any) {
        console.error('All camera attempts failed:', fallbackErr);
        setError('Camera permission denied or camera in use by another app.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      initCamera();
    } else {
      cleanupCamera();
    }
    return () => {
      cleanupCamera();
    };
  }, [isOpen, initCamera, cleanupCamera]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    try {
      setCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onImageCapture(blob);
          }
          setCapturing(false);
          cleanupCamera();
          onClose();
        },
        'image/webp',
        0.92
      );
    } catch (err) {
      console.error('Capture failed:', err);
      setCapturing(false);
    }
  };

  const handleNativeCameraFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file);
      cleanupCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Realistic Car Silhouette Vector Overlays
  const renderCarSilhouette = () => {
    switch (slotKey) {
      case 'front_three_quarter':
        return (
          <svg className="w-full h-full max-h-[80vh] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" viewBox="0 0 800 500" fill="none" stroke="currentColor">
            {/* Front 3/4 Perspective Silhouette */}
            <path strokeWidth="3" strokeDasharray="8 6" d="
              M 110,340 
              C 120,320 150,305 180,305 
              C 210,305 240,320 250,345 
              L 540,345 
              C 550,310 590,290 635,290 
              C 680,290 715,315 725,350 
              L 750,340 
              C 765,315 760,270 710,250 
              L 580,230 
              L 470,140 
              C 450,125 360,125 300,140 
              L 190,230 
              C 130,240 90,270 85,305 
              C 80,335 95,340 110,340 Z
            " />
            {/* Wheels & Arches */}
            <circle cx="180" cy="355" r="50" strokeWidth="3.5" strokeDasharray="6 4" />
            <circle cx="635" cy="340" r="45" strokeWidth="3.5" strokeDasharray="6 4" />
            {/* Windshield & Greenhouse Pillar */}
            <path strokeWidth="2.5" strokeDasharray="5 5" d="M 300,140 L 470,140 L 450,230 L 220,230 Z" />
            <path strokeWidth="2" strokeDasharray="4 4" d="M 320,140 L 305,230" />
            {/* Headlights & Grille alignment guide */}
            <path strokeWidth="2" strokeDasharray="4 4" d="M 110,285 C 140,280 180,275 220,270" />
            <text x="50%" y="60" fill="currentColor" textAnchor="middle" fontSize="18" fontWeight="bold" letterSpacing="1">
              ALIGN FRONT 3/4 (DRIVER + HOOD)
            </text>
          </svg>
        );

      case 'rear_three_quarter':
        return (
          <svg className="w-full h-full max-h-[80vh] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" viewBox="0 0 800 500" fill="none" stroke="currentColor">
            {/* Rear 3/4 Perspective Silhouette */}
            <path strokeWidth="3" strokeDasharray="8 6" d="
              M 700,340 
              C 690,320 660,305 630,305 
              C 600,305 570,320 560,345 
              L 270,345 
              C 260,310 220,290 175,290 
              C 130,290 95,315 85,350 
              L 60,340 
              C 45,315 50,270 100,250 
              L 230,230 
              L 340,140 
              C 360,125 450,125 510,140 
              L 620,230 
              C 680,240 720,270 725,305 
              C 730,335 715,340 700,340 Z
            " />
            <circle cx="630" cy="355" r="50" strokeWidth="3.5" strokeDasharray="6 4" />
            <circle cx="175" cy="340" r="45" strokeWidth="3.5" strokeDasharray="6 4" />
            <path strokeWidth="2.5" strokeDasharray="5 5" d="M 510,140 L 340,140 L 360,230 L 590,230 Z" />
            <text x="50%" y="60" fill="currentColor" textAnchor="middle" fontSize="18" fontWeight="bold" letterSpacing="1">
              ALIGN REAR 3/4 (TAILLIGHTS + TRUNK)
            </text>
          </svg>
        );

      case 'side_profile':
        return (
          <svg className="w-full h-full max-h-[80vh] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" viewBox="0 0 800 500" fill="none" stroke="currentColor">
            {/* Level Ground Side Silhouette */}
            <path strokeWidth="3" strokeDasharray="8 6" d="
              M 60,360 
              L 120,360 
              C 130,305 180,275 240,275 
              C 300,275 350,305 360,360 
              L 540,360 
              C 550,305 600,275 660,275 
              C 720,275 770,305 780,360 
              L 790,360 
              C 795,310 770,250 720,230 
              L 560,210 
              L 460,110 
              C 430,95 320,95 260,115 
              L 160,210 
              L 70,240 
              C 40,265 40,320 60,360 Z
            " />
            {/* Wheels */}
            <circle cx="240" cy="355" r="55" strokeWidth="3.5" strokeDasharray="6 4" />
            <circle cx="660" cy="355" r="55" strokeWidth="3.5" strokeDasharray="6 4" />
            {/* Windows / Pillars */}
            <path strokeWidth="2.5" strokeDasharray="5 5" d="M 270,125 L 440,125 L 530,205 L 185,205 Z" />
            <line x1="365" y1="125" x2="365" y2="205" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50%" y="60" fill="currentColor" textAnchor="middle" fontSize="18" fontWeight="bold" letterSpacing="1">
              ALIGN FULL SIDE PROFILE (LEVEL)
            </text>
          </svg>
        );

      case 'interior_dash':
        return (
          <svg className="w-full h-full max-h-[80vh] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" viewBox="0 0 800 500" fill="none" stroke="currentColor">
            {/* Steering Wheel Oval & Hub */}
            <ellipse cx="260" cy="300" rx="100" ry="115" strokeWidth="3.5" strokeDasharray="8 6" />
            <circle cx="260" cy="300" r="35" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="160" y1="300" x2="225" y2="300" strokeWidth="2.5" strokeDasharray="4 4" />
            <line x1="295" y1="300" x2="360" y2="300" strokeWidth="2.5" strokeDasharray="4 4" />
            {/* Center Console Screen & Dashboard Contour */}
            <rect x="420" y="210" width="220" height="150" rx="14" strokeWidth="3" strokeDasharray="6 4" />
            <path strokeWidth="2.5" strokeDasharray="6 4" d="M 80,240 C 200,210 380,180 720,200" />
            <text x="50%" y="60" fill="currentColor" textAnchor="middle" fontSize="18" fontWeight="bold" letterSpacing="1">
              FRAME COCKPIT (STEERING + CENTER SCREEN)
            </text>
          </svg>
        );

      case 'odometer':
      default:
        return (
          <svg className="w-full h-full max-h-[80vh] text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" viewBox="0 0 800 500" fill="none" stroke="currentColor">
            {/* Cluster Display Housing & Gauges */}
            <rect x="160" y="140" width="480" height="240" rx="28" strokeWidth="3.5" strokeDasharray="8 6" />
            <circle cx="280" cy="260" r="65" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="520" cy="260" r="65" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="360" y="270" width="80" height="40" rx="6" strokeWidth="2" strokeDasharray="3 3" />
            <text x="50%" y="60" fill="currentColor" textAnchor="middle" fontSize="18" fontWeight="bold" letterSpacing="1">
              FOCUS ODOMETER / DIGITAL MILEAGE
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-white text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
          {slotKey.replace(/_/g, ' ')}
        </span>
        <button
          type="button"
          onClick={() => {
            cleanupCamera();
            onClose();
          }}
          className="text-white p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewfinder Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {isInitializing ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-[#e03a14]" />
            <span className="text-xs font-medium">Opening camera...</span>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-slate-900/90 border border-slate-700 rounded-3xl max-w-sm mx-4 text-slate-200 shadow-2xl">
            <CameraOff className="w-10 h-10 mx-auto mb-3 text-amber-400" />
            <h3 className="text-sm font-bold text-white mb-1">Camera Stream Unavailable</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">{error}</p>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white py-3 rounded-xl font-bold text-xs shadow-md transition"
              >
                Open Device Camera App
              </button>
              <button
                type="button"
                onClick={initCamera}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Permission
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleNativeCameraFallback}
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Wireframe Silhouette Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
              {renderCarSilhouette()}
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="p-6 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
        {!error && !isInitializing && (
          <button
            type="button"
            disabled={capturing}
            onClick={captureImage}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-[#e03a14] hover:bg-[#c53210] active:scale-90 transition-transform shadow-2xl disabled:opacity-50"
          >
            {capturing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Camera className="w-7 h-7 text-[#e03a14]" />
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
