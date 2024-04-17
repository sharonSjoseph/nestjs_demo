import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCmsGroupInput {
  @Field(() => String)
  groupName: string;
}
