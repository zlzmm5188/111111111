/**
 * JShaman 代码混淆脚本
 * 使用 VIP 码：1766-7809-6567-6363
 */

const fs = require('fs');
const http = require('http');
const https = require('https');

// 配置
const CONFIG = {
  vipCode: '1766-7809-6567-6363',
  inputFile: './src/utils/bot-detector.js',
  outputFile: './src/utils/bot-detector-obfuscated.js',
  useHttps: true,  // 使用 HTTPS (端口 4430)
  obfuscationConfig: {
    compact: true,
    renameGlobalFunctionVariable: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayEncoding: true,
    disableConsoleOutput: true,
    debugProtection: true,
    domainLock: [],
    reservedNames: ['AGXBotDetector']
  }
};

/**
 * 调用 JShaman API
 */
function obfuscateCode(jsCode) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      js_code: jsCode,
      vip_code: CONFIG.vipCode,
      config: CONFIG.obfuscationConfig
    });

    const protocol = CONFIG.useHttps ? https : http;
    const port = CONFIG.useHttps ? 4430 : 800;
    const hostname = 'www.jshaman.com';
    const path = '/submit_js_code/';

    const options = {
      hostname,
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`正在连接 JShaman API (${CONFIG.useHttps ? 'HTTPS' : 'HTTP'})...`);

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`API 响应状态: ${res.statusCode}`);

        try {
          const result = JSON.parse(data);

          if (result.status === 0) {
            console.log('✅ 混淆成功！');
            resolve(result.content);
          } else {
            console.error('❌ 混淆失败！');
            console.error('错误信息:', result.message);
            reject(new Error(result.message));
          }
        } catch (e) {
          console.error('❌ 解析响应失败！');
          console.error('响应内容:', data);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('JShaman 代码混淆工具');
    console.log('='.repeat(60));
    console.log(`VIP 码: ${CONFIG.vipCode}`);
    console.log(`输入文件: ${CONFIG.inputFile}`);
    console.log(`输出文件: ${CONFIG.outputFile}`);
    console.log('='.repeat(60));

    // 读取源文件
    console.log('\n[1/3] 读取源文件...');
    if (!fs.existsSync(CONFIG.inputFile)) {
      throw new Error(`输入文件不存在: ${CONFIG.inputFile}`);
    }

    const sourceCode = fs.readFileSync(CONFIG.inputFile, 'utf8');
    console.log(`✅ 源文件大小: ${(sourceCode.length / 1024).toFixed(2)} KB`);

    // 调用混淆 API
    console.log('\n[2/3] 调用 JShaman API...');
    const obfuscatedCode = await obfuscateCode(sourceCode);

    // 保存结果
    console.log('\n[3/3] 保存混淆后的代码...');
    fs.writeFileSync(CONFIG.outputFile, obfuscatedCode, 'utf8');
    console.log(`✅ 混淆后大小: ${(obfuscatedCode.length / 1024).toFixed(2)} KB`);
    console.log(`✅ 已保存到: ${CONFIG.outputFile}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 混淆完成！');
    console.log('='.repeat(60));

    // 显示混淆前后对比
    const compression = ((1 - obfuscatedCode.length / sourceCode.length) * 100).toFixed(2);
    console.log(`\n代码大小变化: ${compression}% (${sourceCode.length} → ${obfuscatedCode.length} 字节)`);

    if (compression > 0) {
      console.log('✅ 代码已压缩');
    } else {
      console.log('⚠️  代码体积增加（混淆的正常现象）');
    }

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 混淆失败:', error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { obfuscateCode };
