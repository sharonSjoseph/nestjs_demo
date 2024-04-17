import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Modules } from './entities/modules.entity';

@Injectable()
export class ModulesService {
    constructor(
        @InjectModel(Modules.name) private readonly modulesModel: Model<Modules>
    ){}

    getModulesByParam(param: any = {}){
        return this.modulesModel.find(param);
    }
}
