import { Module } from '@nestjs/common';
import { CmsGroupService } from './cms-group.service';
import { CmsGroupResolver } from './cms-group.resolver';
import { CMSGroup, CMSGroupSchema } from './entities/cms-group.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Permission, PermissionSchema } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';
import { Modules,ModulesSchema } from 'src/modules/entities/modules.entity';
import { ModulesService } from 'src/modules/modules.service';

@Module({
  imports: [
    MongooseModule.forFeature([
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
  providers: [CmsGroupResolver, CmsGroupService,PermissionService,UsersService,ModulesService],
})
export class CmsGroupModule {}
