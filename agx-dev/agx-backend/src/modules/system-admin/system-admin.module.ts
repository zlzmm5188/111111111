import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../../entities/admin.entity';
import { AdminRole } from '../../entities/admin-role.entity';
import { SystemMenu } from '../../entities/system-menu.entity';
import { SystemDictType, SystemDictData } from '../../entities/system-dict.entity';
import { SystemConfig, SystemConfigGroup } from '../../entities/system-config.entity';
import { SystemUserController } from './system-user.controller';
import { SystemRoleController } from './system-role.controller';
import { SystemMenuController } from './system-menu.controller';
import { SystemDictController } from './system-dict.controller';
import { SettingConfigController } from './setting-config.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      AdminRole,
      SystemMenu,
      SystemDictType,
      SystemDictData,
      SystemConfig,
      SystemConfigGroup,
    ]),
  ],
  controllers: [
    SystemUserController,
    SystemRoleController,
    SystemMenuController,
    SystemDictController,
    SettingConfigController,
  ],
  providers: [],
  exports: [],
})
export class SystemAdminModule {}
