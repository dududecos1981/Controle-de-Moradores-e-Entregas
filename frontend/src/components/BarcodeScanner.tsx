'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScanBarcode, QrCode, Camera, Zap, CheckCircle2, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { sounds } from '@/lib/SoundEffects';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  currentCode?: string;
}

export default function BarcodeScanner({ onScan, currentCode = '' }: BarcodeScannerProps) {
  const [code, setCode] = useState(currentCode);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<boolean>(false);
  const [usbScannerConnected, setUsbScannerConnected] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const keyBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Manipula código escaneado com feedback sonoro e visual
  const handleSuccessfulScan = useCallback((scannedText: string) => {
    const cleanCode = scannedText.trim();
    if (!cleanCode) return;

    setCode(cleanCode);
    setLastScannedCode(cleanCode);
    setScanFeedback(true);
    sounds.playBarcodeBeep();
    onScan(cleanCode);

    setTimeout(() => {
      setScanFeedback(false);
    }, 1500);
  }, [onScan]);

  // Listener global para Leitores de Código de Barras USB / Teclado Wedge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora digitação em inputs/textareas normais se não for rápida o suficiente
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Leitores USB enviam caracteres em alta velocidade (< 40ms entre teclas)
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

  // Inicia câmera para leitura visual
  const startCameraScanner = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Câmera para scanner indisponível:', err);
    }
  };

  const stopCameraScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Simulação de leitura de teste
  const simulateBarcodePreset = (preset: string) => {
    handleSuccessfulScan(preset);
  };

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Cabeçalho do Scanner */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ScanBarcode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Leitor Óptico / QR Code
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Leitor USB Ativo
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Aproxime o leitor USB ou use a câmera para escanear a etiqueta
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isCameraActive ? stopCameraScanner() : startCameraScanner())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isCameraActive
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {isCameraActive ? 'Fechar Câmera' : 'Usar Câmera'}
        </button>
      </div>

      {/* Câmera de Leitura Óptica */}
      {isCameraActive && (
        <div className="relative aspect-video w-full max-w-sm mx-auto bg-slate-950 rounded-xl overflow-hidden border-2 border-indigo-500/50 mb-4 shadow-lg shadow-indigo-500/10">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          {/* Mira de Escaneamento e Linha Laser Animada */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-48 h-32 border-2 border-cyan-400 rounded-lg relative overflow-hidden bg-cyan-400/5">
              {/* Linha laser de scan */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scan-line" />
            </div>
            <span className="text-[11px] font-medium text-cyan-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full mt-2 backdrop-blur-sm">
              Posicione o código de barras ou QR Code
            </span>
          </div>
        </div>
      )}

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
            placeholder="Aguardando bipagem ou digite o código..."
            className={`w-full bg-slate-950/80 text-white font-mono text-sm tracking-wider px-4 py-3 rounded-xl border outline-none transition-all ${
              scanFeedback
                ? 'border-emerald-400 ring-2 ring-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {scanFeedback ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Lido!
              </span>
            ) : (
              <QrCode className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {/* Presets Rápidos para Demonstração e Testes */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-2">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Códigos de Teste Rápido:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '📦 Amazon (AMZ-889)', val: 'PKG-AMZ-2026-88941' },
            { label: '⚡ Mercado Livre (MLB)', val: 'PKG-ML-2026-99214' },
            { label: '🛍️ Shopee Express', val: 'PKG-SHP-2026-33100' },
            { label: '📬 Sedex Correios', val: 'BR9876543210BR' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => simulateBarcodePreset(item.val)}
              className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
