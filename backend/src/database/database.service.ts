import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export interface LgpdContext {
  userId?: string;
  userName?: string;
  clientIp?: string;
  reason?: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('database.url');
    const max = this.configService.get<number>('database.max', 20);
    const useSsl = this.configService.get<boolean>('database.ssl', true);

    this.logger.log('Inicializando pool de conexões com PostgreSQL / Neon Serverless...');

    this.pool = new Pool({
      connectionString,
      max,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Erro inesperado no Pool de conexões do PostgreSQL:', err.stack);
    });

    // Test connection on boot (non-blocking if DB not yet reachable)
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT current_database() as db, version() as ver');
      this.logger.log(`Conexão com PostgreSQL ativa. DB: [${res.rows[0]?.db}] | Versão: ${res.rows[0]?.ver?.substring(0, 30)}...`);
      client.release();
    } catch (error) {
      this.logger.warn(`Aviso de conexão inicial ao Neon DB: ${error.message}. (Verifique DATABASE_URL no .env)`);
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      this.logger.log('Encerrando pool de conexões do Neon...');
      await this.pool.end();
    }
  }

  /**
   * Executa uma consulta SQL direta no pool
   */
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn(`Slow Query (${duration}ms): ${text}`);
      }
      return res;
    } catch (error) {
      this.logger.error(`Erro ao executar query: ${text}`, error.stack);
      throw error;
    }
  }

  /**
   * Executa consulta injetando variáveis de contexto para triggers LGPD
   */
  async queryWithLgpdContext<T extends QueryResultRow = any>(
    text: string,
    params: any[] = [],
    context?: LgpdContext,
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (context?.userId) {
        await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [context.userId]);
      }
      if (context?.userName) {
        await client.query(`SELECT set_config('app.current_user_name', $1, true)`, [context.userName]);
      }
      if (context?.clientIp) {
        await client.query(`SELECT set_config('app.client_ip', $1, true)`, [context.clientIp]);
      }
      if (context?.reason) {
        await client.query(`SELECT set_config('app.audit_reason', $1, true)`, [context.reason]);
      }

      const result = await client.query<T>(text, params);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Erro em query com contexto LGPD: ${text}`, error.stack);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Executa bloco de operações dentro de uma transação gerenciada
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}
