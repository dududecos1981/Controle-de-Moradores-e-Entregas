'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureDone: (signatureDataUrl: string) => void;
  width?: number;
  height?: number;
}

export default function SignatureCanvas({
  onSignatureDone,
  width = 320,
  height = 140,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      onSignatureDone(canvasRef.current.toDataURL('image/webp', 0.8));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureDone('');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full bg-slate-950 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[140px] cursor-crosshair block"
        />

        {/* Linha guia de assinatura */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-slate-700 pointer-events-none flex justify-between">
          <span className="text-[10px] text-slate-500 pb-0.5">Assine com o dedo ou caneta touch</span>
          <PenTool className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>

      {/* Ações da Assinatura */}
      <div className="flex items-center justify-between w-full mt-2 px-1">
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar Assinatura
        </button>

        {hasSignature && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            Assinatura Capturada
          </span>
        )}
      </div>
    </div>
  );
}
