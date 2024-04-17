import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
  } from '@nestjs/common';
 import { CmsService } from './cms.service';
import constants from 'src/utils/constants';

  
  @Controller('template')
  export class CmsController {
    constructor(private readonly cmsService: CmsService) {}
  
    @Get()
    async index() {
    return await this.cmsService.findAllTemplate();
    }
  
    @Get('/:id')
    async find(@Param('id') id: string) {
     return await this.cmsService.findTemplate(id);
    } 
    @Get('/:groupId/:templateId')
    async findGroupTemplate(@Param('groupId') groupId: string,@Param('templateId') templateId: string) {
     const resp = await this.cmsService.findTemplateByGroup(groupId,templateId);
     var obj = {};
     if (resp.cmsType === 'other') {
        const result = resp.fields.map(item => {
          obj[item.fieldName] = item.value;
        });
        return obj;
     } else {
      const result = resp.content.filter(item => {
        if (item.status !== constants.DELETED) {
          return item.fields
        }
      });
      return result;
     }
    } 
  }