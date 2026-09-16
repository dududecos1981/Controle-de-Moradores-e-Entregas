'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Check, X, AlertCircle, SwitchCamera } from 'lucide-react';
import { sounds } from '@/lib/SoundEffects';

interface WebcamCaptureProps {
  onPhotoCaptured: (photoDataUrl: string) => void;
  currentPhotoUrl?: string;
}

export default function WebcamCapture({ onPhotoCaptured, currentPhotoUrl }: WebcamCaptureProps) {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [streamActive, setStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(currentPhotoUrl || null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lista câmeras disponíveis
  const listCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Erro ao listar dispositivos:', err);
    }
  }, [selectedDeviceId]);

  // Inicia o stream da webcam
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Webcam não suportada pelo navegador.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }

      listCameras();
    } catch (err: any) {
      console.error('Falha ao iniciar câmera:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Permita o acesso nas configurações do navegador ou use o upload manual.'
          : `Não foi possível acessar a webcam: ${err.message || 'Dispositivo ocupado'}`,
      );
      setStreamActive(false);
    }
  }, [listCameras]);

  // Para o stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  useEffect(() => {
    if (mode === 'camera' && !capturedPhoto) {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, capturedPhoto, selectedDeviceId, startCamera, stopCamera]);

  // Tira a foto instantânea com flash e som
  const triggerCapture = () => {
    if (!videoRef.current) return;

    // Flash visual
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Som de obturador
    sounds.playCameraShutter();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Espelha para ficar natural se câmera frontal
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/webp', 0.9);
      setCapturedPhoto(dataUrl);
      onPhotoCaptured(dataUrl);
      stopCamera();
    }
  };

  // Captura com contagem regressiva de 3 segundos
  const captureWithTimer = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          triggerCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Upload manual de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedPhoto(dataUrl);
        onPhotoCaptured(dataUrl);
        sounds.playCameraShutter();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setMode('camera');
    setTimeout(() => startCamera(selectedDeviceId), 100);
  };

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Abas de Modo */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('camera');
              if (capturedPhoto) setCapturedPhoto(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'camera'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Webcam Portaria
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              stopCamera();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Enviar Imagem
          </button>
        </div>

        {/* Alternador de Câmera */}
        {mode === 'camera' && availableDevices.length > 1 && !capturedPhoto && (
          <div className="flex items-center gap-1.5">
            <SwitchCamera className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                startCamera(e.target.value);
              }}
              className="bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700 px-2 py-1 outline-none focus:border-indigo-500"
            >
              {availableDevices.map((device, i) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Câmera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Área de Visualização e Captura */}
      <div className="relative aspect-video w-full max-w-md mx-auto bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
        {/* Flash Effect */}
        {isFlashing && <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />}

        {/* Foto já capturada */}
        {capturedPhoto ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedPhoto} alt="Foto Capturada" className="w-full h-full object-cover" />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30">
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg backdrop-blur-sm border border-slate-700 shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tirar Outra
              </button>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/90 text-white text-xs font-semibold rounded-lg shadow-lg">
                <Check className="w-3.5 h-3.5" />
                Foto Pronta
              </div>
            </div>
          </div>
        ) : mode === 'camera' ? (
          <>
            {/* Elemento de Vídeo */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                streamActive ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Guia biométrica facial na tela */}
            {streamActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-40 h-52 border-2 border-dashed border-indigo-400/60 rounded-full flex items-center justify-center">
                  <div className="w-full h-px bg-indigo-500/20" />
                </div>
                <span className="text-[11px] font-medium text-indigo-300/80 bg-slate-950/70 px-2.5 py-0.5 rounded-full mt-2 backdrop-blur-sm">
                  Alinhe o rosto na moldura
                </span>
              </div>
            )}

            {/* Contador Regressivo */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-30">
                <span className="text-7xl font-black text-white animate-bounce drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
                  {countdown}
                </span>
              </div>
            )}

            {/* Estado Sem Câmera / Erro */}
            {!streamActive && (
              <div className="p-6 text-center">
                {cameraError ? (
                  <div className="flex flex-col items-center text-rose-400">
                    <AlertCircle className="w-10 h-10 mb-2" />
                    <p className="text-xs max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(selectedDeviceId)}
                      className="mt-3 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Camera className="w-10 h-10 mb-2 animate-pulse" />
                    <p className="text-xs">Conectando à câmera da portaria...</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Modo de Upload de Arquivo */
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-900/50 transition-colors p-6">
            <Upload className="w-10 h-10 text-indigo-400 mb-2" />
            <span className="text-sm font-semibold text-slate-200">Clique para selecionar uma foto</span>
            <span className="text-xs text-slate-500 mt-1">PNG, JPG ou WebP (máx 5MB)</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Botões de Ação para Captura */}
      {mode === 'camera' && !capturedPhoto && streamActive && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={triggerCapture}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            Capturar Foto Agora
          </button>
          <button
            type="button"
            onClick={captureWithTimer}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all"
            title="Temporizador de 3 segundos"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            3s
          </button>
        </div>
      )}
    </div>
  );
}
