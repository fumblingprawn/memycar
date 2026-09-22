'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, CameraOff, Loader2 } from 'lucide-react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera access denied or unavailable. Please upload an image file instead.');
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

  if (!isOpen) return null;

  const renderWireframe = () => {
    switch (slotKey) {
      case 'front_three_quarter':
        return (
          <svg className="w-full h-full text-white/80" viewBox="0 0 600 350" fill="none" stroke="currentColor">
            <path strokeWidth="3" strokeDasharray="8 6" d="M120 220 L160 140 L280 100 L420 120 L520 180 L540 240 L480 270 L140 270 Z" />
            <circle cx="180" cy="270" r="38" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="460" cy="270" r="38" strokeWidth="3" strokeDasharray="6 4" />
            <path strokeWidth="2" strokeDasharray="4 4" d="M280 105 L260 180 L140 210 M260 180 L480 180" />
            <text x="50%" y="30" fill="currentColor" textAnchor="middle" fontSize="16" letterSpacing="1">
              ALIGN FRONT 3/4 (DRIVER + NOSE)
            </text>
          </svg>
        );
      case 'rear_three_quarter':
        return (
          <svg className="w-full h-full text-white/80" viewBox="0 0 600 350" fill="none" stroke="currentColor">
            <path strokeWidth="3" strokeDasharray="8 6" d="M80 180 L180 120 L320 100 L440 140 L480 220 L460 270 L120 270 Z" />
            <circle cx="140" cy="270" r="38" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="420" cy="270" r="38" strokeWidth="3" strokeDasharray="6 4" />
            <path strokeWidth="2" strokeDasharray="4 4" d="M320 105 L340 180 L460 210 M120 180 L340 180" />
            <text x="50%" y="30" fill="currentColor" textAnchor="middle" fontSize="16" letterSpacing="1">
              ALIGN REAR 3/4 (TAIL + PASSENGER)
            </text>
          </svg>
        );
      case 'side_profile':
        return (
          <svg className="w-full h-full text-white/80" viewBox="0 0 600 350" fill="none" stroke="currentColor">
            <path strokeWidth="3" strokeDasharray="8 6" d="M60 230 L100 180 L190 130 L390 130 L490 190 L550 230 L540 270 L60 270 Z" />
            <circle cx="145" cy="270" r="42" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="465" cy="270" r="42" strokeWidth="3" strokeDasharray="6 4" />
            <text x="50%" y="30" fill="currentColor" textAnchor="middle" fontSize="16" letterSpacing="1">
              ALIGN FULL SIDE PROFILE (LEVEL)
            </text>
          </svg>
        );
      case 'interior_dash':
        return (
          <svg className="w-full h-full text-white/80" viewBox="0 0 600 350" fill="none" stroke="currentColor">
            <circle cx="210" cy="200" r="75" strokeWidth="3" strokeDasharray="8 6" />
            <rect x="330" y="140" width="160" height="110" rx="12" strokeWidth="3" strokeDasharray="6 4" />
            <path strokeWidth="2" strokeDasharray="4 4" d="M80 180 L520 180" />
            <text x="50%" y="30" fill="currentColor" textAnchor="middle" fontSize="16" letterSpacing="1">
              FRAME STEERING WHEEL & CENTER CONSOLE
            </text>
          </svg>
        );
      case 'odometer':
      default:
        return (
          <svg className="w-full h-full text-white/80" viewBox="0 0 600 350" fill="none" stroke="currentColor">
            <rect x="150" y="100" width="300" height="150" rx="16" strokeWidth="3" strokeDasharray="8 6" />
            <path strokeWidth="2" strokeDasharray="4 4" d="M200 175 L400 175" />
            <text x="50%" y="30" fill="currentColor" textAnchor="middle" fontSize="16" letterSpacing="1">
              FOCUS DIGITS / INSTRUMENT CLUSTER
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-10">
        <span className="text-white text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {slotKey.replace(/_/g, ' ')}
        </span>
        <button
          type="button"
          onClick={() => {
            cleanupCamera();
            onClose();
          }}
          className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewfinder Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-6 bg-red-950/80 border border-red-500 rounded-2xl max-w-sm text-red-200">
            <CameraOff className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-xs mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                cleanupCamera();
                onClose();
              }}
              className="bg-white text-slate-900 px-4 py-1.5 rounded-xl font-bold text-xs"
            >
              Use Manual Upload
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-4 sm:inset-12 pointer-events-none flex items-center justify-center">
              {renderWireframe()}
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Bar: Shutter */}
      <div className="p-6 flex items-center justify-center bg-black/40 backdrop-blur-md">
        <button
          type="button"
          disabled={capturing || !!error}
          onClick={captureImage}
          className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center bg-[#e03a14] active:scale-95 transition disabled:opacity-50"
        >
          {capturing ? (
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
