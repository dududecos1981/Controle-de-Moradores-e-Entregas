import * as path from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('🟢 Conectado ao Neon PostgreSQL para limpeza de dados fictícios...');

  // 1. Remove usuário fictício Mariana Fernandes / morador@portaria.com
  const deleteRes = await client.query(`
    DELETE FROM usuarios 
    WHERE email = 'morador@portaria.com' 
       OR cpf = '111.222.333-44' 
       OR nome_completo ILIKE '%Mariana Fernandes%'
  `);
  console.log(`✅ Usuários fictícios removidos: ${deleteRes.rowCount}`);

  // 2. Remove registros fictícios de visitantes de teste se houver
  const deleteVis = await client.query(`
    DELETE FROM visitantes 
    WHERE nome_completo ILIKE '%Lucas Mendes%' 
       OR nome_completo ILIKE '%Carlos Eletricista%' 
       OR nome_completo ILIKE '%Visitante Teste%'
  `);
  console.log(`✅ Visitantes fictícios removidos: ${deleteVis.rowCount}`);

  // 3. Exibe a lista final limpa de usuários cadastrados
  const users = await client.query('SELECT id, nome_completo, email, cpf, perfil, status FROM usuarios ORDER BY perfil, nome_completo');
  console.log('\n📋 Lista de Usuários Oficiais no Neon PostgreSQL:');
  console.table(users.rows);

  await client.end();
  console.log('\n🎉 Limpeza concluída com sucesso!');
}

cleanDatabase().catch((err) => {
  console.error('❌ Erro na limpeza:', err);
  process.exit(1);
});
