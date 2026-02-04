const { Client } = require('pg');
const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'agx',
  password: 'AgxSecure1768812386DB!ad2c6b59',
  database: 'agx'
});

async function main() {
  await client.connect();
  const res = await client.query("INSERT INTO agx_config (config_key, config_value, description, created_at, updated_at) VALUES ('tron_usdt_address', 'TPlatformAddress123456789012345678', '平台USDT TRC20收款地址', NOW(), NOW()) ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value RETURNING *");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
