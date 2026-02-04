import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';

// 团队成员视频脚本
export const VIDEO_SCRIPTS = {
  founder: {
    name: '弗拉基米尔·亚历山德罗维奇·伊万诺夫',
    role: '创始人',
    photo: '弗拉基米尔·亚历山德罗维奇·伊万诺夫.jpg',
    scripts: {
      zh: `各位投资者朋友们，大家好。我是升达数字资产集团创始人弗拉基米尔。
升达集团致力于打造全球领先的数字黄金投资平台。我们将传统贵金属投资与现代区块链技术深度融合，为您提供安全、透明、高效的数字资产投资体验。
黄金，作为人类历史上最古老的价值储存手段，在数字时代焕发新生。通过AGX代币，您可以随时随地参与黄金投资，享受区块链带来的便捷与安全。
感谢您选择升达，让我们携手共创财富未来。`,
      en: `Hello, dear investors. I am Vladimir, founder of Ascenda Digital Assets Group.
Ascenda is committed to building the world's leading digital gold investment platform. We integrate traditional precious metal investment with modern blockchain technology to provide you with a safe, transparent, and efficient digital asset investment experience.
Gold, as humanity's oldest store of value, is reborn in the digital age. Through AGX tokens, you can participate in gold investment anytime, anywhere, enjoying the convenience and security of blockchain.
Thank you for choosing Ascenda. Let's create a prosperous future together.`
    }
  },
  president: {
    name: '陈启明',
    role: '大中华亚太区总裁',
    photo: '陈启明.jpg',
    scripts: {
      zh: `大家好，我是升达数字资产集团大中华亚太区总裁陈启明。
很荣幸能够带领我们的亚太团队，为大中华区及亚太地区的投资者提供专业的数字黄金投资服务。
我们的使命是让每一位投资者都能便捷地参与黄金投资，享受数字资产带来的增值机会。
我们拥有专业的分析团队、完善的合规体系、以及全天候的客户服务。选择升达，就是选择专业与信赖。
期待与您携手，共同见证数字黄金的美好未来。`,
      en: `Hello everyone, I am Chen Qiming, President of Greater China and Asia Pacific at Ascenda Digital Assets Group.
It is my honor to lead our Asia Pacific team in providing professional digital gold investment services to investors in Greater China and the Asia Pacific region.
Our mission is to enable every investor to conveniently participate in gold investment and enjoy the value appreciation opportunities brought by digital assets.
We have a professional analysis team, comprehensive compliance system, and 24/7 customer service. Choosing Ascenda means choosing professionalism and trust.
Looking forward to partnering with you to witness the bright future of digital gold.`
    }
  },
  analyst: {
    name: '李鹏',
    role: '分析师',
    photo: '李鹏.jpg',
    scripts: {
      zh: `投资者朋友们好，我是升达数字资产的分析师李鹏。
作为专业的市场分析师，我每天都在追踪全球黄金市场动态，为您提供及时、准确的市场分析和投资建议。
黄金作为避险资产，在全球经济不确定性增加的背景下，其投资价值日益凸显。
我们会定期发布市场简报，帮助您把握投资时机。关注升达，掌握财富先机。`,
      en: `Hello investors, I am Li Peng, analyst at Ascenda Digital Assets.
As a professional market analyst, I track global gold market dynamics daily to provide you with timely and accurate market analysis and investment advice.
Gold, as a safe-haven asset, has increasingly prominent investment value amid growing global economic uncertainty.
We regularly publish market briefings to help you seize investment opportunities. Follow Ascenda and stay ahead of the wealth curve.`
    }
  },
  marketing: {
    name: '郭昭晏',
    role: '营销负责人',
    photo: '郭昭晏.jpg',
    scripts: {
      zh: `大家好，我是升达数字资产的营销负责人郭昭晏。
欢迎来到升达数字资产平台！我们致力于为您打造最佳的投资体验。
无论您是投资新手还是资深玩家，我们都有适合您的产品和服务。
现在注册即可获得新手礼包，邀请好友还能获得丰厚奖励。
关注我们的社交媒体，获取最新活动资讯。升达数字资产，您的财富管理伙伴。`,
      en: `Hello everyone, I am Guo Zhaoyan, Marketing Director at Ascenda Digital Assets.
Welcome to the Ascenda Digital Assets platform! We are committed to creating the best investment experience for you.
Whether you are a novice investor or an experienced player, we have products and services tailored to your needs.
Register now to receive a welcome package, and earn generous rewards by inviting friends.
Follow our social media for the latest promotions. Ascenda Digital Assets, your wealth management partner.`
    }
  },
  legal: {
    name: '周刚',
    role: '法务部负责人',
    photo: '周刚.jpg',
    scripts: {
      zh: `尊敬的用户，我是升达数字资产法务部负责人周刚。
在此提醒您，数字资产投资存在一定风险，请您在充分了解相关风险后，根据自身财务状况谨慎决策。
升达数字资产集团严格遵守各项法律法规，持有相关金融牌照，确保平台运营合法合规。
我们承诺保护您的个人信息安全，所有交易数据均采用银行级加密技术。
如有任何法律咨询需求，请随时联系我们的客服团队。`,
      en: `Dear users, I am Zhou Gang, Head of Legal Department at Ascenda Digital Assets.
Please be reminded that digital asset investment carries certain risks. Make prudent decisions based on your financial situation after fully understanding the relevant risks.
Ascenda Digital Assets Group strictly complies with all laws and regulations, holds relevant financial licenses, and ensures legal and compliant platform operations.
We are committed to protecting your personal information security. All transaction data is encrypted with bank-level technology.
For any legal consultation needs, please feel free to contact our customer service team.`
    }
  },
  social: {
    name: '顾凌云',
    role: '社交媒体经理',
    photo: '顾凌云.jpg',
    scripts: {
      zh: `Hi，大家好！我是升达数字资产的社交媒体经理顾凌云。
感谢您关注升达！在这里，我会为您带来最新的市场资讯、投资技巧和平台活动。
加入我们的社群，与志同道合的投资者交流心得，共同学习成长。
记得关注我们的官方账号，第一时间获取独家福利和活动信息。
有任何问题欢迎留言互动，我们一直在这里！`,
      en: `Hi everyone! I am Gu Lingyun, Social Media Manager at Ascenda Digital Assets.
Thank you for following Ascenda! Here, I will bring you the latest market information, investment tips, and platform events.
Join our community to exchange ideas with like-minded investors and grow together.
Remember to follow our official accounts to be the first to receive exclusive benefits and event information.
Feel free to leave comments and interact with us. We are always here!`
    }
  },
  designer: {
    name: '林鑫',
    role: '设计师',
    photo: '林鑫.jpg',
    scripts: {
      zh: `大家好，我是升达数字资产的设计师林鑫。
作为产品设计师，我的目标是为您打造最流畅、最直观的投资体验。
从每一个按钮的位置，到每一种颜色的选择，我们都精心考量，只为让您的操作更加便捷。
您的每一条反馈都是我们进步的动力。如果您有任何使用体验上的建议，欢迎告诉我们。
升达数字资产，用设计创造价值。`,
      en: `Hello everyone, I am Lin Xin, designer at Ascenda Digital Assets.
As a product designer, my goal is to create the smoothest and most intuitive investment experience for you.
From the position of every button to the choice of every color, we carefully consider everything to make your operations more convenient.
Your feedback is the driving force for our improvement. If you have any suggestions for the user experience, please let us know.
Ascenda Digital Assets, creating value through design.`
    }
  }
};

