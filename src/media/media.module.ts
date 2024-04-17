import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { Media, MediaSchema } from './entities/media.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Permission, PermissionSchema } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';
import { Modules,ModulesSchema } from 'src/modules/entities/modules.entity';
import { ModulesService } from 'src/modules/modules.service';
import { FirebaseService } from 'src/utils/firebase.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Media.name,
        schema: MediaSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
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
  providers: [MediaResolver, MediaService,PermissionService,UsersService,ModulesService, FirebaseService]
})
export class MediaModule {}
