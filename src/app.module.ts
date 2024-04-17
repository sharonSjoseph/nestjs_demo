import { Module } from '@nestjs/common';
import { CmsGroupModule } from './cms-group/cms-group.module';
import { CommonModule } from './common/common.module';
import { CmsModule } from './cms/cms.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { PermissionModule } from './permission/permission.module';
import {
  Permission,
  PermissionSchema,
} from './permission/entities/permission.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/entities/user.entity';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),
    PermissionModule,
    ModulesModule,
    CmsModule,
    CmsGroupModule,
    UsersModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
