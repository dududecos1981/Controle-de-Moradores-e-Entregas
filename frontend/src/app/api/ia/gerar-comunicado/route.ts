import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RequestBody {
  tipo: 'ENCOMENDA' | 'MANUTENCAO' | 'ASSEMBLEIA' | 'SEGURANCA' | 'AVISO_GERAL';
  destinatarios: 'TODOS' | 'BLOCO' | 'UNIDADE_ESPECIFICA';
  bloco?: string;
  unidade?: string;
  detalhes: string;
  tom?: 'formal' | 'cordial' | 'urgente';
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { tipo, destinatarios, bloco, unidade, detalhes, tom = 'cordial' } = body;

    const apiKey = process.env.GOOGLE_API_KEY;

    // Se a chave do Gemini estiver configurada no ambiente, executa chamada segura
    if (apiKey && apiKey !== 'sua_chave_aqui') {
      try {
        const promptText = `
Você é um assistente de inteligência artificial de condomínio residencial de alto padrão.
Gere um comunicado claro, profissional e bem estruturado para os moradores com base nas seguintes informações:

- Tipo do comunicado: ${tipo}
- Destinatários: ${destinatarios} ${bloco ? `(Bloco ${bloco})` : ''} ${unidade ? `(Unidade ${unidade})` : ''}
- Tom da mensagem: ${tom}
- Detalhes e instruções fornecidas pelo porteiro/síndico: ${detalhes}

Retorne ESTRITAMENTE um objeto JSON válido (sem blocos de código markdown adicionais) com a seguinte estrutura:
{
  "titulo": "Título curto e impactante do comunicado",
  "mensagem": "Texto completo e formatado do comunicado para mural e aplicativo",
  "mensagem_whatsapp": "Versão otimizada para WhatsApp com formatação em negrito (*texto*), emojis e tópicos",
  "sugestao_horario": "Melhor horário sugerido para envio"
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
              },
            }),
          },
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawOutput) {
            const parsed = JSON.parse(rawOutput);
            return NextResponse.json({
              success: true,
              source: 'gemini-ai',
              data: parsed,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Fallback para motor local de IA:', geminiError);
      }
    }

    // Gerador de Motor Local Estruturado (Fallback Resiliente e Gratuito)
    const localData = gerarComunicadoLocal(tipo, destinatarios, bloco, unidade, detalhes, tom);
    return NextResponse.json({
      success: true,
      source: 'local-smart-engine',
      data: localData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao processar solicitação de IA' },
      { status: 500 },
    );
  }
}

function gerarComunicadoLocal(
  tipo: string,
  destinatarios: string,
  bloco?: string,
  unidade?: string,
  detalhes?: string,
  tom: string = 'cordial',
) {
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const targetLabel =
    destinatarios === 'BLOCO'
      ? `Moradores do Bloco ${bloco || 'A'}`
      : destinatarios === 'UNIDADE_ESPECIFICA'
      ? `Morador da Unidade ${bloco || 'A'}-${unidade || '101'}`
      : 'Todos os Moradores e Condôminos';

  switch (tipo) {
    case 'ENCOMENDA':
      return {
        titulo: 'Aviso de Encomenda Disponível na Portaria',
        mensagem: `Prezado(a) morador(a),\n\nInformamos que uma nova encomenda ou correspondência foi recebida na portaria e está devidamente catalogada no sistema.\n\nDetalhes: ${detalhes || 'Pacote aguardando retirada nos armários da recepção.'}\n\nPara efetuar a retirada com agilidade e segurança, solicitamos que apresente o QR Code no App Morador ou documento de identificação com foto.`,
        mensagem_whatsapp: `📦 *AVISO DA PORTARIA - ENCOMENDA DISPONÍVEL*\n\nOlá, ${targetLabel}!\n\nIdentificamos que seu pacote foi recebido na portaria.\n📌 *Info:* ${detalhes || 'Pacote pronto para retirada'}\n\nFavor apresentar o código no *App Morador* ao retirar.\n_Horário de atendimento da portaria: 24h._`,
        sugestao_horario: 'Envio Imediato',
      };

    case 'MANUTENCAO':
      return {
        titulo: `Comunicado de Manutenção Preventiva - ${destinatarios === 'BLOCO' ? `Bloco ${bloco}` : 'Condomínio'}`,
        mensagem: `Prezados condôminos,\n\nComunicamos que será realizada manutenção preventiva em nossas instalações com o objetivo de assegurar a conservação e segurança predial.\n\nInstruções técnicas: ${detalhes || 'Revisão periódica programada.'}\n\nAgradecemos a colaboração de todos durante os procedimentos.`,
        mensagem_whatsapp: `⚠️ *COMUNICADO DE MANUTENÇÃO PREVENTIVA*\n\n🏢 *Atenção:* ${targetLabel}\n📅 *Data de Emissão:* ${dataHoje}\n\n🔧 *Serviço:* ${detalhes || 'Manutenção programada'}\n\nPedimos desculpas por eventuais transtornos temporários. A Administração agradece a colaboração!`,
        sugestao_horario: '08:00 às 10:00 (Início do dia)',
      };

    case 'ASSEMBLEIA':
      return {
        titulo: 'Convocação para Assembleia Geral do Condomínio',
        mensagem: `Prezados moradores e proprietários,\n\nConvidamos a todos a participar da Assembleia Geral para deliberação de pautas fundamentais de melhorias e prestação de contas.\n\nPauta principal: ${detalhes || 'Aprovação orçamentária e melhorias de segurança patrimonial.'}\n\nSua presença e voto são essenciais para o nosso condomínio.`,
        mensagem_whatsapp: `📢 *CONVOCAÇÃO DE ASSEMBLEIA GERAL*\n\n👥 *Público:* ${targetLabel}\n\n📋 *Pauta:* ${detalhes || 'Prestação de contas e deliberação de melhorias'}\n\nContamos com a presença de todos! Participe das decisões do seu condomínio.`,
        sugestao_horario: '18:00 às 20:00',
      };

    case 'SEGURANCA':
      return {
        titulo: 'Aviso Importante de Segurança e Controle de Acesso',
        mensagem: `Prezados condôminos,\n\nReforçamos a importância do cumprimento estrito das normas de segurança e controle de acesso.\n\nRecomendação: ${detalhes || 'Ao receber visitantes e prestadores, utilize a pré-autorização via App para agilizar o fluxo.'}\n\nA segurança do nosso condomínio depende do cuidado e colaboração de todos.`,
        mensagem_whatsapp: `🛡️ *ALERTA DE SEGURANÇA E ACESSO*\n\n🔒 *Atenção:* ${targetLabel}\n\n${detalhes || 'Lembramos a importância de identificar visitantes pelo App Morador antes da liberação na portaria.'}\n\n_Segurança e tranquilidade para toda a nossa comunidade._`,
        sugestao_horario: 'Qualquer horário',
      };

    default:
      return {
        titulo: 'Informativo Geral da Administração',
        mensagem: `Prezados moradores,\n\n${detalhes || 'Informamos novidades e orientações para o bom convívio em nosso condomínio.'}\n\nAtenciosamente,\nAdministração e Portaria.`,
        mensagem_whatsapp: `ℹ️ *INFORMATIVO GERAL*\n\n🏢 *Condomínio Residencial Pro*\n\n${detalhes || 'Avisos e orientações da administração para o condomínio.'}\n\nTenham um excelente dia!`,
        sugestao_horario: '10:00 às 16:00',
      };
  }
}
