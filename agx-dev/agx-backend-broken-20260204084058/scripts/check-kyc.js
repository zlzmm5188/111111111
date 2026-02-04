const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    user: 'agx',
    password: 'AgxSecure2026Pass',
    database: 'agx'
  });

  await client.connect();
  
  const result = await client.query(`
    SELECT id, user_id, real_name, id_number, front_image, hold_image, status, created_at 
    FROM agx_kyc 
    ORDER BY created_at DESC 
    LIMIT 5
  `);
  
  console.log('=== KYC 记录 ===');
  if (result.rows.length === 0) {
    console.log('(无记录)');
  } else {
    result.rows.forEach((row, i) => {
      console.log(`\n--- 记录 ${i + 1} ---`);
      console.log('ID:', row.id);
      console.log('用户ID:', row.user_id);
      console.log('姓名:', row.real_name);
      console.log('身份证:', row.id_number);
      console.log('状态:', row.status);
      console.log('正面照:', row.front_image);
      console.log('自拍照:', row.hold_image);
      console.log('时间:', row.created_at);
    });
  }
  
  await client.end();
}

main().catch(e => console.error('错误:', e.message));
