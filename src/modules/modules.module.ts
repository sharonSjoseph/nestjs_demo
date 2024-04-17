import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Modules, ModulesSchema } from './entities/modules.entity';
import { ModulesService } from './modules.service';

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: Modules.name,
                schema: ModulesSchema
            }
        ])
    ],
    providers: [ModulesService]
})
export class ModulesModule {}
