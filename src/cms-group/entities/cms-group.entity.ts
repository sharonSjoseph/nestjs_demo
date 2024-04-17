import { ObjectType, Field } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class CMSGroup {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  @Prop()
  @Field(() => String)
  groupName: string;
  @Prop()
  @Field(() => Number, { description: 'status' })
  status: number;
  @Prop()
  @Field(() => Date, { description: 'Created At' })
  createdAt?: Date;
  @Prop()
  @Field(() => Date, { description: 'Updated At' })
  updatedAt?: Date;
}

export const CMSGroupSchema = SchemaFactory.createForClass(CMSGroup);
