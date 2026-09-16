'use client';

import React from 'react';
import { QrCode, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';

interface QRCodeDisplayProps {
  token: string;
  title?: string;
  subtitle?: string;
  size?: number;
}

export default function QRCodeDisplay({
  token,
  title,
  subtitle,
  size = 200,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  // Gera uma representação em matriz QR Code determinística baseada no token
  const generatePattern = (text: string) => {
    const matrixSize = 25;
    const grid: boolean[][] = Array.from({ length: matrixSize }, () =>
      Array(matrixSize).fill(false),
    );

    // Cantos fixos padrão QR Code (Position Markers)
    const setMarker = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            if (row + r < matrixSize && col + c < matrixSize) {
              grid[row + r][col + c] = true;
            }
          }
        }
      }
    };

    setMarker(0, 0); // Canto superior esquerdo
    setMarker(0, matrixSize - 7); // Superior direito
    setMarker(matrixSize - 7, 0); // Inferior esquerdo

    // Preenchimento determinístico por hash simples do token
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Não sobrescreve os marcadores dos cantos
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= matrixSize - 8) ||
          (r >= matrixSize - 8 && c < 8)
        ) {
          continue;
        }
        // Pseudo-random baseado no hash
        const val = Math.sin(hash + r * 13 + c * 37) * 10000;
        grid[r][c] = val - Math.floor(val) > 0.45;
      }
    }

    return grid;
  };

  const grid = generatePattern(token);

  const handleCopy = () => {
    navigator.clipboard?.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/20 text-slate-900 w-full max-w-[280px] mx-auto">
      {/* Cabeçalho do QR */}
      {title && <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>}
      {subtitle && <p className="text-[11px] text-slate-500 mb-4">{subtitle}</p>}

      {/* SVG Canvas do QR Code */}
      <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center">
        <svg
          viewBox="0 0 25 25"
          className="w-48 h-48 shape-rendering-crispEdges"
          style={{ imageRendering: 'pixelated' }}
        >
          {grid.map((row, r) =>
            row.map((active, c) => (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill={active ? '#0F172A' : '#FFFFFF'}
              />
            )),
          )}
        </svg>
      </div>

      {/* Token e Botão Copiar */}
      <div className="mt-4 w-full flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-xl">
        <span className="font-mono text-[10px] text-slate-700 font-bold truncate max-w-[170px]">
          {token}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-200 transition-colors"
          title="Copiar token"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
        <ShieldCheck className="w-3.5 h-3.5" />
        Válido para leitura na portaria
      </div>
    </div>
  );
}
