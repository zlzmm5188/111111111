const Hedra = require('hedra-node').default;
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_hedra_4UrHI77RGxAW9-1IqVJWolQuHdyDhX_ofbOIjfydPUlY61uWkW-QAlmIG_owztu2';

const client = new Hedra({ apiKey: API_KEY });

// 团队成员配置 - 每个脚本都包含公司标识
const TEAM_MEMBERS = {
  founder: {
    name: '弗拉基米尔·亚历山德罗维奇·伊万诺夫',
    photo: '弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg',
    script: `各位投资者朋友们，大家好。我是升达数字资产集团创始人弗拉基米尔。
升达集团，英文名Ascenda，致力于打造全球领先的数字黄金投资平台。
我们将传统贵金属投资与现代区块链技术深度融合，为您提供安全、透明、高效的数字资产投资体验。
通过AGX代币，您可以随时随地参与黄金投资。
感谢您选择升达数字资产集团，让我们携手共创财富未来。`
  },
  president: {
    name: '陈启明',
    photo: '陈启明.jpg',
    script: `大家好，我是升达数字资产集团大中华亚太区总裁陈启明。
很荣幸代表升达集团，为大中华区及亚太地区的投资者提供专业的数字黄金投资服务。
升达数字资产集团拥有专业的分析团队、完善的合规体系、以及全天候的客户服务。
选择升达，就是选择专业与信赖。期待与您携手，共同见证数字黄金的美好未来。`
  },
  analyst: {
    name: '李鹏',
    photo: '李鹏.jpg',
    script: `投资者朋友们好，我是升达数字资产集团分析师李鹏。
作为升达的专业市场分析师，我每天追踪全球黄金市场动态，为您提供及时、准确的市场分析和投资建议。
升达数字资产集团会定期发布市场简报，帮助您把握投资时机。
关注升达，掌握财富先机。`
  },
  marketing: {
    name: '郭昭晏',
    photo: '郭昭晏.jpg',
    script: `大家好，我是升达数字资产集团营销负责人郭昭晏。
欢迎来到升达数字资产平台！我们致力于为您打造最佳的投资体验。
现在注册升达即可获得新手礼包，邀请好友还能获得丰厚奖励。
关注升达数字资产集团官方账号，获取最新活动资讯。升达，您的财富管理伙伴。`
  },
  legal: {
    name: '周刚',
    photo: '周刚.jpg',
    script: `尊敬的用户，我是升达数字资产集团法务部负责人周刚。
升达数字资产集团严格遵守各项法律法规，持有相关金融牌照，确保平台运营合法合规。
我们承诺保护您的个人信息安全，所有交易数据均采用银行级加密技术。
选择升达，选择安全与信赖。`
  },
  social: {
    name: '顾凌云',
    photo: '顾凌云.jpg',
    script: `大家好！我是升达数字资产集团社交媒体经理顾凌云。
感谢您关注升达！在这里，我会为您带来最新的市场资讯和平台活动。
加入升达数字资产集团社群，与志同道合的投资者交流心得。
记得关注升达官方账号，第一时间获取独家福利！`
  },
  designer: {
    name: '林鑫',
    photo: '林鑫.jpg',
    script: `大家好，我是升达数字资产集团设计师林鑫。
作为升达的产品设计师，我的目标是为您打造最流畅、最直观的投资体验。
您的每一条反馈都是升达进步的动力。
升达数字资产集团，用设计创造价值。`
  }
};

const PHOTO_DIR = '/root/agx-dev/h5/public/team';
const OUTPUT_FILE = '/root/agx-dev/h5/public/team/video-jobs.json';

async function uploadPortrait(photoFile) {
  const photoPath = path.join(PHOTO_DIR, photoFile);
  console.log(`  Uploading: ${photoPath}`);
  
  const result = await client.portraits.create({
    file: fs.createReadStream(photoPath),
    aspect_ratio: '1:1'
  });
  return result.url;
}

async function createVideo(portraitUrl, script) {
  const result = await client.characters.create({
    avatarImage: portraitUrl,
    audioSource: 'tts',
    text: script,
    aspectRatio: '1:1'
  });
  return result.jobId;
}

async function checkStatus(jobId) {
  const result = await client.projects.get(jobId);
  return result;
}

async function generateAllVideos() {
  const results = {};
  
  console.log('=== 升达数字资产集团 - 团队视频生成 ===\n');
  
  for (const [key, member] of Object.entries(TEAM_MEMBERS)) {
    console.log(`\n[${member.name}]`);
    
    try {
      // 1. 上传照片
      console.log('  1. 上传照片...');
      const portraitUrl = await uploadPortrait(member.photo);
      console.log(`  ✓ 照片上传成功`);
      
      // 2. 创建视频任务
      console.log('  2. 创建视频任务...');
      const jobId = await createVideo(portraitUrl, member.script);
      console.log(`  ✓ 任务创建成功: ${jobId}`);
      
      results[key] = {
        name: member.name,
        jobId: jobId,
        portraitUrl: portraitUrl,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // 稍等一下避免频率限制
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      console.log(`  ✗ 错误: ${error.message}`);
      results[key] = {
        name: member.name,
        error: error.message,
        status: 'failed'
      };
    }
  }
  
  // 保存结果
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n=== 结果已保存到 ${OUTPUT_FILE} ===`);
  
  return results;
}

// 检查所有视频状态
async function checkAllStatus() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    console.log('没有找到任务记录文件');
    return;
  }
  
  const jobs = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  
  console.log('=== 检查视频生成状态 ===\n');
  
  for (const [key, job] of Object.entries(jobs)) {
    if (job.jobId && job.status !== 'completed') {
      try {
        const status = await checkStatus(job.jobId);
        jobs[key].status = status.status;
        if (status.videoUrl) {
          jobs[key].videoUrl = status.videoUrl;
        }
        console.log(`[${job.name}] ${status.status} ${status.videoUrl || ''}`);
      } catch (e) {
        console.log(`[${job.name}] 查询失败: ${e.message}`);
      }
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jobs, null, 2));
  console.log('\n状态已更新');
}

// 主函数
const command = process.argv[2] || 'generate';

if (command === 'generate') {
  generateAllVideos().catch(console.error);
} else if (command === 'status') {
  checkAllStatus().catch(console.error);
}