@Injectable()
export class HedraService {
  private readonly logger = new Logger(HedraService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.hedra.com';
  private readonly teamPhotoPath: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HEDRA_API_KEY');
    this.teamPhotoPath = '/root/agx-dev/h5/public/team';
  }

  // 获取所有视频脚本
  getVideoScripts() {
    return VIDEO_SCRIPTS;
  }

  // 上传音频（TTS生成）
  async generateAudio(text: string, voiceId?: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/audio`,
        {
          type: 'tts',
          text,
          voice_id: voiceId || 'default'
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      this.logger.log(`Audio generated: ${response.data.url}`);
      return response.data.url;
    } catch (error) {
      this.logger.error('Failed to generate audio:', error.response?.data || error.message);
      throw error;
    }
  }

  // 上传人物照片
  async uploadPortrait(photoFileName: string): Promise<string> {
    const photoPath = path.join(this.teamPhotoPath, photoFileName);
    
    if (!fs.existsSync(photoPath)) {
      throw new Error(`Photo not found: ${photoPath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(photoPath));

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/portrait`,
        formData,
        {
          headers: {
            'X-API-Key': this.apiKey,
            ...formData.getHeaders()
          }
        }
      );
      this.logger.log(`Portrait uploaded: ${response.data.url}`);
      return response.data.url;
    } catch (error) {
      this.logger.error('Failed to upload portrait:', error.response?.data || error.message);
      throw error;
    }
  }

  // 创建角色视频
  async createCharacterVideo(
    portraitUrl: string,
    audioUrl: string,
    aspectRatio: string = '1:1'
  ): Promise<{ jobId: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/characters`,
        {
          avatarImage: portraitUrl,
          audioSource: audioUrl,
          aspectRatio
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      this.logger.log(`Video job created: ${response.data.jobId}`);
      return { jobId: response.data.jobId };
    } catch (error) {
      this.logger.error('Failed to create video:', error.response?.data || error.message);
      throw error;
    }
  }

