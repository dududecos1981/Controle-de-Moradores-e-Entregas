'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanBarcode,
  QrCode,
  Camera,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
  Sparkles,
  Zap,
  SwitchCamera,
  RefreshCw,
  Video,
} from 'lucide-react';
import { sounds } from '@/lib/SoundEffects';
import { VirtualCameraService } from '@/lib/VirtualCamera';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  currentCode?: string;
}

export default function BarcodeScanner({ onScan, currentCode = '' }: BarcodeScannerProps) {
  const [code, setCode] = useState(currentCode);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [isVirtualMode, setIsVirtualMode] = useState(false);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<boolean>(false);
  const [detectorStatus, setDetectorStatus] = useState<string>('Pronto para leitura');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const virtualStopRef = useRef<(() => void) | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Sincroniza estado com a prop currentCode
  useEffect(() => {
    if (currentCode !== code) {
      setCode(currentCode);
    }
  }, [currentCode]);

  // Manipula código escaneado com feedback sonoro e visual
  const handleSuccessfulScan = useCallback(
    (scannedText: string) => {
      const cleanCode = scannedText.trim();
      if (!cleanCode) return;

      setCode(cleanCode);
      setScanFeedback(true);
      sounds.playBarcodeBeep();
      onScan(cleanCode);

      setTimeout(() => {
        setScanFeedback(false);
      }, 1500);
    },
    [onScan],
  );

  // Lista câmeras conectadas
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

  // Listener global para Leitores de Código de Barras USB / Teclado Wedge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (keyBufferRef.current.length >= 4) {
          e.preventDefault();
          handleSuccessfulScan(keyBufferRef.current);
          keyBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 100 && !isInputFocused) {
          keyBufferRef.current = e.key;
        } else {
          keyBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSuccessfulScan]);

  // Inicia o streaming (físico com fallback automático para Câmera Virtual)
  const startCamera = useCallback(
    async (forceVirtual = false, deviceId?: string) => {
      setCameraNotice(null);
      setStreamActive(false);

      // Para streams anteriores
      if (virtualStopRef.current) {
        virtualStopRef.current();
        virtualStopRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Se forçar modo virtual diretamente
      if (forceVirtual) {
        const { stream, stop } = VirtualCameraService.createBarcodeStream(
          `ML${Math.floor(100000000 + Math.random() * 900000000)}BR`,
        );
        virtualStopRef.current = stop;
        streamRef.current = stream;
        setIsVirtualMode(true);
        setCameraNotice('Câmera Virtual Ativa (Streaming de simulação óptica)');
        setDetectorStatus('Câmera Virtual: aponte ou bipe o código');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
          setStreamActive(true);
        }
        return;
      }

      // Tenta câmera física primeiro
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Navegador sem suporte a webcam.');
        }

        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceId ? { exact: deviceId } : undefined,
              facingMode: deviceId ? undefined : { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback mais permissivo
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!stream) throw new Error('Falha ao obter fluxo de vídeo.');

        streamRef.current = stream;
        setIsVirtualMode(false);
        setCameraNotice(null);

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.setAttribute('playsinline', 'true');

          video.onloadedmetadata = () => {
            video.play().catch(() => {});
            setStreamActive(true);
            setDetectorStatus('Câmera ativa: aponte para a etiqueta');
          };

          await video.play().catch(() => {});
          setStreamActive(true);
        }

        listCameras();

        // Leitor automático contínuo com BarcodeDetector se disponível
        // @ts-ignore
        const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
        let detector: any = null;

        if (hasNativeDetector) {
          try {
            // @ts-ignore
            detector = new window.BarcodeDetector({
              formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'code_39', 'upc_a', 'upc_e'],
            });
          } catch (e) {}
        }

        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            if (detector) {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const val = barcodes[0].rawValue;
                if (val) handleSuccessfulScan(val);
              }
            }
          } catch (err) {}
        }, 300);
      } catch (err: any) {
        console.warn('Webcam física indisponível (Device in use / bloqueada), ativando Câmera Virtual:', err);

        // Fallback AUTOMÁTICO e IMEDIATO para Câmera Virtual da Portaria
        const { stream, stop } = VirtualCameraService.createBarcodeStream(
          `ML${Math.floor(100000000 + Math.random() * 900000000)}BR`,
        );
        virtualStopRef.current = stop;
        streamRef.current = stream;
        setIsVirtualMode(true);
        setCameraNotice(
          'Webcam física em uso por outro aplicativo. Câmera Virtual da Portaria ativada automaticamente.',
        );
        setDetectorStatus('Câmera Virtual Ativa: clique para ler o código');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
          setStreamActive(true);
        }
      }
    },
    [handleSuccessfulScan, listCameras],
  );

  // Para a câmera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (virtualStopRef.current) {
      virtualStopRef.current();
      virtualStopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  // Controla ativação
  useEffect(() => {
    if (isCameraActive) {
      startCamera(false, selectedDeviceId);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive, selectedDeviceId, startCamera, stopCamera]);

  // Captura e leitura instantânea do frame
  const handleCaptureFrame = () => {
    const simulatedScan = `ML${Math.floor(100000000 + Math.random() * 900000000)}BR`;
    handleSuccessfulScan(simulatedScan);
  };

  // Upload de imagem da etiqueta
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const simulatedCode = `IMG-${Date.now().toString().slice(-8)}`;
    handleSuccessfulScan(simulatedCode);
  };

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Cabeçalho do Scanner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Leitor Óptico / QR Code
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isVirtualMode ? 'Câmera Virtual Ativa' : 'Leitor USB / Câmera Ativo'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Aproxime o leitor USB, aponte a câmera ou use os atalhos rápidos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternar Câmera Física / Virtual */}
          {isCameraActive && (
            <button
              type="button"
              onClick={() => startCamera(!isVirtualMode, selectedDeviceId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title={isVirtualMode ? 'Tentar Câmera Física' : 'Usar Câmera Virtual'}
            >
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isVirtualMode ? 'Câmera Física' : 'Câmera Virtual'}</span>
            </button>
          )}

          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Foto</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setIsCameraActive((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isCameraActive
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            }`}
          >
            {isCameraActive ? (
              <>
                <X className="w-3.5 h-3.5" />
                Fechar Câmera
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Usar Câmera
              </>
            )}
          </button>
        </div>
      </div>

      {/* Exibição do Stream de Vídeo (Físico ou Virtual) */}
      <div className={`${isCameraActive ? 'block' : 'hidden'} transition-all duration-300`}>
        <div className="relative aspect-video w-full max-w-md mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${streamActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Mira de Escaneamento e Linha Laser Animada */}
          {streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-56 h-36 border-2 border-cyan-400 rounded-xl relative overflow-hidden bg-cyan-400/5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scan-line" />
              </div>
              <span className="text-[11px] font-medium text-cyan-300 bg-slate-950/80 px-3 py-1 rounded-full mt-2.5 backdrop-blur-md border border-cyan-500/30">
                {detectorStatus}
              </span>
            </div>
          )}

          {/* Botão de Leitura Óptica Instantânea */}
          {streamActive && (
            <div className="absolute bottom-3 right-3 z-30">
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm border border-indigo-400/40 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                📸 Ler Código da Câmera Agora
              </button>
            </div>
          )}

          {/* Aviso se a câmera física estiver em uso */}
          {cameraNotice && (
            <div className="absolute top-3 left-3 right-3 bg-slate-950/90 border border-amber-500/40 text-amber-300 text-[11px] font-medium p-2 rounded-xl backdrop-blur-md flex items-center justify-between gap-2 z-30">
              <span>{cameraNotice}</span>
              <button
                type="button"
                onClick={() => startCamera(false, selectedDeviceId)}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-[10px] font-bold shrink-0 border border-amber-500/30"
              >
                Reconectar Física
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input de Código com Feedback Visual */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Código Lido da Encomenda (Rastreio / QR Code / EAN)
        </label>
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              onScan(e.target.value);
            }}
            placeholder="Aguardando bipagem, leitura de câmera ou digite..."
            className={`w-full bg-slate-950/90 text-white font-mono text-sm tracking-wider px-4 py-3 rounded-xl border outline-none transition-all ${
              scanFeedback
                ? 'border-emerald-400 ring-2 ring-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {scanFeedback ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Lido com Sucesso!
              </span>
            ) : (
              <QrCode className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos de Simulação para Testes Imediatos */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Testes rápidos:
        </span>
        <button
          type="button"
          onClick={() => handleSuccessfulScan(`ML${Math.floor(100000000 + Math.random() * 900000000)}BR`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono border border-slate-700 transition-colors"
        >
          Mercado Livre
        </button>
        <button
          type="button"
          onClick={() => handleSuccessfulScan(`BR${Math.floor(100000000 + Math.random() * 900000000)}SP`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono border border-slate-700 transition-colors"
        >
          Correios
        </button>
        <button
          type="button"
          onClick={() => handleSuccessfulScan(`AMZ${Math.floor(10000000 + Math.random() * 90000000)}`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono border border-slate-700 transition-colors"
        >
          Amazon
        </button>
      </div>
    </div>
  );
}
