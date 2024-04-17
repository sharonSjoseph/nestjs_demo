import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMediaInput {
  @Field(() => String,{ nullable: true })
  name: string;
  @Field(() => String,{ nullable: true })
  type: string;
  @Field(() => String,{ nullable: true })
  file: string;
  @Field(() => String,{ nullable: true })
  createdBy: string;
}
