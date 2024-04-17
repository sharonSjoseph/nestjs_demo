import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
    constructor(
        @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>
    ){}
    async findOneByParam(where:any ={}){
        return this.permissionModel.findOne(where);
    }
    async findAllByParam(where:any ={}){
        return this.permissionModel.find(where);
    }
}
