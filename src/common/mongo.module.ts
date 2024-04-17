import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        let uri: string = process.env.MONGODB_URL;
        let dbName: string;
        if (nodeEnv === 'development') {
          dbName = process.env.DBNAMEDEV;
        }
        if (nodeEnv === 'production') {
          dbName = process.env.DBNAMELIVE;
          uri = process.env.MONGODB_URL_PROD
        }
        return {
          uri,
          dbName: dbName,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MongoModule {}
