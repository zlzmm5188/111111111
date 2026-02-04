import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Telegram 通知服务
 * 用于后台监控通知群
 */
@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);
  private botToken: string;
  private chatId: string;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.enabled = !!(this.botToken && this.chatId);

    if (!this.enabled) {
      this.logger.warn('Telegram 通知未启用：缺少配置');
    }
  }

  /**
   * 发送通知到 Telegram 群
   */
  private async sendMessage(message: string, buttonLabel?: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug('Telegram 通知未启用，跳过发送');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const body: any = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown',
      };

      // 添加装饰按钮（不处理 callback）
      if (buttonLabel) {
        body.reply_markup = {
          inline_keyboard: [[
            { text: buttonLabel, callback_data: 'decorative_button' }
          ]]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.ok) {
        this.logger.error(`Telegram 发送失败: ${result.description}`);
        return false;
      }

      this.logger.debug('Telegram 通知发送成功');
      return true;
    } catch (error) {
      this.logger.error(`Telegram 通知异常:`, error.message);
      return false;
    }
  }

  /**
   * 格式化时间
   */
  private formatTime(date: Date = new Date()): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 格式化用户信息
   */
  private formatUserInfo(userId: number, username?: string): string {
    return `🆔 用户ID：${userId}${username ? `\n👤 用户名：${username}` : ''}`;
  }

  // ==================== 通知事件 ====================

  /**
   * 1️⃣ 新用户注册通知
   */
  async notifyUserRegister(data: {
    userId: number;
    username?: string;
    email?: string;
    ip?: string;
  }): Promise<void> {
    const { userId, username, email, ip } = data;

    const message = `🆕 *新用户注册*

${this.formatUserInfo(userId, username)}
${email ? `📧 邮箱：${email}\n` : ''}${ip ? `🌍 注册IP：${ip}\n` : ''}⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '👤 新用户注册');
  }

  /**
   * 2️⃣ 充值成功通知（USDT 自动到账）
   */
  async notifyDepositSuccess(data: {
    userId: number;
    username?: string;
    amount: string;
    txid: string;
    isInternal?: number;
    realName?: string;
    inviterName?: string;
  }): Promise<void> {
    const { userId, username, amount, txid, isInternal, realName, inviterName } = data;

    // 内部账号不发送通知
    if (isInternal === 1) {
      this.logger.debug(`跳过内部账号充值通知: userId=${userId}`);
      return;
    }

    let message = `💰 *充值到账（USDT）*

${this.formatUserInfo(userId, username)}`;

    if (realName) {
      message += `\n👤 姓名：${realName}`;
    }

    if (inviterName) {
      message += `\n👥 推荐人：${inviterName}`;
    }

    message += `

💵 金额：${amount} USDT
🔗 链：TRON (TRC20)
📥 到账方式：自动上分
🧾 TxID：\`${txid}\`
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '💰 充值到账');
  }

  /**
   * 3.1️⃣ 实名认证提交通知
   */
  async notifyKycSubmitted(data: {
    userId: number;
    username?: string;
    kycType?: string;
  }): Promise<void> {
    const { userId, username, kycType } = data;

    const message = `🪪 *实名认证提交*

${this.formatUserInfo(userId, username)}
📄 认证类型：${kycType || '身份证'}
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '🪪 实名审核');
  }

  /**
   * 3.2️⃣ 实名认证通过通知
   */
  async notifyKycApproved(data: {
    userId: number;
    username?: string;
  }): Promise<void> {
    const { userId, username } = data;

    const message = `🪪 *实名认证通过*

${this.formatUserInfo(userId, username)}
✔️ 状态：已通过
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '✅ 认证通过');
  }

  /**
   * 3.3️⃣ 实名认证驳回通知
   */
  async notifyKycRejected(data: {
    userId: number;
    username?: string;
    reason: string;
  }): Promise<void> {
    const { userId, username, reason } = data;

    const message = `🪪 *实名认证未通过*

${this.formatUserInfo(userId, username)}
❌ 状态：已驳回
📝 原因：${reason}
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '❌ 认证驳回');
  }

  /**
   * 4.1️⃣ 提交提款申请通知
   */
  async notifyWithdrawSubmitted(data: {
    userId: number;
    username?: string;
    amount: string;
    address: string;
    isInternal?: number;
    realName?: string;
    inviterName?: string;
  }): Promise<void> {
    const { userId, username, amount, address, isInternal, realName, inviterName } = data;

    // 内部账号不发送通知
    if (isInternal === 1) {
      this.logger.debug(`跳过内部账号提款申请通知: userId=${userId}`);
      return;
    }

    let message = `💸 *提款申请提交*

${this.formatUserInfo(userId, username)}`;

    if (realName) {
      message += `\n👤 姓名：${realName}`;
    }

    if (inviterName) {
      message += `\n👥 推荐人：${inviterName}`;
    }

    message += `

💵 金额：${amount} USDT
🔗 链：TRON (TRC20)
📬 提现地址：\`${address.substring(0, 10)}...${address.substring(address.length - 6)}\`
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '💸 提款审核');
  }

  /**
   * 4.2️⃣ 提款完成通知
   */
  async notifyWithdrawCompleted(data: {
    userId: number;
    username?: string;
    amount: string;
    txid: string;
    isInternal?: number;
    realName?: string;
    inviterName?: string;
  }): Promise<void> {
    const { userId, username, amount, txid, isInternal, realName, inviterName } = data;

    // 内部账号不发送通知
    if (isInternal === 1) {
      this.logger.debug(`跳过内部账号提款完成通知: userId=${userId}`);
      return;
    }

    let message = `💸 *提款已完成*

${this.formatUserInfo(userId, username)}`;

    if (realName) {
      message += `\n👤 姓名：${realName}`;
    }

    if (inviterName) {
      message += `\n👥 推荐人：${inviterName}`;
    }

    message += `

💵 金额：${amount} USDT
🧾 TxID：\`${txid}\`
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '✅ 提款完成');
  }

  /**
   * 4.3️⃣ 提款失败通知
   */
  async notifyWithdrawFailed(data: {
    userId: number;
    username?: string;
    amount: string;
    reason: string;
  }): Promise<void> {
    const { userId, username, amount, reason } = data;

    const message = `💸 *提款未通过*

${this.formatUserInfo(userId, username)}
💵 金额：${amount} USDT
❌ 状态：失败
📝 原因：${reason}
⏰ 时间：${this.formatTime()}`;

    await this.sendMessage(message, '❌ 提款失败');
  }
}
