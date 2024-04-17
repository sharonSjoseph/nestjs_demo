import { ObjectType } from '@nestjs/graphql';
import { RelayTypes } from '../../common/relay/relay.types';
import { Media } from '../entities/media.entity';

@ObjectType()
export class ListMediaResponse extends RelayTypes<Media>(Media) {}
