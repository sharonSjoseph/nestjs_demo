import { ObjectType } from '@nestjs/graphql';
import { RelayTypes } from '../../common/relay/relay.types';
import { CMSGroup } from '../entities/cms-group.entity';

@ObjectType()
export class ListCmsGroupResponse extends RelayTypes<CMSGroup>(CMSGroup) {}
