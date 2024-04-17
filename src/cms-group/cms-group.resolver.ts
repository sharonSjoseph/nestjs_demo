import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CmsGroupService } from './cms-group.service';
import { CMSGroup } from './entities/cms-group.entity';
import { CreateCmsGroupInput } from './dto/create-cms-group.input';
import { UpdateCmsGroupInput } from './dto/update-cms-group.input';
import { UserInputError } from 'apollo-server-express';
import { uuid_required, already_exist } from '../assets/lang/en.json';
import { ListCmsGroupInput } from './dto/list-cms-group.input';
import { ListCmsGroupResponse } from './dto/list.cms-group.response';
import ConnectionArgs, {
  getPagingParameters,
} from 'src/common/relay/connection.args';
import constants from 'src/utils/constants';
import { connectionFromArraySlice } from 'graphql-relay';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, SetMetadata, UseGuards, CACHE_MANAGER, Inject  } from '@nestjs/common';
import { PermissionsGuard } from 'src/authorization/permission.guard';
import { Cache } from 'cache-manager';


@Resolver(() => CMSGroup)
export class CmsGroupResolver {
  constructor(private readonly cmsGroupService: CmsGroupService,
    private readonly userService: UsersService,

    ) {}

    @UseGuards(PermissionsGuard)
    @SetMetadata('permissions', ['create:CmsGroup'])
  @Mutation(() => CMSGroup)
  async createCmsGroup(
    @Context() context,
    @Args('createCmsGroupInput') createCmsGroupInput: CreateCmsGroupInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    createCmsGroupInput.groupName = createCmsGroupInput.groupName.toLowerCase().replace(/\s/g, "");
    const checkName = await this.cmsGroupService.check(
      createCmsGroupInput.groupName,
    );
    if (checkName) {
      throw new UserInputError(already_exist);
    }
    const postData = { ...createCmsGroupInput, status: 1 };
    return this.cmsGroupService.create(postData);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:CmsGroup'])
  @Query(() => [CMSGroup], { name: 'cmsGroups' })
  async findAll(
    @Context() context,
    @Args('listCmsGroupInput') listCmsGroupInput: ListCmsGroupInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.findAll(listCmsGroupInput);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:CmsGroup'])
  @Query(() => CMSGroup, { name: 'cmsGroup' })
  async findOne(
    @Context() context,
    @Args('id', { type: () => String }) id: string,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.findOne(id);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:ListCmsGroup'])
  @Query(() => ListCmsGroupResponse, { name: 'listCMSGroupsWithCursor' })
  async findAllWithCursor(
    @Context() context,
    @Args('args') args: ConnectionArgs,
    @Args('search') search: string,
    @Args('filter', { type: () => Int,nullable:true }) filter: number,
  ): Promise<ListCmsGroupResponse> {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }

    let { limit, offset } = getPagingParameters(args);
    if (args.first < 0) {
      args.first = constants.paginationLimit
      limit = constants.paginationLimit;
      offset = 0;
      }
    const postData: any = { status: { $not: { $eq: constants.DELETED } } };

    if ((filter && search) || (filter === 0  && search)) {

      const columns = ['groupName'];
      postData['$or'] = [];
      columns.forEach((el: string) => {
        const sdata: any = {};
        sdata[`${el}`] = { $regex: new RegExp(`${search.trim()}`, 'i') };
        postData['$or'].push(sdata);
      });
  }
  if (search) {
    if (search && search !== '') {
      const columns = ['groupName'];
      postData['$or'] = [];
      columns.forEach((el: string) => {
        const sdata: any = {};
        sdata[`${el}`] = { $regex: new RegExp(`${search.trim()}`, 'i') };
        postData['$or'].push(sdata);
      });
    }
  }
  if ((filter || filter === 0) && search === '') {
      postData['$or'] = [{status :filter}];    
  }
    const { center, count } = await this.cmsGroupService.getCMSGroups(
      postData,
      {
        limit,
        offset,
      },
    );
    const page = connectionFromArraySlice(center, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });

    return { page, pageData: { count, limit, offset } };
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:CmsGroup'])
  @Mutation(() => CMSGroup)
  async updateCMSGroup(
    @Context() context,
    @Args('UpdateCmsGroupInput') updateCmsGroupInput: UpdateCmsGroupInput,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.update(
      updateCmsGroupInput._id,
      updateCmsGroupInput,
    );
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:CmsGroup'])
  @Mutation(() => CMSGroup)
  async removeCMSGroup(
    @Context() context,
    @Args('id', { type: () => String }) id: string,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.remove(id);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['update:CmsGroup'])
  @Mutation(() => CMSGroup)
  async changeCMSGroupStatus(
    @Context() context,
    @Args('_id', { type: () => String }) id: string,
    @Args('status', { type: () => Int }) status: number,
  ) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.changeCMSGroupStatus(id, status);
  }

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:CmsGroup'])
  @Query(() => [CMSGroup], { name: 'allCMSGroup' })
  async allCmsGroup(@Context() context) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    return this.cmsGroupService.findCMSGroups();
  }
}
