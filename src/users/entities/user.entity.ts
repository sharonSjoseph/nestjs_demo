import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({ _id: false, timestamps: true })
@ObjectType()
export class User {
  @Prop()
  @Field(() => String)
  _id: string;

  @Prop()
  @Field(() => String,{nullable: true})
  firstName: string;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  lastName: string;

  @Prop()
  @Field(() => String,{nullable: true})
  email: string;

  //Add password
  @Prop()
  @Field(() => String, { nullable: true })
  password: string;

  @Prop()
  @Field(() => String,{nullable: true})
  phone: string;

  @Prop()
  @Field(() => String,{nullable: true})
  picUrl: string;

  @Prop({ default: null })
  @Field(() => String,{nullable: true})
  fcmToken: string;

  @Prop()
  @Field(() => String,{nullable: true})
  userType: string;

  @Prop()
  @Field(() => [String], { nullable: true })
  otherRoles: [string];

  @Prop({ default: 1 })
  @Field(() => Int,{nullable: true})
  status: number;

  @Prop()
  @Field(() => Date, { description: 'Created At',nullable:true })
  createdAt?: Date

  @Prop()
  @Field(() => Date, { description: 'Updated At',nullable:true })
  updatedAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User);
