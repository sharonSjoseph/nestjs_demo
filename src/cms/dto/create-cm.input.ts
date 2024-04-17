import { InputType, Field,Int } from '@nestjs/graphql';

@InputType()
export class FieldData {
  @Field(() => String, { nullable: true })
  _id?: string;
  @Field(() => String, { nullable: true })
  fieldName: string;
  @Field(() => String, { nullable: true })
  type: string;
  @Field(() => String, { nullable: true })
  value: string;
}

@InputType()
export class CreateFieldDataInp {
  @Field(() => String)
  _id: string;
  @Field(() => String, {nullable: true})
  contentId: string;
  @Field(() => [FieldData], { nullable: true })
  fields: [FieldData];

}

@InputType()
export class CreateLayoutDataInp {
  @Field(() => String)
  _id: string;
  @Field(() => FieldData, { nullable: true })
  fields: FieldData;
}

@InputType()
export class CreateContentDataInp {
  @Field(() => String, { nullable: true })
  title: string;
  @Field(() => [FieldData], { nullable: true })
  fields: [FieldData];
  @Field(() => Int, { nullable: true })
  status: number;
}

@InputType()
export class CreatedData {
  @Field(() => String)
  author: string;
  @Field(() => String, { nullable: true })
  picUrl: string;
  @Field(() => String)
  date: string;
}

@InputType()
export class ModifiedData {
  @Field(() => String)
  author: string;
  @Field(() => String, { nullable: true })
  picUrl: string;
  @Field(() => String)
  date: string;
}

@InputType()
export class MemberObject {
  @Field(() => String)
  _id: string;

}

@InputType()
export class CreateCmsInput {
  @Field(() => String)
  page: string;
  @Field(() => String)
  templateId: string;
  @Field(() => String, { nullable: true })
  cmsType: string;
  @Field(() => String)
  groupId: string;
  @Field(() => String,{ nullable: true })
  slug: string;
  @Field(() => String,{ nullable: true })
  groupName: string;
  @Field(() => [FieldData], { nullable: true })
  fields: [FieldData];
  @Field(() => [MemberObject], { nullable: true })
  members: [MemberObject];
  @Field(() => CreatedData , { nullable: true })
  created: CreatedData;
  @Field(() => ModifiedData, { nullable: true })
  modified: ModifiedData;
  @Field(() => Int , { nullable: true })
  status: number;
}
