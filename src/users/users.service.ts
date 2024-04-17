import { Injectable, NotFoundException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListUsersInput } from './dto/list-users.input';
import constants from 'src/utils/constants';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  findOneWhere(where: any = {}){
    return this.userModel.findOne(where);
  }
  async create(createUserInput: CreateUserInput): Promise<User> {
    
    const { password, ...userData } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ ...userData, password: hashedPassword });

    return user.save();
  }
  //Login
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return { accessToken };
  }

  findAll(paginationQuery: ListUsersInput) {
    const { limit, offset } = paginationQuery;
    return this.userModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ _id: id, status: constants.ACTIVE }).exec();
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async getUserByUserType(userType:string){
    return this.userModel.findOne({userType,status: constants.ACTIVE})
  }

  async update(id: string, updateUserInput: any) {
    const existingUser = await this.userModel
      .findOneAndUpdate({ _id: id }, { $set: updateUserInput }, { new: true })
      .exec();

    if (!existingUser) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return existingUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return user.remove();
  }

  async getUsers(paginationQuery: ListUsersInput) {
    const count = await this.userModel.count();
    const users = await this.findAll(paginationQuery);
    return { users, count };
  }

  async findAllUsersByType(type:string){
    return await this.userModel.find({ userType: type }).exec();
  }

  async findOneData(id: string) {
    const user = await this.userModel.findOne({ _id: id, status: constants.ACTIVE }).exec();
    return user;
  }

}