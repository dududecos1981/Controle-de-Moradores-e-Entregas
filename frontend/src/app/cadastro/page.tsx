'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  FileText,
  X,
  ArrowLeft,
  Camera,
  Upload,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { INITIAL_UNIDADES } from '@/lib/store';
import WebcamCapture from '@/components/WebcamCapture';
import SoundEffects from '@/lib/SoundEffects';

export default function CadastroPage() {
  const { registerMorador } = useAuth();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bloco, setBloco] = useState('A');
  const [apartamento, setApartamento] = useState('101');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formatação de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
  };

  // Formatação de Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setTelefone(value);
  };

  // Força da senha
  const getPasswordStrength = () => {
    if (!senha) return 0;
    let score = 0;
    if (senha.length >= 6) score += 1;
    if (senha.length >= 8) score += 1;
    if (/[A-Z]/.test(senha)) score += 1;
    if (/[0-9]/.test(senha)) score += 1;
    if (/[^A-Za-z0-9]/.test(senha)) score += 1;
    return score;
  };
  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (senha !== confirmSenha) {
      setErrorMessage('As senhas digitadas não coincidem.');
      SoundEffects.playError();
      return;
    }

    if (senha.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      SoundEffects.playError();
      return;
    }

    if (!lgpdAceito) {
      setErrorMessage('Você deve aceitar o Termo de Consentimento LGPD para concluir o cadastro.');
      SoundEffects.playError();
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerMorador({
        nome_completo: nome,
        cpf,
        email,
        telefone,
        unidade_bloco: bloco,
        unidade_numero: apartamento,
        senha,
      });

      if (res.success) {
        SoundEffects.playSuccess();
      } else {
        setErrorMessage(res.message || 'Erro ao realizar cadastro.');
        SoundEffects.playError();
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro inesperado ao salvar os dados.');
      SoundEffects.playError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A11] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-lg space-y-4">
        {/* Barra Superior de Retorno */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            Voltar para o Login
          </Link>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Portal do Morador
          </span>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#0F172A]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 relative">
          {/* Botão de Fechar / Sair no canto superior */}
          <Link
            href="/login"
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            title="Voltar para o Login"
          >
            <X className="w-5 h-5" />
          </Link>

          {/* Header */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Cadastro de Morador
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Vincule sua unidade residencial para acompanhar entregas e emitir convites com QR Code.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/50 flex items-start gap-3 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto Biométrica do Morador (Opcional) */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt="Foto Morador" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                {fotoUrl && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Foto do Morador (Opcional)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWebcamOpen(true)}
                    className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Camera className="w-3 h-3" />
                    {fotoUrl ? 'Recapturar' : 'Tirar Foto'}
                  </button>

                  <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-slate-700">
                    <Upload className="w-3 h-3 text-cyan-400" />
                    Enviar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setFotoUrl(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Mariana Fernandes"
                  className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* CPF e Telefone em 2 colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">CPF</label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">E-mail Principal</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@dominio.com"
                  className="w-full bg-slate-950 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Seleção de Unidade Residencial */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">Bloco / Torre</label>
                <select
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="A">Bloco A</option>
                  <option value="B">Bloco B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">Apartamento</label>
                <select
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="101">Apto 101</option>
                  <option value="102">Apto 102</option>
                  <option value="201">Apto 201</option>
                  <option value="PH01">Cobertura PH01</option>
                </select>
              </div>
            </div>

            {/* Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full bg-slate-950 text-white text-xs pl-10 pr-8 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Confirmar Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Indicador de Força de Senha */}
            {senha && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                  <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                  <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
                <p className="text-[10px] text-slate-400">
                  Força da senha: {strength <= 1 ? 'Fraca' : strength <= 3 ? 'Média' : 'Forte e Segura'}
                </p>
              </div>
            )}

            {/* Termo de Consentimento LGPD */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3">
              <input
                type="checkbox"
                id="lgpd"
                checked={lgpdAceito}
                onChange={(e) => setLgpdAceito(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
              <label htmlFor="lgpd" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                Concordo com o armazenamento seguro dos meus dados para controle de acesso predial, notificações de encomendas e convites conforme a{' '}
                <button
                  type="button"
                  onClick={() => setIsLgpdModalOpen(true)}
                  className="text-cyan-400 font-bold underline hover:text-cyan-300"
                >
                  Lei nº 13.709/2018 (LGPD)
                </button>
                .
              </label>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-colors text-center border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar / Sair
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Cadastrando Unidade...' : 'Concluir Cadastro & Entrar'}
              </button>
            </div>
          </form>

          {/* Link Fazer Login */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Já possui uma conta cadastrada?{' '}
              <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Termo LGPD */}
      {isLgpdModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Termo de Consentimento LGPD</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLgpdModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-72 overflow-y-auto pr-2 leading-relaxed">
              <p>
                Em conformidade com a <strong>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD)</strong>, informamos que seus dados pessoais (nome, CPF, telefone, e-mail e unidade residencial) são coletados exclusivamente para a finalidade legítima de:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Garantir a segurança física do condomínio e controle de acesso veicular e de pedestres.</li>
                <li>Recebimento e notificação de encomendas entregues na portaria.</li>
                <li>Emissão e validação de convites temporários com QR Code para seus visitantes.</li>
              </ul>
              <p className="pt-2">
                Seus dados são armazenados de forma criptografada e não serão comercializados ou compartilhados com terceiros para fins publicitários. Você pode solicitar a anonimização ou exclusão dos seus dados a qualquer momento junto à administração do condomínio.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setLgpdAceito(true);
                  setIsLgpdModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
              >
                Entendi e Aceito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Webcam no Cadastro */}
      {isWebcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsWebcamOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Captura de Foto do Morador
            </h3>
            <WebcamCapture
              onPhotoCaptured={(dataUrl) => {
                setFotoUrl(dataUrl);
                setIsWebcamOpen(false);
              }}
              currentPhotoUrl={fotoUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}
