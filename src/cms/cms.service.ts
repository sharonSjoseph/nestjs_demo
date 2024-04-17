import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import constants from 'src/utils/constants';
import { ListCmsInput } from './dto/list-cms.input';
import { Cms } from './entities/cm.entity';
import { ListPageInput } from 'src/common/dto/pag-list.dto';
import { CreateCmsInput, CreateFieldDataInp} from './dto/create-cm.input';
import { type } from 'os';

@Injectable()
export class CmsService {
  constructor(
    @InjectModel(Cms.name)
    private readonly cmsModel: Model<Cms>,
  ) {}

   create(createCmsInput: any) {  
    const data = new this.cmsModel(createCmsInput);
    return data.save();
  }
  async findTemplateName(createCmsInput:any)
  {
    const templateId= createCmsInput.templateId.toLowerCase().replace(/\s/g, "");
    return await this.cmsModel.findOne({ templateId: templateId, groupId: createCmsInput.groupId, status: constants.ACTIVE }).exec();  
  }
    async findTemplateNameByupdate(updateCmsInput:any)
  {
    const templateId= updateCmsInput.templateId.toLowerCase().replace(/\s/g, "");
    return await this.cmsModel.findOne({ _id:{ '$ne': updateCmsInput._id } ,templateId: templateId, groupId: updateCmsInput.groupId, status: constants.ACTIVE }).exec();  
  }

  async createFields(createCmsInput: any) {
    // const data = await this.findOne(createCmsInput._id) 
    // if (data.cmsType.toLowerCase() === 'dynamic') {
    //   createCmsInput.fields._id = constants.randomString();
    //   const resp = await this.cmsModel
    //   .findOneAndUpdate(
    //     { _id: createCmsInput._id, 'content._id': new mongoose.Types.ObjectId(createCmsInput.contentId) },
    //     { $addToSet: { 'content.$.fields': createCmsInput?.fields } },
    //     { new: true },
    //   )
    //   .exec()
    // } else {
      createCmsInput.fields._id = constants.randomString();
      const resp = await this.cmsModel
      .findOneAndUpdate(
        { _id: createCmsInput._id },
        { $addToSet: { fields: createCmsInput?.fields } },
        { new: true },
      )
      .exec()
    // }
    return createCmsInput;
  }

