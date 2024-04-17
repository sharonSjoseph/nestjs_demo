import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import {Post, Get, Param } from '@nestjs/common';
import { CmsService } from './cms.service';
import { Cms, ContentFields } from './entities/cm.entity';
import { CreateCmsInput, CreateContentDataInp, CreateFieldDataInp, CreateLayoutDataInp} from './dto/create-cm.input';
import { UpdateCmsInput } from './dto/update-cm.input';
import { UserInputError } from 'apollo-server-express';
import { uuid_required } from '../assets/lang/en.json';
import { ListCmsInput } from './dto/list-cms.input';
import { ListCmsResponse,ListContentObjResponse,ListFieldObjResponse, RespContentData, RespFieldData } from './dto/list.cms.response';
import ConnectionArgs, {
  getPagingParameters,
} from 'src/common/relay/connection.args';
import constants from 'src/utils/constants';
import { connectionFromArraySlice } from 'graphql-relay';
import { CmsGroupService } from 'src/cms-group/cms-group.service';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, SetMetadata, UseGuards, CACHE_MANAGER, Inject  } from '@nestjs/common';
import { PermissionsGuard } from 'src/authorization/permission.guard';
import { Cache } from 'cache-manager';
import mongoose from 'mongoose';


@Resolver(() => Cms)
export class CmsResolver {
  constructor(
    private readonly cmsService: CmsService,
    private readonly cmsGroupService: CmsGroupService,
    private readonly userService: UsersService,

  ) {}

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['create:cms'])
  @Mutation(() => Cms)
  async createCms(
    @Context() context,
    @Args('createCmsInput') createCmsInput: CreateCmsInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
   const userDetails = await this.userService.findOne(uuid);   
   if (!userDetails) {
     throw new UserInputError(uuid_required);
   }
   const checkTemplate = await this.cmsService.findTemplateName(createCmsInput);
   if (checkTemplate) {
    throw new UserInputError(`${createCmsInput.templateId} already exist`);
  }
  createCmsInput.templateId = createCmsInput.templateId.toLowerCase().replace(/\s/g, "");
   const posted = {
     _id:uuid,
    author: `${userDetails.firstName} ${userDetails.lastName}`,
     picUrl: userDetails.picUrl,
     date:  constants.currentOnlyDate().toString(),
   };
   createCmsInput.created = posted;
   createCmsInput.modified = posted;
    const postData: any = { ...createCmsInput };
    postData.cmsType = (createCmsInput?.cmsType) ? createCmsInput?.cmsType : 'other';
    postData.content = [];
    if (createCmsInput.groupId) {
      const group = await this.cmsGroupService.findOne(createCmsInput.groupId);
      postData.groupName = group.groupName;
    }
    return this.cmsService.create(postData);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['create:createCmsFields'])
  @Mutation(() => RespFieldData)
  async createCmsFields(
    @Context() context,
    @Args('createCmsFieldsInput') createCmsInput: CreateFieldDataInp,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.createFields(createCmsInput);
  }


  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['create:createCmsFields'])
  @Mutation(() => Cms)
  async createCmsContent(
    @Context() context,
    @Args('createCmsContentInput') createCmsContentInput: CreateContentDataInp,
    @Args('id') id: string,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const postData: any = {...createCmsContentInput};
    postData.status = 1
    postData._id = new mongoose.Types.ObjectId()
    return this.cmsService.createContent(postData, id);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:cmsList'])
  @Query(() => [Cms], { name: 'cmsList' })
  async findAll(
    @Context() context,
    @Args('listCmsInput') listCmsInput: ListCmsInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.findAll(listCmsInput);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:cmsList'])
  @Query(() => Cms, { name: 'cms' })
  async findOne(
    @Context() context,
    @Args('id', { type: () => String }) id: string,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.findOne(id);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:listCmsWithCursor'])
  @Query(() => ListCmsResponse, { name: 'listCmsWithCursor' })
  async findAllCMSWithCursor(
    @Context() context,
    @Args('args') args: ConnectionArgs,
    @Args('filter') filter: string,
    @Args('search') search: string,
  ): Promise<ListCmsResponse> {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const user = await this.userService.findOne(uuid);
    let { limit, offset } = getPagingParameters(args);
    if (args.first < 0) {
      args.first = constants.paginationLimit
      limit = constants.paginationLimit;
      offset = 0;
    }
    let postData: any;
    if (user.userType === constants.ADMIN) {
      postData = { status: { $not: { $eq: constants.DELETED } } };
    } else {
      postData = { status: { $not: { $eq: constants.DELETED } }, 'members._id': uuid };
    }
    if (filter && search) {
      const columns = ['page,groupId'];
      postData['$or'] = [];
      columns.forEach((el: string) => {
        const sdata: any = {};
        sdata[`${el}`] = { $regex: new RegExp(`${filter.trim()}`, 'i') };
        postData['$or'].push(sdata);
      });      
    }
    if (search) {
      if (search && search !== '') {
        const columns = ['page'];
        postData['$or'] = [];
        columns.forEach((el: string) => {
          const sdata: any = {};
          sdata[`${el}`] = { $regex: new RegExp(`${search.trim()}`, 'i') };
          postData['$or'].push(sdata);
        });
      }
    }
    if (filter) {
      if (filter && filter !== '') {
        const columns = ['groupId'];
        postData['$or'] = [];
        columns.forEach((el: string) => {
          const sdata: any = {};
          sdata[`${el}`] = { $regex: new RegExp(`${filter.trim()}`, 'i') };
          postData['$or'].push(sdata);
        });
      }
    }
    const { center, count } = await this.cmsService.getCms(postData, {
      limit,
      offset,
    });
    const page = connectionFromArraySlice(center, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });

    return { page, pageData: { count, limit, offset } };
  }

  // list all contents with cursor
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:filterCmsList'])
  @Query(() => ListContentObjResponse, { name: 'listCmsContentsWithCursor' })
  async findAllCMSContentsWithCursor(
    @Context() context,
    @Args('args') args: ConnectionArgs,
    @Args('cmsId') cmsId: string,
  ): Promise<ListContentObjResponse> {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    let limit: number;
    let offset: number;
    const postData: any = { _id: cmsId};

    if (args.first < 0) {
      limit = constants.paginationLimit;
      offset = 0;
    } else {
      const val = getPagingParameters(args);
      limit = val.limit;
      offset = val.offset;
    }
    const { content, count } = await this.cmsService.getCmsContents(postData, {
      limit,
      offset,
    });
    const page = connectionFromArraySlice(
      content,
      { first: args.first < 0 ? limit : count },
      {
        arrayLength: count,
        sliceStart: offset || 0,
      },
    );

    return { page, pageData: { count, limit, offset } };
  }


  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:listCmsField'])
  @Query(() => ListFieldObjResponse, { name: 'listCmsFieldWithCursor' })
  async findAllnewsfeedsCommentCursor(
    @Args('args') args: ConnectionArgs,
    @Args('id', { type: () => String }) id: string,
    @Args('search', { type: () => String }) search: string,
    @Args('filter', { type: () => String }) filter: string,

  ): Promise<ListFieldObjResponse> {
    let { limit, offset } = getPagingParameters(args);
    if (args.first < 0) {
    args.first = constants.paginationLimit
    limit = constants.paginationLimit;
    offset = 0;
    }

    const { cms , count } = await this.cmsService.findAllCmsFieldCursor(id,filter,search,{ limit, offset });
    const page = connectionFromArraySlice(cms, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });
    return { page, pageData: { count, limit, offset } };
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:cms'])
  @Mutation(() => Cms)
  async updateCMS(
    @Context() context,
    @Args('UpdateCmsInput') updateCmsInput: UpdateCmsInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
       const checkTemplate = await this.cmsService.findTemplateNameByupdate(updateCmsInput);
   if (checkTemplate) {
    throw new UserInputError(`${updateCmsInput.templateId} already exist`);
  }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };
     updateCmsInput.modified = posted;
     if (updateCmsInput.groupId) {
      const group = await this.cmsGroupService.findOne(updateCmsInput.groupId);
      updateCmsInput.groupName = group.groupName;
    }
    const postData: any = { ...updateCmsInput }; 
    return this.cmsService.update(updateCmsInput._id, postData);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
    @Mutation(() => RespFieldData)
    async updateCMSField(
      @Context() context,
      @Args('createCmsFieldsInput') createCmsInput: CreateFieldDataInp,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };

    return this.cmsService.updateCMSField(createCmsInput,posted);
  }



  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
    @Mutation(() => Cms)
    async updateCMSContent(
      @Context() context,
      @Args('cmsId', { type: () => String }) cmsId: string,
      @Args('contentId', { type: () => String }) contentId: string,
      @Args('createCmsContentInput') createCmsContentInput: CreateContentDataInp,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };

    return this.cmsService.updateCMSConent(createCmsContentInput, posted, cmsId, contentId);
  }

  // find all fields of one content
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
  @Query(() => [ContentFields], {name: 'findContentFields'})
    async findContentFields(
      @Context() context,
      @Args('cmsId', { type: () => String }) cmsId: string,
      @Args('contentId', { type: () => String }) contentId: string,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }

    const res = await this.cmsService.findWhere({'content._id': new mongoose.Types.ObjectId(contentId)});
    const result = res[0].content.filter((i) => i._id.toString() === contentId.toString())
    return result;
  }

  // delete one field of a content
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
  @Query(() => [ContentFields], {name: 'deleteContentField'})
    async deleteContentField(
      @Context() context,
      @Args('cmsId', { type: () => String }) cmsId: string,
      @Args('contentId', { type: () => String }) contentId: string,
      @Args('fieldId', { type: () => String }) fieldId: string,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }

    const res = await this.cmsService.deleteFieldInContent(cmsId, contentId, fieldId);
    const result = res[0].content.filter((i) => i._id.toString() === contentId.toString())
    return result;
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:listCmsField'])
  @Query(() => RespFieldData, { name: 'fieldsContentFindOne' })
  async fieldsContentFindOne(
    @Args('createCmsFieldsInput') createCmsInput: CreateFieldDataInp,
  ) {

    const resp = this.cmsService.fieldsContentFindOne(
      createCmsInput,
    );   
    return resp;    
  }
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:cms'])
  @Mutation(() => Cms)
  async removeFieldsContent(
    @Args('createCmsInput') createCmsInput: CreateFieldDataInp,
  ) {
    return this.cmsService.removeFieldsContent(createCmsInput);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:cms'])
  @Mutation(() => Cms)
  async removeCMS(
    @Context() context,
    @Args('id', { type: () => String }) id: string,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.remove(id);
  }
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:cms'])
  @Mutation(() => Cms)
  async changeCMSStatus(
    @Context() context,
    @Args('_id', { type: () => String }) id: string,
    @Args('status', { type: () => Int }) status: number,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.changeCMSStatus(id, status);
  }
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['list:cms'])
  @Query(() => [Cms], { name: 'allCMS' })
  async allCms(@Context() context) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsService.findCMS();
  }

  // website
  @Query(() => [Cms], { name: 'allCMSData' })
  async allCMSData(@Args('search') search: string) {
    let match: any = { status: constants.ACTIVE, slug: { $not: { $in: ['', null] } } }
    if (search && search !== '') {
      const columns = ['page'];
      match['$or'] = [];
      columns.forEach((el: string) => {
        const sdata: any = {};
        sdata[`${el}`] = { $regex: new RegExp(`${search.trim()}`, 'i') };
        match['$or'].push(sdata);
      });
    }
    return this.cmsService.findWhere(match);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
    @Mutation(() => RespFieldData)
    async createLayoutField(
      @Context() context,
      @Args('createLayoutField') createLayoutField: CreateLayoutDataInp,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };

    return this.cmsService.createLayoutField(createLayoutField);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
    @Mutation(() => RespFieldData)
    async updateLayoutField(
      @Context() context,
      @Args('updateLayoutField') updateLayoutField: CreateLayoutDataInp,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };

    return this.cmsService.updateLayoutField(updateLayoutField, posted);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:editCmsField'])
    @Mutation(() => Cms)
    async removeLayoutField(
      @Context() context,
      @Args('removeLayoutField') removeLayoutField: CreateLayoutDataInp,
    ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    const userDetails = await this.userService.findOne(uuid);   
    if (!userDetails) {
      throw new UserInputError(uuid_required);
    }
    const posted = {
      _id:uuid,
      author: `${userDetails.firstName} ${userDetails.lastName}`,
       picUrl: userDetails.picUrl,
       date:  constants.currentOnlyDate().toString(),
     };

    return this.cmsService.removeLayoutField(removeLayoutField);
  }
}
