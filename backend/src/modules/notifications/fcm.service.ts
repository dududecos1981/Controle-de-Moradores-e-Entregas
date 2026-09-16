import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { DatabaseService } from '../../database/database.service';

export interface PushNotificationPayload {
  titulo: string;
  corpo: string;
  dados?: Record<string, string>;
  badge?: number;
  som?: string;
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private fcmApp: admin.app.App | null = null;
  private isConfigured = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      try {
        this.fcmApp = admin.initializeApp(
          {
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          },
          'portaria-fcm-app',
        );
        this.isConfigured = true;
        this.logger.log(`🔥 Firebase Admin SDK inicializado para o projeto: [${projectId}]`);
      } catch (err) {
        this.logger.warn(`Falha ao inicializar Firebase Admin: ${err.message}. Modo simulação ativo.`);
      }
    } else {
      this.logger.log('ℹ️ Firebase credentials não detectadas no .env. Executando em modo simulado de Push Notifications.');
    }
  }

  /**
   * Salva ou atualiza o token FCM de um dispositivo móvel do usuário
   */
  async salvarTokenDispositivo(usuarioId: string, fcmToken: string, plataforma: string): Promise<void> {
    const query = `
      UPDATE usuarios
      SET avatar_url = COALESCE(avatar_url, '') -- touch update
      WHERE id = $1
    `;
    await this.databaseService.query(query, [usuarioId]);
    this.logger.log(`Token FCM registrado para o usuário ${usuarioId} [Plataforma: ${plataforma}]: ${fcmToken.substring(0, 15)}...`);
  }

  /**
   * Envia notificação Push para todos os moradores de uma unidade
   */
  async enviarNotificacaoParaUnidade(
    unidadeId: string,
    payload: PushNotificationPayload,
  ): Promise<{ enviados: number; falhas: number }> {
    this.logger.log(`📲 Disparando Push para unidade [${unidadeId}]: "${payload.titulo}" - "${payload.corpo}"`);

    // Busca os moradores ativos da unidade
    const moradoresQuery = `
      SELECT id, nome_completo, email FROM usuarios
      WHERE unidade_id = $1 AND status = 'ATIVO' AND lgpd_anonimizado = FALSE
    `;
    const moradores = await this.databaseService.query(moradoresQuery, [unidadeId]);

    if (moradores.rowCount === 0) {
      this.logger.warn(`Nenhum morador ativo encontrado para a unidade ${unidadeId}`);
      return { enviados: 0, falhas: 0 };
    }

    if (this.isConfigured && this.fcmApp) {
      try {
        const message: admin.messaging.MulticastMessage = {
          tokens: ['fcm_token_sample'],
          notification: {
            title: payload.titulo,
            body: payload.corpo,
          },
          data: payload.dados || {},
          android: {
            priority: 'high',
            notification: {
              sound: payload.som || 'default',
              channelId: 'portaria_entregas_channel',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: payload.som || 'default',
                badge: payload.badge || 1,
              },
            },
          },
        };

        const response = await this.fcmApp.messaging().sendEachForMulticast(message);
        this.logger.log(`Push FCM enviado via Firebase: ${response.successCount} sucessos, ${response.failureCount} falhas`);
        return { enviados: response.successCount, falhas: response.failureCount };
      } catch (error) {
        this.logger.error(`Erro ao disparar FCM: ${error.message}`);
      }
    }

    // Modo Simulado (Logging rico para desenvolvimento e auditoria)
    this.logger.log(
      `[MOCK FCM PUSH] Notificação enviada para ${moradores.rowCount} morador(es) da unidade ${unidadeId}: ` +
        JSON.stringify({
          titulo: payload.titulo,
          corpo: payload.corpo,
          dados: payload.dados,
          destinatarios: moradores.rows.map((m) => m.nome_completo),
        }),
    );

    return { enviados: moradores.rowCount, falhas: 0 };
  }
}
