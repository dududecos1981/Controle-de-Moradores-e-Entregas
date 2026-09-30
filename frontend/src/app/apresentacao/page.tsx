'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Building,
  Package,
  QrCode,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Users,
  Smartphone,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function ApresentacaoPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 8;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = () => {
    if (currentSlide < totalSlides) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 1) setCurrentSlide(currentSlide - 1);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
            <Building className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">Portaria & Moradores Pro</h1>
            <p className="text-[10px] text-slate-400">Apresentação Executiva do Projeto</p>
          </div>
        </div>

        {/* Indicador de Slide & Ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-bold font-mono text-cyan-400">
            <span>{currentSlide}</span> / <span>{totalSlides}</span>
          </div>
          <button
            type="button"
            onClick={toggleFullScreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Tela Cheia</span>
          </button>
        </div>
      </header>

      {/* Container Central dos Slides */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {/* SLIDE 1: CAPA */}
        {currentSlide === 1 && (
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Projeto Full-Stack Moderno
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Sistema Inteligente de{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Portaria, Encomendas & Moradores
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              A plataforma definitiva que digitaliza a rotina condominial: bipagem de pacotes com câmera, controle de acessos via QR Code, Inteligência Artificial e App Mobile com Modo Amplo.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-4">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
                <p className="text-3xl font-black text-cyan-400">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Sem Papel</p>
              </div>
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
                <p className="text-3xl font-black text-indigo-400">&lt; 5s</p>
                <p className="text-xs text-slate-400 mt-0.5">Liberação QR</p>
              </div>
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
                <p className="text-3xl font-black text-emerald-400">LGPD</p>
                <p className="text-xs text-slate-400 mt-0.5">Auditado</p>
              </div>
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
                <p className="text-3xl font-black text-amber-400">USB / Nuvem</p>
                <p className="text-xs text-slate-400 mt-0.5">Portabilidade</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: O PROBLEMA VS A SOLUÇÃO */}
        {currentSlide === 2 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Transformação Digital</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">O Fim dos Livros de Papel</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-rose-950/20 border border-rose-800/40 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <XCircle className="w-5 h-5" />
                  O Modelo Tradicional (Caos)
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">⚠️ <strong>Extravios de pacotes</strong> e caligrafia ilegível nos cadernos.</li>
                  <li className="flex items-start gap-2">⚠️ <strong>Filas e demora</strong> para cadastrar visitantes por interfone.</li>
                  <li className="flex items-start gap-2">⚠️ <strong>Sem comprovante digital</strong> de quem realmente retirou a entrega.</li>
                  <li className="flex items-start gap-2">⚠️ <strong>Risco jurídico</strong> por não conformidade com a LGPD.</li>
                </ul>
              </div>

              <div className="p-6 bg-emerald-950/20 border border-emerald-800/40 rounded-3xl space-y-4 shadow-xl shadow-cyan-950/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  A Nossa Solução Inteligente
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">🚀 <strong>Bipagem com câmera</strong> e aviso instantâneo no WhatsApp/App.</li>
                  <li className="flex items-start gap-2">🚀 <strong>Convite com QR Code</strong> para entrada em segundos sem filas.</li>
                  <li className="flex items-start gap-2">🚀 <strong>Assinatura digital na tela</strong> e foto do pacote anexada.</li>
                  <li className="flex items-start gap-2">🚀 <strong>100% em conformidade LGPD</strong> com dados protegidos.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: STACK TECNOLÓGICA */}
        {currentSlide === 3 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Engenharia de Software</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Stack Tecnológica Full-Stack</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 font-bold">💻</div>
                <h3 className="text-sm font-bold text-white">Frontend & Web</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
                  <li>• Next.js 14 (App Router)</li>
                  <li>• React 18 & TypeScript</li>
                  <li>• Tailwind CSS Dark Theme</li>
                  <li>• html5-qrcode (Scanner)</li>
                  <li>• Web Audio API</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold">⚡</div>
                <h3 className="text-sm font-bold text-white">Backend & Realtime</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
                  <li>• NestJS 10 (Modular)</li>
                  <li>• Node.js 20 LTS</li>
                  <li>• Socket.io (WebSockets)</li>
                  <li>• JWT & Passport.js Auth</li>
                  <li>• Multer & Sharp (Fotos)</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">🐘</div>
                <h3 className="text-sm font-bold text-white">Banco & Nuvem</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
                  <li>• Neon Serverless PostgreSQL</li>
                  <li>• Row Level Security (RLS)</li>
                  <li>• Fallback LocalStorage</li>
                  <li>• Suporte a Pen Drive 100%</li>
                  <li>• Deploy Pronto no Render</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: ENCOMENDAS */}
        {currentSlide === 4 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Logística Interna</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Fluxo Completo de Encomendas</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                <div className="text-2xl">📦</div>
                <p className="text-xs font-bold text-cyan-400">1. Recebimento</p>
                <p className="text-[11px] text-slate-400">Transportadora entrega. Porteiro bipa código com a câmera.</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                <div className="text-2xl">📸</div>
                <p className="text-xs font-bold text-indigo-400">2. Foto & Registro</p>
                <p className="text-[11px] text-slate-400">Foto anexada e vinculação ao Bloco e Apartamento.</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                <div className="text-2xl">💬</div>
                <p className="text-xs font-bold text-emerald-400">3. Aviso Imediato</p>
                <p className="text-[11px] text-slate-400">Morador recebe aviso no WhatsApp com QR Code de retirada.</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
                <div className="text-2xl">✍️</div>
                <p className="text-xs font-bold text-amber-400">4. Assinatura Digital</p>
                <p className="text-[11px] text-slate-400">Porteiro valida QR Code e coleta assinatura na tela.</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: APP MOBILE */}
        {currentSlide === 5 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Experiência do Usuário</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">App do Morador: Modo Amplo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-2.5">
                <div className="text-2xl">📱</div>
                <h3 className="text-sm font-bold text-white">Campos Amplo-Espaçados</h3>
                <p className="text-xs text-slate-300">
                  Inputs e botões com altura ergonômica de <strong>52px a 56px</strong> para toque confortável com uma mão sem auto-zoom no iOS.
                </p>
              </div>

              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="text-2xl">🔑</div>
                <h3 className="text-sm font-bold text-white">Convites com 1 Toque</h3>
                <p className="text-xs text-slate-300">
                  Geração de passes rápidos para visitas e prestadores com envio direto para o <strong>WhatsApp</strong>.
                </p>
              </div>

              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="text-2xl">📅</div>
                <h3 className="text-sm font-bold text-white">Reservas & Ocorrências</h3>
                <p className="text-xs text-slate-300">
                  Reserva de áreas comuns (churrasqueira, salão) e abertura de chamados com fotos e acompanhamento do status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: IA */}
        {currentSlide === 6 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Inovação com IA</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Assistente de IA para a Gestão</h2>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 text-xl font-black">
                  🤖
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gerador Inteligente de Comunicados</h3>
                  <p className="text-xs text-slate-400">Redação automática em segundos com adequação de tom (Jurídico, Formal ou Amigável)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-purple-300 block mb-1">📢 Avisos de Manutenção</strong>
                  Falta de água, limpeza de caixa d'água, manutenção de elevadores.
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-purple-300 block mb-1">⚖️ Notificações de Regras</strong>
                  Horário de silêncio, reformas, uso da piscina e áreas sociais.
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <strong className="text-purple-300 block mb-1">🗳️ Convocação de Assembleia</strong>
                  Pautas formais, datas e diretrizes condominiais padronizadas.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 7: PEN DRIVE & LGPD */}
        {currentSlide === 7 && (
          <div className="flex flex-col space-y-6 w-full max-w-4xl animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Segurança & Portabilidade</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Execução em Pen Drive & LGPD</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <div className="text-2xl">💾</div>
                <h3 className="text-sm font-bold text-white">100% Portátil via Pen Drive</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O projeto pode ser gravado em qualquer Pen Drive e executado com <strong>2 cliques</strong> no arquivo <code className="text-cyan-400">INICIAR_VIA_PENDRIVE.bat</code>. Suporta Node.js portátil sem precisar instalar nada no Windows da portaria.
                </p>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <div className="text-2xl">🛡️</div>
                <h3 className="text-sm font-bold text-white">Conformidade LGPD Auditada</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consentimento explícito registrado digitalmente, criptografia de senhas, Row Level Security e trilha de auditoria para anonimização ou exclusão de dados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 8: DEMONSTRAÇÃO */}
        {currentSlide === 8 && (
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              🚀 Demonstração Prática ao Vivo
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Ambientes & Credenciais</h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Utilize os botões abaixo para abrir os módulos e realizar a demonstração prática:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <Link href="/" className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-2xl text-left transition-all">
                <p className="text-xs font-black text-blue-400 uppercase">Portaria Web</p>
                <p className="text-sm font-bold text-white mt-1">Painel da Guarita</p>
                <p className="text-[11px] font-mono text-slate-400 mt-2">localhost:3000</p>
              </Link>

              <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 rounded-2xl text-left transition-all">
                <p className="text-xs font-black text-emerald-400 uppercase">App Morador</p>
                <p className="text-sm font-bold text-white mt-1">App no Celular</p>
                <p className="text-[11px] font-mono text-slate-400 mt-2">localhost:3002</p>
              </a>

              <a href="http://localhost:3001/api/docs" target="_blank" rel="noreferrer" className="p-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-2xl text-left transition-all">
                <p className="text-xs font-black text-indigo-400 uppercase">API & Backend</p>
                <p className="text-sm font-bold text-white mt-1">Swagger Docs</p>
                <p className="text-[11px] font-mono text-slate-400 mt-2">localhost:3001/api/docs</p>
              </a>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 w-full font-mono text-left">
              <p className="font-bold text-white mb-1">🔑 Contas de Demonstração (Senha padrão: Nome@123456):</p>
              <p>• Morador: <span className="text-cyan-300">morador@portaria.com</span></p>
              <p>• Porteiro: <span className="text-emerald-300">porteiro@portaria.com</span></p>
              <p>• Síndico: <span className="text-amber-300">sindico@portaria.com</span></p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="h-20 border-t border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={prevSlide}
          disabled={currentSlide === 1}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx + 1}
              type="button"
              onClick={() => setCurrentSlide(idx + 1)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx + 1 ? 'bg-cyan-400 w-8' : 'bg-slate-700 hover:bg-slate-500 w-2.5'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <span>{currentSlide === totalSlides ? 'Concluir ✓' : 'Próximo'}</span>
          {currentSlide !== totalSlides && <ChevronRight className="w-4 h-4" />}
        </button>
      </footer>
    </div>
  );
}
