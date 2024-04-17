import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: './schema.gql',
      debug: true,
      playground: true,
      uploads: false,
     // typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      context: ({ req }) => {
        return { req };
      },
      cors: {
        credentials: true,
        origin: true,
    },
    }),
  ],
})
export class GraphqlModule {}