  // 获取视频状态
  async getVideoStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/projects/${jobId}`,
        {
          headers: {
            'X-API-Key': this.apiKey
          }
        }
      );
      return {
        status: response.data.status,
        videoUrl: response.data.videoUrl
      };
    } catch (error) {
      this.logger.error('Failed to get video status:', error.response?.data || error.message);
      throw error;
    }
  }

  // 生成完整视频流程
  async generateFullVideo(
    memberKey: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<{ jobId: string; member: string }> {
    const member = VIDEO_SCRIPTS[memberKey];
    if (!member) {
      throw new Error(`Member not found: ${memberKey}`);
    }

    const script = member.scripts[language];
    
    // 1. 生成音频
    this.logger.log(`Generating audio for ${member.name}...`);
    const audioUrl = await this.generateAudio(script);

    // 2. 上传照片
    this.logger.log(`Uploading portrait for ${member.name}...`);
    const portraitUrl = await this.uploadPortrait(member.photo);

    // 3. 创建视频
    this.logger.log(`Creating video for ${member.name}...`);
    const { jobId } = await this.createCharacterVideo(portraitUrl, audioUrl);

    return { jobId, member: member.name };
  }

  // 批量生成所有视频
  async generateAllVideos(language: 'zh' | 'en' = 'zh'): Promise<Array<{
    member: string;
    jobId: string;
  }>> {
    const results = [];
    
    for (const key of Object.keys(VIDEO_SCRIPTS)) {
      try {
        const result = await this.generateFullVideo(key, language);
        results.push(result);
        this.logger.log(`Video job created for ${result.member}: ${result.jobId}`);
      } catch (error) {
        this.logger.error(`Failed to generate video for ${key}:`, error.message);
        results.push({ member: VIDEO_SCRIPTS[key].name, jobId: null, error: error.message });
      }
    }
    
    return results;
  }

  // 获取公开资产列表
  async getPublicAssets(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/web-app/public/assets`,
        {
          headers: {
            'X-API-Key': this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get public assets:', error.response?.data || error.message);
      throw error;
    }
  }
}
