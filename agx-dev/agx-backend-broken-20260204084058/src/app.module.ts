import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 公共模块
import { CommonModule } from './common/common.module';

// 业务模块
import { AuthModule } from './modules/auth';
import { AccountModule } from './modules/account';
import { AdminModule } from './modules/admin';
import { PoolModule } from './modules/pool';
import { PoolBonusModule } from './modules/pool-bonus/pool-bonus.module';
import { ContractModule } from './modules/contract';
import { AiModule } from './modules/ai';
import { MarketModule } from './modules/market/market.module';
import { SquareModule } from './modules/square/square.module';
import { InviteModule } from './modules/invite/invite.module';
import { GoldModule } from './modules/gold/gold.module';
import { SocialModule } from './modules/social/social.module';
import { SystemModule } from './modules/system/system.module';
import { TradeModule } from './modules/trade/trade.module';
import { UploadModule } from './modules/upload';
import { OcrModule } from './modules/ocr';
import { NotifyModule } from './modules/notify/notify.module';
import { TronMonitorModule } from './modules/tron-monitor/tron-monitor.module';
import { HealthModule } from './modules/health/health.module';
import { RedisCacheModule } from './modules/cache';
import { TaskModule } from './modules/task/task.module';
import { OtcModule } from './modules/otc/otc.module';
import { AirdropModule } from './modules/airdrop/airdrop.module';
import { SystemAdminModule } from './modules/system-admin/system-admin.module';
import { EarnModule } from './modules/earn/earn.module';
import { ContractMiningModule } from './modules/contract-mining/contract-mining.module';
import { HedraModule } from './modules/hedra/hedra.module';
import { WelfareModule } from './modules/welfare/welfare.module';

// 系统管理模块Entity
import { AdminRole } from './entities/admin-role.entity';
import { SystemMenu } from './entities/system-menu.entity';
import { SystemDictType, SystemDictData } from './entities/system-dict.entity';
import { SystemConfig, SystemConfigGroup } from './entities/system-config.entity';

// 实体
import {
  // 用户模块
  User,
  UserInvite,
  UserLevel,
  // 币种与钱包
  Admin,
  Coin,
  CoinChain,
  Wallet,
  AssetLog,
  Recharge,
  Withdraw,
  // 矿池模块
  PoolProduct,
  PoolHolding,
  PoolIncome,
  PoolBonusConfig,
  PoolCommissionConfig,
  PoolGlobalConfig,
  PoolRepurchaseConfig,
  // 合约模块
  ContractConfig,
  ContractOrder,
  // 交易模块（新增）
  TradingPair,
  SpotOrder,
  CoinIssue,
  CoinSubscription,
  // 行情模块（新增）
  Asset,
  AssetTicker,
  GoldPrice, GoldProduct, GoldAccount, GoldHolding, GoldSettlement, DailySnapshot, HoldingConfig,
  // 广场模块（新增）
  Post,
  Comment,
  Like,
  Follow,
  Topic,
  SensitiveWord,
  PostReview,
  PrivateMessage,
  // 邀请与排行（新增）
  InviteReward,
  Rank,
  Commission,
  // 系统模块
  Kyc,
  Config,
  Notice,
  AdminLog,
  Banner,
  LoginLog,
  Blacklist,
  RiskAlert,
  OtcOrder,
  // 社交模块（新增）
  Friend,
  FriendRequest,
  Conversation,
  Message,
  SystemToggle,
  LevelPermission,
  // 后台配置模块（新增）
  MarketConfig,
  AppMenu,
  I18nText,
  // 会员等级
  MemberLevel,
} from './entities';

// 新手任务模块Entity
import { NewcomerTask, UserTask } from './entities';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 定时任务模块
    ScheduleModule.forRoot(),
    // 事件发射器模块
    EventEmitterModule.forRoot(),
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        return {
          type: (process.env.DB_TYPE as any) || 'postgres',
          host: process.env.DB_HOST || '127.0.0.1',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'agx',
          password: process.env.DB_PASSWORD || 'AGX2025Pass',
          database: process.env.DB_DATABASE || 'agx',
          entities: [
            // 用户模块
            User, UserInvite, UserLevel,
            // 币种与钱包
            Admin, Coin, CoinChain, Wallet, AssetLog, Recharge, Withdraw,
            // 矿池模块
            PoolProduct, PoolHolding, PoolIncome, PoolBonusConfig, PoolCommissionConfig, PoolGlobalConfig, PoolRepurchaseConfig,
            // 合约模块
            ContractConfig, ContractOrder,
            // 交易模块（新增）
            TradingPair, SpotOrder, CoinIssue, CoinSubscription,
            // 行情模块（新增）
            Asset, AssetTicker, GoldPrice, GoldProduct, GoldAccount, GoldHolding, GoldSettlement, DailySnapshot, HoldingConfig,
            // 广场模块（新增）
            Post, Comment, Like, Follow, Topic, SensitiveWord, PostReview, PrivateMessage,
            // 邀请与排行（新增）
            InviteReward, Rank, Commission,
            // 系统模块
            Kyc, Config, Notice, AdminLog, Banner, LoginLog, Blacklist, RiskAlert, OtcOrder,
            // 社交模块（新增）
            Friend, FriendRequest, Conversation, Message, SystemToggle, LevelPermission,
            // 后台配置模块（新增）
            MarketConfig, AppMenu, I18nText,
            // 新手任务模块
            NewcomerTask, UserTask,
            // 会员等级
            MemberLevel,
            // 系统管理模块
            AdminRole, SystemMenu, SystemDictType, SystemDictData, SystemConfig, SystemConfigGroup,
          ],
          synchronize: false,
          logging: process.env.NODE_ENV !== 'production',
        };
      },
      inject: [],
    }),
  // 公共模块
  CommonModule,
  // 业务模块
    AuthModule,
    AccountModule,
    AdminModule,
    PoolModule,
    PoolBonusModule,
    ContractModule,
    AiModule,
    // 新增模块
    MarketModule,
    SquareModule,
    InviteModule,
    GoldModule,
    SocialModule,
    SystemModule,
    TradeModule,
    UploadModule,
    OcrModule,
    NotifyModule,
    TronMonitorModule,
    HealthModule,
    RedisCacheModule,
    TaskModule,
    OtcModule,
    AirdropModule,
    SystemAdminModule,
    EarnModule,
    ContractMiningModule,
    HedraModule,
    WelfareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}