const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTH = 'Basic emx6bW01MTg4QGdtYWlsLmNvbQ:fEts9dLC8DsQ9v2cnOmD5';

const TEAM_MEMBERS = {
  president: {
    name: '陈启明',
    photo: '陈启明.jpg',
    script: '大家好，我是升达数字资产集团大中华亚太区总裁陈启明。很荣幸代表升达集团，为大中华区及亚太地区的投资者提供专业的数字黄金投资服务。升达数字资产集团拥有专业的分析团队、完善的合规体系、以及全天候的客户服务。选择升达，就是选择专业与信赖。'
  },
  founder: {
    name: '弗拉基米尔·亚历山德罗维奇·伊万诺夫',
    photo: '弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg',
    script: '各位投资者朋友们，大家好。我是升达数字资产集团创始人弗拉基米尔。升达集团，英文名Ascenda，致力于打造全球领先的数字黄金投资平台。通过AGX代币，您可以随时随地参与黄金投资。感谢您选择升达数字资产集团。'
  },
  analyst: {
    name: '李鹏',
    photo: '李鹏.jpg', 
    script: '投资者朋友们好，我是升达数字资产集团分析师李鹏。作为升达的专业市场分析师，我每天追踪全球黄金市场动态，为您提供及时、准确的市场分析和投资建议。关注升达，掌握财富先机。'
  },
  marketing: {
    name: '郭昭晏',
    photo: '郭昭晏.jpg',
    script: '大家好，我是升达数字资产集团营销负责人郭昭晏。欢迎来到升达数字资产平台！现在注册升达即可获得新手礼包。关注升达数字资产集团官方账号，获取最新活动资讯。'
  },
  legal: {
    name: '周刚',
    photo: '周刚.jpg',
    script: '尊敬的用户，我是升达数字资产集团法务部负责人周刚。升达数字资产集团严格遵守各项法律法规，持有相关金融牌照，确保平台运营合法合规。选择升达，选择安全与信赖。'
  },
  social: {
    name: '顾凌云',
    photo: '顾凌云.jpg',
    script: '大家好！我是升达数字资产集团社交媒体经理顾凌云。感谢您关注升达！记得关注升达官方账号，第一时间获取独家福利和活动信息。升达一直在这里！'
  },
  designer: {
    name: '林鑫',
    photo: '林鑫.jpg',
    script: '大家好，我是升达数字资产集团设计师林鑫。作为升达的产品设计师，我的目标是为您打造最流畅、最直观的投资体验。升达数字资产，用设计创造价值。'
  }
};

const PHOTO_DIR = '/root/agx-dev/h5/public/team/';
const OUTPUT_FILE = '/root/agx-dev/h5/public/team/did-video-jobs.json';

function makeRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.d-id.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': AUTH,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createTalk(memberKey, member) {
  const photoPath = path.join(PHOTO_DIR, member.photo);
  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const sourceUrl = `data:image/jpeg;base64,${photoBase64}`;

  console.log(`\n[${member.name}]`);
  console.log('  Creating talking video...');

  const result = await makeRequest('POST', '/talks', {
    source_url: sourceUrl,
    script: {
      type: 'text',
      input: member.script,
      provider: {
        type: 'microsoft',
        voice_id: 'zh-CN-YunxiNeural'
      }
    },
    config: {
      stitch: true
    }
  });

  if (result.id) {
    console.log(`  ✓ Job created: ${result.id}`);
    return { id: result.id, status: result.status || 'created' };
  } else {
    console.log(`  ✗ Error: ${JSON.stringify(result)}`);
    return { error: result };
  }
}

async function checkStatus(talkId) {
  return await makeRequest('GET', `/talks/${talkId}`, null);
}

async function generateAll() {
  console.log('=== 升达数字资产集团 - D-ID视频生成 ===\n');
  
  const results = {};
  
  for (const [key, member] of Object.entries(TEAM_MEMBERS)) {
    try {
      const result = await createTalk(key, member);
      results[key] = {
        name: member.name,
        ...result
      };
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
      results[key] = { name: member.name, error: e.message };
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n=== 结果已保存到 ${OUTPUT_FILE} ===`);
}

async function checkAll() {
  console.log('=== 检查视频生成状态 ===\n');
  
  if (!fs.existsSync(OUTPUT_FILE)) {
    console.log('没有找到任务文件，请先运行 generate');
    return;
  }

  const jobs = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  
  for (const [key, job] of Object.entries(jobs)) {
    if (!job.id) continue;
    
    console.log(`[${job.name}]`);
    const status = await checkStatus(job.id);
    console.log(`  Status: ${status.status}`);
    
    if (status.result_url) {
      console.log(`  Video URL: ${status.result_url}`);
      jobs[key].videoUrl = status.result_url;
      jobs[key].status = 'done';
    } else {
      jobs[key].status = status.status;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jobs, null, 2));
  console.log('\n=== 状态已更新 ===');
}

const cmd = process.argv[2];
if (cmd === 'generate') {
  generateAll();
} else if (cmd === 'status') {
  checkAll();
} else {
  console.log('Usage:');
  console.log('  node generate-did-videos.js generate  - 生成所有视频');
  console.log('  node generate-did-videos.js status    - 检查生成状态');
}
