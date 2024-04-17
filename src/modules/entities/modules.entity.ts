import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
@ObjectType()
export class ConditionData {
  @Prop()
  @Field(() => String)
  field: string;
  @Prop()
  @Field(() => String)
  condition: string;
  @Prop()
  @Field(() => String)
  value: string;
}


@Schema({ timestamps: true })
@ObjectType()
export class Modules {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  @Prop()
  @Field(() => String)
  moduleName: string;
  @Prop()
  @Field(() => String)
  display: string;
  @Prop({ type: MongooseSchema.Types.ObjectId })
  @Field(() => String, { nullable: true })
  parent: string;
  @Prop()
  @Field(() => Int)
  priority: number;
  @Prop()
  @Field(() => Boolean)
  isMenu: boolean;
  @Prop()
  @Field(() => String, { nullable: true })
  url: string;
  @Prop()
  @Field(() => String)
  icon: string;
  @Prop()
  @Field(() => [ConditionData], { nullable: true })
  addCondition: [ConditionData];
  @Prop({default:[]})
  @Field(() => [String], { nullable: true })
  apiAccess: [] | [string];
  @Prop()
  @Field(() => Int, { defaultValue: 1 })
  status: number;
  @Prop()
  @Field(() => Date, { description: 'Created At' })
  createdAt?: Date
  @Prop()
  @Field(() => Date, { description: 'Updated At' })
  updatedAt?: Date
}

export const ModulesSchema = SchemaFactory.createForClass(Modules);
