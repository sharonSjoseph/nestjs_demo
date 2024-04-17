import { ObjectType, Field } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../users/entities/user.entity';


@Schema({ timestamps: true })
@ObjectType()
export class Media {
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;
  @Prop()
  @Field(() => String,{ nullable: true })
  name: string;
  @Prop()
  @Field(() => String,{ nullable: true })
  type: string;
  @Prop()
  @Field(() => String,{ nullable: true })
  file: string;

  @Prop()
  @Field(() => String,{ nullable: true })
  createdBy: string;

  @Field(() => User,{ nullable: true })
  userDetails: User;

  @Prop()
  @Field(() => Date, { description: 'Created At',nullable: true })
  createdAt?: Date;
  @Prop()
  @Field(() => Date, { description: 'Updated At',nullable: true })
  updatedAt?: Date;
}
export const MediaSchema = SchemaFactory.createForClass(Media);
