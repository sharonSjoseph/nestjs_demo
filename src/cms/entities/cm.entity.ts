import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema({ id: false })
@ObjectType()
export class FieldObj {
  @Prop({ unique: true })
  @Field(() => ID, { nullable: true })
  _id: string;
  @Prop()
  @Field(() => String, { nullable: true })
  fieldName: string;
  @Prop()
  @Field(() => String, { nullable: true })
  type: string;
  @Prop()
  @Field(() => String, { nullable: true })
  value: string;
}

@Schema({ id: false })
@ObjectType()
export class CreatedObj {
  @Prop()
  @Field(() => String)
  author: string;
  @Prop()
  @Field(() => String, { nullable: true })
  picUrl: string;
  @Prop()
  @Field(() => String)
  date: string;
  @Prop()
  @Field(() => String)
  _id: string;
}

@Schema({ id: false })
@ObjectType()
export class ModifiedObj {
  @Prop()
  @Field(() => String)
  author: string;
  @Prop()
  @Field(() => String, { nullable: true })
  picUrl: string;
  @Prop()
  @Field(() => String)
  date: string;
  @Prop()
  @Field(() => String)
  _id: string;
}

@Schema()
@ObjectType()
export class ContentObj {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  @Prop()
  @Field(() => String, { nullable: true })
  title: string;
  @Prop()
  @Field(() => [FieldObj], { nullable: true })
  fields: [FieldObj];
  @Prop()
  @Field(() => Int)
  status: number;
}

@Schema()
@ObjectType()
export class MemberObj {
  @Prop()
  @Field(() => String)
  _id: string;

}

@Schema({ timestamps: true })
@ObjectType()
export class ContentFields {
  @Prop()
  @Field(() => [FieldObj], { nullable: true })
  fields: [FieldObj];
}


@Schema({ timestamps: true })
@ObjectType()
export class Cms {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  @Prop()
  @Field(() => String)
  page: string;
  @Prop()
  @Field(() => String)
  templateId: string;
  @Prop()
  @Field(() => String)
  groupName: string;
  @Prop()
  @Field(() => String, { nullable: true })
  slug: string;
  @Prop()
  @Field(() => String)
  groupId: string;
  @Prop()
  @Field(() => [ContentObj], { nullable: true })
  content: [ContentObj];
  @Prop()
  @Field(() => [FieldObj], { nullable: true })
  fields: [FieldObj];
  @Prop()
  @Field(() => [MemberObj], { nullable: true })
  members: [MemberObj];
  @Field(() => [User], { nullable: true })
  membersData: [User];
  @Prop()
  @Field(() => CreatedObj, { nullable: true })
  created: CreatedObj;
  @Prop()
  @Field(() => ModifiedObj, { nullable: true })
  modified: ModifiedObj;
  @Prop()
  @Field(() => String, { nullable: true })
  cmsType: string;
  @Prop()
  @Field(() => Int,{ defaultValue:1,nullable: true })
  status: number;
}

export const CMSSchema = SchemaFactory.createForClass(Cms);
CMSSchema.virtual('membersData', {
  ref: User.name,
  localField: 'members._id',
  foreignField: '_id',
  justOne: false
})