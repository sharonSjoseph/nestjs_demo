import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ListMediaInput {
  @Field(() => Number, { description: 'classical limit' })
  limit: number;
  @Field(() => Number, { description: 'classical offset' })
  offset: number;
}
