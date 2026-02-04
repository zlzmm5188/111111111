const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const client = new S3Client({
  region: 'auto',
  endpoint: 'https://76ea555e24b511bd1dbaa4913bb67001.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'f607d38ef998290068ea48deed289987',
    secretAccessKey: '67dfe36899d991f5f62f3d4a40838e10bec050c8e806eb726d48641cf8a283a3'
  }
});

async function main() {
  try {
    // 只查看 kyc 文件夹
    const r = await client.send(new ListObjectsV2Command({ Bucket: 'zijin', Prefix: 'kyc/', MaxKeys: 50 }));
    console.log('=== R2 KYC 图片 ===');
    console.log('KYC图片数量:', r.Contents?.length || 0);
    console.log('');
    if (!r.Contents || r.Contents.length === 0) {
      console.log('(无KYC图片)');
    } else {
      r.Contents.forEach((f, i) => {
        console.log(`${i+1}. ${f.Key}`);
        console.log(`   https://pub-9bd342ff93b64be593d7ebf1f8361e87.r2.dev/${f.Key}`);
        console.log(`   大小: ${(f.Size/1024).toFixed(1)} KB, 时间: ${f.LastModified}`);
        console.log('');
      });
    }
  } catch (e) {
    console.error('错误:', e.message);
  }
}

main();
