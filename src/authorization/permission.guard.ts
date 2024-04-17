import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';
import { ModulesService } from 'src/modules/modules.service';
import { PermissionService } from 'src/permission/permission.service';
import { UsersService } from 'src/users/users.service';
import { invaliduuid } from '../assets/lang/en.json';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
    private readonly permissionService: PermissionService,
    private readonly modulesService: ModulesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const uuid = req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(invaliduuid);
    }
    const userPermissions: any[] = (await this.getPermissions(uuid)) || [];
    const requiredPermissions =
      this.reflector.get('permissions', context.getHandler()) || [];
    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (requiredPermissions.length === 0 || hasAllRequiredPermissions) {
      return true;
    }
    // throw new ForbiddenException('insufficent permission');
    return true;
  }

  async getPermissions(uuid: string): Promise<string[]> {
    
    
    const userDetail = await this.userService.findOne(uuid);
    if (userDetail) {
      const permissions = await this.permissionService.findOneByParam({
        role: userDetail.userType,
      });
      // if (!permissions) {
      //   throw new ForbiddenException('insufficent permission');
      // }
      
      const previllagesArr = [...permissions.privileges];
      if(userDetail?.otherRoles?.length){
        const tempData = await this.permissionService.findAllByParam({role:{$in:userDetail?.otherRoles}});
        for(const td of tempData){
          previllagesArr.push(...td.privileges);
        }
        
      }
      const moduleList = await this.modulesService.getModulesByParam({
        _id: { $in: previllagesArr },
      });
      // if (!moduleList || !moduleList.length) {
      //   throw new ForbiddenException('insufficent permission');
      // }
      let apiAccessArr: string[] = [];
      moduleList.forEach((el) => {
        apiAccessArr = apiAccessArr.concat(el.apiAccess);
      });
      apiAccessArr = [...new Set(apiAccessArr)];
      // if (!apiAccessArr.length) {
      //   throw new ForbiddenException('insufficent permission');
      // }
      return apiAccessArr;
    }else{
      //   throw new ForbiddenException('insufficent permission');
    }
  }
}
