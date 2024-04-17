import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { Media } from './entities/media.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListMediaInput } from './dto/list-media.input';
import { Stream } from 'stream';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
  ) {}
  create(createMediaInput: CreateMediaInput) {
    const data = new this.mediaModel(createMediaInput);
    return data.save();
  }

  async findAll(paginationQuery: ListMediaInput) {
    const count = await this.mediaModel.count();
    const media = await this.mediaModel
      .aggregate([
        {
          $lookup: {
            from: 'users', // collection name in db
            localField: 'createdBy',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: `$userDetails`,
        },
        {
          $sort: { _id: -1 },
        },
      ])
      .skip(paginationQuery.offset)
      .limit(paginationQuery.limit)
      .exec();
    return { media, count };
  }

  async findOne(id: string) {
    const cmsgroup = await this.mediaModel.findOne({ _id: id }).exec();
    if (!cmsgroup) {
      throw new NotFoundException(`media ${id} not found`);
    }
    return cmsgroup;
  }

  async findOneWhere(data: any) {
    const cmsgroup = await this.mediaModel.findOne({ name: data }).exec();
    if (!cmsgroup) {
      throw new NotFoundException(`media not found`);
    }
    return cmsgroup;
  }

  async remove(id: string) {
    const mediaFile = await this.mediaModel.findOne({ _id: id });
    if (mediaFile) {
      mediaFile.remove();
      return true;
    }
    return false;
  }

  async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf = Array<any>();

      stream.on('data', (chunk) => _buf.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(_buf)));
      stream.on('error', (err) => reject(`error converting stream - ${err}`));
    });
  }

  storeFS(buffer, filename) {
    const dir = 'zip';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const path = `${dir}/${filename}`;
    return new Promise((resolve, reject) => {
      fs.createWriteStream(path).write(buffer);
      resolve(path);
    });
  }

  async update(name: any, type: any, data: any) {
    const regexPattern = new RegExp('^\\s*' + name.substring(0, 10), 'i');
    const query = {
      name: { $regex: regexPattern },
    };
    let cmsgroup;
    const cmsgroupcheck = await this.mediaModel.findOne(query);
    if (cmsgroupcheck) {
      cmsgroup = await this.mediaModel
        .findOneAndUpdate(query, { $set: data }, { new: true })
        .exec();
    } else {
      let d = {
        name: name,
        type: type,
        file: data.file,
        createdBy: 'Y06PmGMxgmTzNn1NR4zN7VYixjY2',
      };
      const cmsgroup = new this.mediaModel(d);
      return cmsgroup.save();
    }
    if (!cmsgroup) {
      throw new NotFoundException(`media not found`);
    }
    return cmsgroup;
  }
}
