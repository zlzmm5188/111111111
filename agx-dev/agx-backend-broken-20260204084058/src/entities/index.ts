// ===== 用户模块 =====
export { User } from './user.entity';
export { UserInvite } from './user-invite.entity';
export { UserLevel } from './user-level.entity';

// ===== 币种与钱包 =====
export { Coin } from './coin.entity';
export { CoinChain } from './coin-chain.entity';
export { Wallet } from './wallet.entity';
export { AssetLog } from './asset-log.entity';
export { Recharge } from './recharge.entity';
export { Withdraw } from './withdraw.entity';

// ===== 矿池模块 =====
export { PoolProduct } from './pool-product.entity';
export { PoolHolding } from './pool-holding.entity';
export { PoolIncome } from './pool-income.entity';
export { PoolBonusConfig } from './pool-bonus-config.entity';
export { PoolCommissionConfig } from './pool-commission-config.entity';
export { PoolGlobalConfig } from './pool-global-config.entity';
export { PoolRepurchaseConfig } from './pool-repurchase-config.entity';

// ===== 合约模块 =====
export { ContractConfig } from './contract-config.entity';
export { ContractOrder } from './contract-order.entity';

// ===== 交易模块（新增） =====
export { TradingPair } from './trading-pair.entity';
export { SpotOrder } from './spot-order.entity';
export { CoinIssue } from './coin-issue.entity';
export { CoinSubscription } from './coin-subscription.entity';

// ===== 行情模块（新增） =====
export { Asset } from './asset.entity';
export { AssetTicker } from './asset-ticker.entity';
export { GoldPrice } from './gold-price.entity';
export { GoldProduct } from './gold-product.entity';
export { GoldAccount } from './gold-account.entity';
export { GoldHolding } from './gold-holding.entity';
export { GoldSettlement } from './gold-settlement.entity';
export { DailySnapshot } from './daily-snapshot.entity';
export { HoldingConfig } from './holding-config.entity';
export { HoldingDistribution } from './holding-distribution.entity';
export { ExchangeRecord } from './exchange-record.entity';

// ===== 广场模块(新增) =====
export { Post } from './post.entity';
export { Comment } from './comment.entity';
export { Like } from './like.entity';
export { Follow } from './follow.entity';
export { Topic } from './topic.entity';
export { SensitiveWord } from './sensitive-word.entity';
export { PostReview } from './post-review.entity';
export { PrivateMessage } from './private-message.entity';
export { Report } from './report.entity';
export { ReviewLog } from './review-log.entity';

// ===== 邀请与排行（新增） =====
export { InviteReward } from './invite-reward.entity';
export { Rank } from './rank.entity';
export { Commission } from './commission.entity';

// ===== 激励体系（新增） =====
export { CommissionTier } from './commission-tier.entity';
export { InviteBonusTier } from './invite-bonus-tier.entity';
export { InviteBonusRecord } from './invite-bonus-record.entity';
export { MemberLevel } from './member-level.entity';
export { UserProductCommissionStats } from './user-product-commission-stats.entity';

// ===== 新手任务模块 =====
export { NewcomerTask } from './newcomer-task.entity';
export { UserTask } from './user-task.entity';

// ===== 社交模块（新增） =====
export { Friend } from './friend.entity';
export { FriendRequest } from './friend-request.entity';
export { Conversation } from './conversation.entity';
export { Message } from './message.entity';

// ===== 系统模块 =====
export { Admin } from './admin.entity';
export { AdminLog } from './admin-log.entity';
export { Kyc } from './kyc.entity';
export { Config } from './config.entity';
export { Notice } from './notice.entity';
export { SystemToggle } from './system-toggle.entity';
export { LevelPermission } from './level-permission.entity';
export { Banner } from './banner.entity';
export { LoginLog } from './login-log.entity';
export { Blacklist, RiskAlert } from './blacklist.entity';
export { OtcOrder } from './otc-order.entity';
export { OtcAdvertisement } from './otc-advertisement.entity';
export { MarketConfig } from './market-config.entity';
export { AppMenu } from './app-menu.entity';
export { I18nText } from './i18n-text.entity';
export { OperationLog } from './operation-log.entity';