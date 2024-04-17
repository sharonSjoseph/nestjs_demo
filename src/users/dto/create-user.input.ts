import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  _id: string;
  @Field(() => String, { description: 'first name of the user' })
  firstName: string;
  @Field(() => String, { description: 'last name of the user', nullable: true })
  lastName: string;
  @Field(() => String, { description: 'email of the user' })
  email: string;
  @Field(() => String, { description: 'phone no of the user' })
  phone: string;
  @Field(() => String, { description: 'firebase token' })
  fcmToken: string;
  @Field(() => String, { description: 'firebase token' })
  picUrl: string;
  @Field(() => String, { description: 'user type of user' })
  userType: string;
  @Field(() => [String], { nullable: true })
  otherRoles: [string];
  @Field(() => Int, { description: 'user type of user' })
  status: number;

  // Add password field
  @Field(() => String,{ description: 'password of user' }) 
  password: string;
}
