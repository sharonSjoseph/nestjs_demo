import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsResolver } from './cms.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Cms, CMSSchema } from './entities/cm.entity';
import { CMSGroup, CMSGroupSchema } from 'src/cms-group/entities/cms-group.entity';
import { CmsGroupService } from 'src/cms-group/cms-group.service';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CmsController } from './cms.controller';
import { Permission, PermissionSchema } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';
import { Modules,ModulesSchema } from 'src/modules/entities/modules.entity';
import { ModulesService } from 'src/modules/modules.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cms.name,
        schema: CMSSchema,
      },
      {
        name: CMSGroup.name,
        schema: CMSGroupSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name:Permission.name,
        schema: PermissionSchema 
      },
      {
        name:Modules.name,
        schema: ModulesSchema 
      },
    ]),
  ],
  controllers: [CmsController],
  providers: [CmsResolver, CmsService, CmsGroupService,PermissionService,UsersService,ModulesService],
})
export class CmsModule {}
