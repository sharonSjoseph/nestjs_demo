import { CreateCmsInput } from './create-cm.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCmsInput extends PartialType(CreateCmsInput) {
  @Field(() => String)
  _id: string;
}
