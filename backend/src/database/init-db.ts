import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERRO: DATABASE_URL não definida no arquivo .env!');
  console.error('👉 Configure sua URL de conexão do Neon PostgreSQL no backend/.env');
  process.exit(1);
}

const isSsl = process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === undefined;

async function getClient(): Promise<Client> {
  const client = new Client({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  return client;
}

async function runSchema(client: Client) {
  console.log('📦 [1/2] Lendo e executando database/schema.sql...');
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Arquivo schema.sql não encontrado em: ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  await client.query(sql);
  console.log('✅ Schema e DDL executados com sucesso no Neon PostgreSQL!');
}

async function runSeed(client: Client) {
  console.log('🌱 [2/2] Lendo e executando database/seed.sql...');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Arquivo seed.sql não encontrado em: ${seedPath}`);
  }

  const sql = fs.readFileSync(seedPath, 'utf8');
  await client.query(sql);
  console.log('✅ Seeds e dados de homologação inseridos com sucesso!');
}

async function checkStatus(client: Client) {
  console.log('\n📊 [STATUS] Verificando tabelas e registros no banco Neon:');
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  if (res.rows.length === 0) {
    console.log('⚠️ Nenhuma tabela encontrada no schema public.');
    return;
  }

  console.log(`📋 Tabelas encontradas (${res.rows.length}):`);
  for (const row of res.rows) {
    const countRes = await client.query(`SELECT COUNT(*)::INTEGER as count FROM "${row.table_name}"`);
    console.log(`   - ${row.table_name.padEnd(25)} : ${countRes.rows[0].count} registro(s)`);
  }
}

async function main() {
  const command = process.argv[2] || 'init';
  console.log(`🚀 Iniciando rotina de banco de dados: [${command.toUpperCase()}]`);
  console.log(`🔗 Endpoint DB: ${connectionString.split('@')[1]?.split('/')[0] || '[Protegido]'}`);

  let client: Client | null = null;
  try {
    client = await getClient();
    console.log('🟢 Conexão com Neon PostgreSQL estabelecida com sucesso!\n');

    if (command === 'init') {
      await runSchema(client);
      await checkStatus(client);
    } else if (command === 'seed') {
      await runSeed(client);
      await checkStatus(client);
    } else if (command === 'reset') {
      console.log('⚠️ Resetando schema public...');
      await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO PUBLIC;');
      console.log('🧹 Schema limpo com sucesso.');
      await runSchema(client);
      await runSeed(client);
      await checkStatus(client);
    } else if (command === 'status') {
      await checkStatus(client);
    } else {
      console.log(`Comando desconhecido: ${command}. Use: init | seed | reset | status`);
    }

    console.log('\n🎉 Operação concluída com sucesso!');
  } catch (err: any) {
    console.error('\n❌ Erro durante a operação:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main();
