import { CreateCmsGroupInput } from './create-cms-group.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCmsGroupInput extends PartialType(CreateCmsGroupInput) {
  @Field(() => String)
  _id: string;
}
