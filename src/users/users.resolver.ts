import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { ListUsersInput } from './dto/list-users.input';
import { LoginResponse } from './dto/login-response';

import { SetMetadata, UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @SetMetadata('permissions', ['create:users'])
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  addUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }
  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.usersService.login(email, password);
    return accessToken;
  }

  @SetMetadata('permissions', ['read:users'])
  @Query(() => [User], { name: 'users' })
  findAll(@Args('listUsersInput') listUsersInput: ListUsersInput) {
    return this.usersService.findAll(listUsersInput);
  }
}
