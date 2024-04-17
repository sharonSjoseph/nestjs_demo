import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCmsGroupInput } from './dto/create-cms-group.input';
import { UpdateCmsGroupInput } from './dto/update-cms-group.input';
import { CMSGroup } from './entities/cms-group.entity';
import constants from '../utils/constants';
import { ListCmsGroupInput } from './dto/list-cms-group.input';

@Injectable()
export class CmsGroupService {
  constructor(
    @InjectModel(CMSGroup.name)
    private readonly cmsGroupModel: Model<CMSGroup>,
  ) {}

  create(createCmsGroupInput: any) {
    const data = new this.cmsGroupModel(createCmsGroupInput);
    return data.save();
  }
  async findGroupName(createCmsGroupInput:any)
  {
    const groupName= createCmsGroupInput.groupName.toLowerCase().replace(/\s/g, "");
    return await this.cmsGroupModel.findOne({ groupName: groupName }).exec();  
  }
  findAll(paginationQuery: ListCmsGroupInput) {
    const { limit, offset } = paginationQuery;
    return this.cmsGroupModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const cmsgroup = await this.cmsGroupModel.findOne({ _id: id }).exec();
    if (!cmsgroup) {
      throw new NotFoundException(`CMS Group ${id} not found`);
    }
    return cmsgroup;
  }

  async getCMSGroups(where: any, paginationQuery: ListCmsGroupInput) {
    const count = await this.cmsGroupModel.count(where);
    const center = await this.cmsGroupModel
      .find(where)
      .skip(paginationQuery.offset)
      .limit(paginationQuery.limit)
      .sort({ createdAt: 'desc' })
      .exec();
    return { center, count };
  }

  async update(id: string, updateCmsGroupInput: UpdateCmsGroupInput) {
    const existingCMSGroup = await this.cmsGroupModel
      .findOneAndUpdate(
        { _id: id },
        { $set: updateCmsGroupInput },
        { new: true },
      )
      .exec();

    if (!existingCMSGroup) {
      throw new NotFoundException(`CMS Group ${id} not found`);
    }
    return existingCMSGroup;
  }

  remove(id: string) {
    return this.cmsGroupModel
      .findByIdAndUpdate(
        id,
        {
          status: constants.DELETED,
        },
        { new: true },
      )
      .exec();
  }

  changeCMSGroupStatus(id: string, status: number) {
    return this.cmsGroupModel
      .findByIdAndUpdate(
        id,
        {
          status: status,
        },
        { new: true },
      )
      .exec();
  }

  async check(data: string) {
    return await this.cmsGroupModel
      .findOne({
        groupName:data,
        status: constants.ACTIVE,
      })
      .exec();
  }

  async findCMSGroups() {
    return this.cmsGroupModel
      .find({ status: { $eq: constants.ACTIVE } })
      .exec();
  }
}
