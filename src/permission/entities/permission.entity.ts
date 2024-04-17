import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
@ObjectType()
export class ConditionDetails {
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


@Schema()
@ObjectType()
export class ModulesData {
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
  @Field(() => [ConditionDetails], { nullable: true })
  addCondition: [ConditionDetails];
  @Prop()
  @Field(() => Int, { defaultValue: 1 })
  status: number;
}

@Schema({ timestamps: true })
@ObjectType()
export class Permission {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String)
  role: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId] })
  @Field(() => [String])
  privileges: [string];

  @Prop()
  @Field(() => Date, { description: 'Created At' })
  createdAt?: Date
  
  @Prop()
  @Field(() => Date, { description: 'Updated At' })
  updatedAt?: Date

}

@Schema()
@ObjectType()
export class PermissionResp {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  
  @Prop({ type: MongooseSchema.Types.ObjectId })
  @Field(() => [String])
  privileges: [string];

  @Prop()
  @Field(() => [ModulesData])
  modulesObjects: [ModulesData]
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);
export const PermissionRespSchema = SchemaFactory.createForClass(PermissionResp);