  async createContent(createCmsContent: any, id: any) {
    let resp;
    const data = await this.findOne(id);
    if (data.content.length > 0) {
      resp = await this.cmsModel
      .updateOne(
        { _id: id },
        { $push: { content: createCmsContent } },
      ).populate([{'path': 'membersData'}])
      .exec()
    } else {
      resp = await this.cmsModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { content: createCmsContent } },
        { new: true },
      ).populate([{'path': 'membersData'}])
      .exec()
    }
    if (resp) {
      const result = await this.findOne(id)
      return result;
    }
  }

  async updateCMSField(createCmsInput: CreateFieldDataInp,posted:any) {

    const data = await this.findOne(createCmsInput._id) 
    if (data.cmsType.toLowerCase() === 'dynamic') {
      // await this.cmsModel
      // .findOneAndUpdate(
      //   { _id: createCmsInput._id,'content._id': new mongoose.Types.ObjectId(createCmsInput.contentId), 'content.fields._id': createCmsInput.fields._id },
      //   {
      //     $set: {
      //       'modified': posted,
      //       'fields.$.fieldName': createCmsInput.fields.fieldName,
      //       'fields.$.type': createCmsInput.fields.type,
      //       'fields.$.value': createCmsInput.fields.value,
      //     },
      //   },
      //   { new: true },
      // )
      // .exec()
      // const contentIndex = data.content.findIndex(s => s._id.toString() === createCmsInput.contentId.toString());
      // const fieldIndex = data.content[contentIndex].fields.findIndex(co => co._id.toString() === createCmsInput.fields._id);
      // const fieldData = data.content[contentIndex].fields[fieldIndex];
      // const doesExist = data.content[contentIndex].fields.some(it => it._id === createCmsInput.fields._id);
      // if (doesExist) {
        // data.content[contentIndex].fields[fieldIndex] = {_id: createCmsInput.fields._id, fieldName: createCmsInput.fields.fieldName, type: createCmsInput.fields.type,value: createCmsInput.fields.value}
        await this.cmsModel
      .findOneAndUpdate(
        { _id: createCmsInput._id, 'content._id': createCmsInput.contentId},
        {
          $set: {
            'modified': posted,
            'content.$.fields': createCmsInput.fields
          },
        },
        { new: true },
      )
      // }
    } else {
      await this.cmsModel
      .findOneAndUpdate(
        { _id: createCmsInput._id},
        {
          $set: {
            'modified': posted,
            fields: createCmsInput.fields
          },
        },
        { new: true },
      )
      .exec()
    }

    return createCmsInput;
  }

  async updateCMSConent(postData: any, posted:any, cmsId: any, contentId: any) {
    const data = await this.findOne(cmsId) 
    let res;
    if (data) {
      res = await this.cmsModel
      .findOneAndUpdate(
        { _id: cmsId, 'content._id': new mongoose.Types.ObjectId(contentId) },
        {
          $set: {
            'content.$.fields': postData.fields,
            'content.$.status': postData.status
          },
        },
        { new: true },
      ).populate([{'path': 'membersData'}])
      .exec()
    }    
    return res;
  }
    async fieldsContentFindOne(createCmsInput: any) {
      const fieldsContent = await this.cmsModel.aggregate([
        { $unwind: '$fields' },
        { $match: { 'fields._id': createCmsInput.fields._id } },
        { $unwind: '$fields' },
      ]);
      if (!fieldsContent[0]?.fields) {
        throw new NotFoundException(
          `conent ${createCmsInput._id} not found`,
        );
      }
      const resp = {
        _id:createCmsInput._id,
        fields:fieldsContent[0]?.fields,
      }
      return resp;
    }
    async removeFieldsContent(createCmsInput: any) {
      await this.cmsModel.updateOne(
        { _id: createCmsInput._id },
        { $pull: { fields: { _id: createCmsInput.fields._id } } },
        { new: true },
      );
      const existingTable = await this.cmsModel
        .findOne({ _id: createCmsInput._id })
        .exec();
      return existingTable;
    }
    
  async findAllCmsFieldCursor(id: string,filter: string,search: string, paginationQuery: ListPageInput) {
    let cms = [];
    let count = 0;
    const { limit, offset } = paginationQuery;
    
    let  cmss: any = await this.cmsModel.findOne({_id : id }).exec();
    if (cmss?.cmsType === 'dynamic') {
      count = cmss?.fields?.length || 0;
    } else {
      count = cmss?.fields?.length || 0;      
    }
    if (count > 0) {
      if (cmss?.cmsType === 'dynamic') {
        cms = cmss?.fields?.splice(offset, limit);
      } else {
        cms = cmss?.fields?.splice(offset, limit);
      }
      if(cms && (filter || search)) {
        cms = cms.map((data) => {
          if ((filter && search)) {
            if(data.fieldName.toLowerCase().includes(search.toLowerCase()) && data.type.toLowerCase() === filter.toLowerCase()){
            return data;
            }   
          }
          else if(search) {
            if(data.fieldName.toLowerCase().includes(search.toLowerCase())){
            return data;
            }   
          }
          else if (filter) {
            if(data.type.toLowerCase() === filter.toLowerCase()){
            return data;
            }   
          }     
        });
        cms = cms.filter( Boolean );
        count = cms?.length || 0;
      }
    }
    return { cms, count }; 
  }

  findAll(paginationQuery: ListCmsInput) {
    const { limit, offset } = paginationQuery;
    return this.cmsModel.find().populate([{'path': 'membersData'}]).skip(offset).limit(limit).exec();
  }
  findAllTemplate() {
    return this.cmsModel.find({status: { $eq: constants.ACTIVE }}).exec();
  }

  async findOne(id: string) {
    const cms = await this.cmsModel.findOne({ _id: id }).populate([{'path': 'membersData'}]).exec();
    if (!cms) {
      throw new NotFoundException(`CMS ${id} not found`);
    }
    return cms;
  }
  async findTemplate(id: string) {
    const cms = await this.cmsModel.findOne({ _id : id, status: { $eq: constants.ACTIVE } }).exec();
    if (!cms) {
      throw new NotFoundException(`CMS ${id} not found`);
    }
    return cms;
  }
  async findTemplateByGroup(groupId:string,templateId: string) {
    const cms = await this.cmsModel.findOne({ templateId:templateId, groupName:groupId, status: constants.ACTIVE }).exec();
    if (!cms) {
      throw new NotFoundException(`CMS ${templateId} not found`);
    }
    return cms;
  }
  

  async getCms(where: any, paginationQuery: ListCmsInput) {
    const count = await this.cmsModel.count(where);
    const center = await this.cmsModel
      .find(where)
      .populate([{'path': 'membersData'}])
      .skip(paginationQuery.offset)
      .limit(paginationQuery.limit)
      .sort({ createdAt: 'desc' })
      .exec();
    return { center, count };
  }

  async getCmsContents(where: any, paginationQuery: ListCmsInput) {
    const counts = await this.cmsModel.find(where);
    const contents = await this.cmsModel
      .find(where)
      .skip(paginationQuery.offset)
      .limit(paginationQuery.limit)
      .sort({ createdAt: 'desc' })
      .exec();
      console.log(contents);
      
    const content = contents[0].content.filter((e) => {return e.status !== constants.DELETED});
    const count =content.length;
    return { content, count };
  }

  async update(id: string, updateCmsInput: any) {
    const existingCMS = await this.cmsModel
      .findOneAndUpdate({ _id: id }, { $set: updateCmsInput }, { new: true })
      .exec();

    if (!existingCMS) {
      throw new NotFoundException(`CMS ${id} not found`);
    }
    return existingCMS;
  }

  remove(id: string) {
    return this.cmsModel
      .findByIdAndUpdate(
        id,
        {
          status: constants.DELETED,
        },
        { new: true },
      )
      .exec();
  }

  changeCMSStatus(id: string, status: number) {
    return this.cmsModel
      .findByIdAndUpdate(
        id,
        {
          status: status,
        },
        { new: true },
      )
      .exec();
  }

  async findCMS() {
    return this.cmsModel.find({ status: { $eq: constants.ACTIVE } }).exec();
  }

  async findWhere(data: any) {
    return this.cmsModel.find(data).exec();
  }

  async deleteFieldInContent(cmsId, contId, fieldId) {
    const res = await this.cmsModel.updateOne({_id: cmsId, 'content._id': new mongoose.Types.ObjectId(contId)},{$pull: {'content.$.fields': {_id: fieldId}}});
    const result  = await this.cmsModel.find({_id: cmsId})
    return result;
  }

  async createLayoutField(data: any) {
    const cms = await this.cmsModel.findOne({_id: data._id});
    if (cms.cmsType === constants.OTHER) {
      data.fields._id = constants.randomString();
      const resp = await this.cmsModel.findOneAndUpdate(
        { _id: data._id},
        {
          $addToSet: {
            fields: data.fields
          },
        },
        { new: true },
      )
      .exec()
    } else {
      const idVal = constants.randomString();
      if (cms.content.length > 0) {
        // add the new field to all the fields array in every objects of content array
        const arr = cms.content;
        for (let i = 0; i < arr.length; i++) {
          const fields = arr[i].fields;
          const obj = {
            fieldName: data.fields.fieldName,
            type: data.fields.type,
            value: "",
            _id: idVal
          }
          fields.push(obj)
        }
        // update the fields array ( layout )
        const resp = await this.cmsModel.findOneAndUpdate(
          { _id: data._id},
          {
            $set: {
              content: arr
            },
          },
          { new: true },
        )
        .exec()
      }
      data.fields._id = idVal;
      const resp2 = await this.cmsModel.findOneAndUpdate(
        { _id: data._id},
        {
          $addToSet: {
            fields: data.fields
          },
        },
        { new: true },
      )
      .exec()
    }
    return data;
  }

  async updateLayoutField(data: any, posted: any) {
    const cms = await this.cmsModel.findOne({_id: data._id});
    if (cms.cmsType === constants.OTHER) {
      const resp = await this.cmsModel.findOneAndUpdate(
        { _id: data._id, 'fields._id': data.fields._id},
        {
          $set: {
            'fields.$.fieldName': data.fields.fieldName,
            'fields.$.type': data.fields.type,
          },
        },
        { new: true },
      )
      .exec()
    } else {
      if (cms.content.length > 0) {
        const arr = cms.content;
        for (let i = 0; i < arr.length; i++) {
          const fields = arr[i].fields;
          for (let j = 0; j < fields.length; j++) {
              fields[j].fieldName = (fields[j]._id === data.fields._id) ? data.fields.fieldName : fields[j].fieldName;
              // fields[j].value = fields[j].value;
              fields[j].type = (fields[j]._id === data.fields._id) ? data.fields.type : fields[j].type;
          }
        }
        const resp = await this.cmsModel.findOneAndUpdate(
          { _id: data._id},
          {
            $set: {
              content: arr,
            },
          },
          { new: true },
        )
        .exec()
      }
      const resp2 = await this.cmsModel.findOneAndUpdate(
        { _id: data._id, 'fields._id': data.fields._id},
        {
          $set: {
            'fields.$.fieldName': data.fields.fieldName,
            'fields.$.type': data.fields.type,
          },
        },
        { new: true },
      )
      .exec()
    }
    return data;
  }

  async removeLayoutField(data: any) {
    const cms = await this.cmsModel.findOne({_id: data._id});
    if (cms.cmsType === constants.OTHER) {
      await this.cmsModel.updateOne(
        { _id: data._id },
        { $pull: { fields: { _id: data.fields._id } } },
        { new: true },
      );
    } else {
      if (cms.content.length > 0) {
        const arr = cms.content;
        const updatedArr = arr.map(item => ({
          ...item,
          fields: item.fields.filter(field => field._id !== data.fields._id)
        }));
        const resp = await this.cmsModel.findOneAndUpdate(
          { _id: data._id},
          {
            $set: {
              content: updatedArr,
            },
          },
          { new: true },
        )
        .exec()
      }
      await this.cmsModel.updateOne(
        { _id: data._id },
        { $pull: { fields: { _id: data.fields._id } } },
        { new: true },
      );
    }
    const existingTable = await this.cmsModel
      .findOne({ _id: data._id })
      .exec();
    return existingTable;
  }
}
