import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RelayTypes } from '../../common/relay/relay.types';
import { Cms, ContentObj, FieldObj } from '../entities/cm.entity';

@ObjectType()
export class ListCmsResponse extends RelayTypes<Cms>(Cms) {}

@ObjectType()
export class ListFieldObjResponse extends RelayTypes<FieldObj>(
    FieldObj,
) {}

@ObjectType()
export class ListContentObjResponse extends RelayTypes<ContentObj>(
    ContentObj,
) {}

@ObjectType()
export class RespFieldData {
  @Field(() => String)
  _id: string;
  @Field(() => FieldObj, { nullable: true })
  fields: FieldObj;
}

@ObjectType()
export class RespContentData {
  @Field(() => String)
  _id: string;
  @Field(() => String, { nullable: true })
  title: string;
  @Field(() => [RespFieldData], { nullable: true })
  fields: [RespFieldData];
  @Field(() => Int, { nullable: true })
  status: number;
}