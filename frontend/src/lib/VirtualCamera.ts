/**
 * Gerador de Câmera Virtual em Tempo Real (Canvas MediaStream)
 * Fornece streaming de vídeo dinâmico para a Portaria quando a webcam física
 * está em uso por outro programa (Zoom, Teams, etc.) ou indisponível no sistema.
 */

export class VirtualCameraService {
  private static barcodeCanvas: HTMLCanvasElement | null = null;
  private static barcodeAnimId: number | null = null;

  private static faceCanvas: HTMLCanvasElement | null = null;
  private static faceAnimId: number | null = null;

  /**
   * Cria um MediaStream contínuo de Leitura de Encomendas & Códigos de Barras
   */
  static createBarcodeStream(currentCode = 'ML320848656BR'): { stream: MediaStream; stop: () => void } {
    if (typeof window === 'undefined') {
      return { stream: new MediaStream(), stop: () => {} };
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    let tick = 0;
    let scanY = 150;
    let scanDirection = 1;

    const render = () => {
      if (!ctx) return;
      tick++;

      // Fundo da bancada de encomendas da portaria
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 720);

      // Grade de mira óptica
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // Caixa de Encomenda (Simulação 3D/Isométrica no centro)
      ctx.save();
      ctx.fillStyle = '#b45309';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.fillRect(360, 160, 560, 400);

      // Fita adesiva da caixa
      ctx.fillStyle = '#d97706';
      ctx.fillRect(620, 160, 40, 400);

      // Etiqueta branca de envio (com código de barras)
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fillRect(420, 220, 440, 280);

      // Cabeçalho da Etiqueta
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('MERCADO LIVRE EXPRESS', 450, 260);

      ctx.font = '16px monospace';
      ctx.fillText('DESTINATÁRIO: RESIDENCIAL JARDINS', 450, 290);
      ctx.fillText('UNIDADE: BLOCO A - APTO 101', 450, 315);

      // Barras do Código de Barras (Linhas pretas com espessuras variadas)
      ctx.fillStyle = '#000000';
      const barcodeX = 450;
      const barcodeY = 340;
      const barcodeW = 380;
      const barcodeH = 100;

      // Desenha barras
      const pattern = [4, 2, 6, 2, 8, 3, 2, 5, 3, 7, 2, 4, 6, 2, 4, 8, 3, 5, 2, 6, 4, 2, 7, 3, 5, 2, 8, 4];
      let curX = barcodeX;
      for (let i = 0; i < pattern.length; i++) {
        const w = pattern[i % pattern.length];
        if (i % 2 === 0) {
          ctx.fillRect(curX, barcodeY, w * 1.8, barcodeH);
        }
        curX += w * 2.8;
        if (curX > barcodeX + barcodeW) break;
      }

      // Texto do Código de Barras
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentCode, 450 + barcodeW / 2, barcodeY + barcodeH + 30);
      ctx.textAlign = 'left';

      ctx.restore();

      // Linha Laser de Leitura Óptica Animada (Verde/Ciano)
      scanY += 3 * scanDirection;
      if (scanY > 520) scanDirection = -1;
      if (scanY < 180) scanDirection = 1;

      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(340, scanY);
      ctx.lineTo(940, scanY);
      ctx.stroke();
      ctx.restore();

      // Marcadores nos 4 cantos da mira
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      const mSize = 30;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(340, 160 + mSize);
      ctx.lineTo(340, 160);
      ctx.lineTo(340 + mSize, 160);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(940 - mSize, 160);
      ctx.lineTo(940, 160);
      ctx.lineTo(940, 160 + mSize);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(340, 560 - mSize);
      ctx.lineTo(340, 560);
      ctx.lineTo(340 + mSize, 560);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(940 - mSize, 560);
      ctx.lineTo(940, 560);
      ctx.lineTo(940, 560 - mSize);
      ctx.stroke();

      // Rodapé OSD (On-Screen Display de Portaria)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 660, 1280, 60);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(40, 690, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      const timeStr = new Date().toLocaleTimeString('pt-BR');
      ctx.fillText(`CAM 01 - SCANNER ÓPTICO PORTARIA | FPS: 30 | ${timeStr} | 1080p HD`, 60, 696);

      VirtualCameraService.barcodeAnimId = requestAnimationFrame(render);
    };

    render();

    // @ts-ignore
    const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();

    const stop = () => {
      if (VirtualCameraService.barcodeAnimId) {
        cancelAnimationFrame(VirtualCameraService.barcodeAnimId);
        VirtualCameraService.barcodeAnimId = null;
      }
      stream.getTracks().forEach((t) => t.stop());
    };

    return { stream, stop };
  }

  /**
   * Cria um MediaStream contínuo de Biometria Facial para Visitantes e Moradores
   */
  static createFaceStream(nome = 'Mariana Fernandes'): { stream: MediaStream; stop: () => void } {
    if (typeof window === 'undefined') {
      return { stream: new MediaStream(), stop: () => {} };
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    let tick = 0;

    const render = () => {
      if (!ctx) return;
      tick++;

      // Fundo de recepção da portaria
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#0b1329');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Silhueta Humana / Rosto Biométrico
      const centerX = 640;
      const centerY = 340;

      // Ombros
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 280, 260, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 20, 140, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo estilizado
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 90, 150, 110, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Olhos
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(centerX - 50, centerY - 40, 14, 0, Math.PI * 2);
      ctx.arc(centerX + 50, centerY - 40, 14, 0, Math.PI * 2);
      ctx.fill();

      // Malha Biométrica Facial (Linhas holográficas animadas)
      const pulse = Math.sin(tick * 0.05) * 10;
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 10;

      // Elipse facial pulsante
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 20, 160 + pulse, 200 + pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Pontos biométricos nos olhos, nariz e queixo
      const points = [
        [centerX - 50, centerY - 40],
        [centerX + 50, centerY - 40],
        [centerX, centerY],
        [centerX - 35, centerY + 50],
        [centerX + 35, centerY + 50],
        [centerX, centerY + 80],
      ];

      ctx.fillStyle = '#22d3ee';
      points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Linhas interligando pontos
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[2][0], points[2][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.lineTo(points[4][0], points[4][1]);
      ctx.lineTo(points[5][0], points[5][1]);
      ctx.lineTo(points[3][0], points[3][1]);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // Informações na Tela
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(380, 40, 520, 50);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.strokeRect(380, 40, 520, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BIOMETRIA FACIAL ATIVA • ALINHE O ROSTO', 640, 72);
      ctx.textAlign = 'left';

      // Rodapé OSD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 660, 1280, 60);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(40, 690, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      const timeStr = new Date().toLocaleTimeString('pt-BR');
      ctx.fillText(`CAM 02 - BIOMETRIA FACIAL PORTARIA | 1080p | ${timeStr} | LGPD CONFORME`, 60, 696);

      VirtualCameraService.faceAnimId = requestAnimationFrame(render);
    };

    render();

    // @ts-ignore
    const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();

    const stop = () => {
      if (VirtualCameraService.faceAnimId) {
        cancelAnimationFrame(VirtualCameraService.faceAnimId);
        VirtualCameraService.faceAnimId = null;
      }
      stream.getTracks().forEach((t) => t.stop());
    };

    return { stream, stop };
  }
}
