import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { UserInputError } from 'apollo-server-express';
import { uuid_required, already_exist } from '../assets/lang/en.json';
import { ListMediaInput } from './dto/list-media.input';
import { GraphQLUpload } from 'apollo-server-express';
import { Upload } from 'graphql-upload/Upload.js';
import AdmZip from 'adm-zip';
import { FirebaseService } from 'src/utils/firebase.service';
import * as fs from 'fs';
import { ListMediaResponse } from './dto/list-media.response';
import ConnectionArgs, {
  getPagingParameters,
} from 'src/common/relay/connection.args';
import constants from 'src/utils/constants';
import { connectionFromArraySlice } from 'graphql-relay';
import { NotFoundException, SetMetadata, UseGuards, CACHE_MANAGER, Inject  } from '@nestjs/common';
import { PermissionsGuard } from 'src/authorization/permission.guard';
import { Cache } from 'cache-manager';


@Resolver(() => Media)
export class MediaResolver {
  PROFILEFOLDER: string = 'CMS_MediaLibrary';
  constructor(private readonly mediaService: MediaService, private readonly firebaseService: FirebaseService) {}

  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['create:media'])
  @Mutation(() => Media)
  createMedia( @Context() context,
  @Args('createMediaInput') createMediaInput: CreateMediaInput) {
    const uuid = context.req.headers.uuid;
    if (!uuid) {
      throw new UserInputError(uuid_required);
    }
    createMediaInput.createdBy = uuid;
    return this.mediaService.create(createMediaInput);
  }
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:media'])
  @Query(() => ListMediaResponse, { name: 'listMediasWithCursor' })
  async findAllWithCursor(
    @Context() context,
    @Args('args') args: ConnectionArgs,
  ): Promise<ListMediaResponse> {
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
    const { media, count } = await this.mediaService.findAll(
      {
        limit,
        offset,
      },
    );
    const page = connectionFromArraySlice(media, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });

    return { page, pageData: { count, limit, offset } };
  }
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['read:media'])
  @Query(() => Media, { name: 'media' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.mediaService.findOne(id);
  }
  
  @UseGuards(PermissionsGuard)
  @SetMetadata('permissions', ['delete:media'])
  @Mutation(() => Boolean)
  removeMedia(@Args('id', { type: () => String }) id: string) {
    return this.mediaService.remove(id);
  }

  async processCmsUploadImg(stream: any) {
    // // const buffer = await this.mediaService.stream2buffer(stream);

    // if (stream) {
    //   const zip = new AdmZip(stream);
    //   var zipEntries = zip.getEntries();
    //   let successCount: number = 0;
    //   let errorCount: number = 0;
    //   // if (userType.toLowerCase() === constants.STUDENT.toLowerCase()) {
    //     zipEntries.forEach(async (zipEntry) => {
    //       const zipName: string = zipEntry.entryName;
    //       console.log('zipname',zipName);
          
    //       let filename;
    //       const n = zipName.split('/');
    //       const name: string = n[1];
    //       const mediaDetails = await this.mediaService.findOneWhere(name);
    //       if (mediaDetails) {
    //         try {  
    //           const bufffer = await zipEntry.getData();
    //           console.log('bufffer', bufffer);
              
    //           const storeFsData: any = await this.mediaService.storeFS(
    //             bufffer,
    //             name,
    //           );
    //             console.log('storeFsData', storeFsData);
                
    //           const filename2 = `${name}`;
    //           const newfilename = `${filename2}`;
    //           const firebaseResp = await this.firebaseService.fcDirectUpload(
    //             storeFsData,
    //             newfilename,
    //             this.PROFILEFOLDER,
    //           );
    //           console.log(firebaseResp);
              
    //           const d = await this.mediaService.update(name, {
    //             file: firebaseResp.filename,
    //           });
    //           console.log(d);
              
    //           successCount++;
    //         } catch (er) {
    //           console.log('er: ', er);

    //           errorCount++;
    //         }
    //       } else {
    //         console.log(`${name} not available`);
    //         const bufffer = await zipEntry.getData();
    //           const storeFsData: any = await this.mediaService.storeFS(
    //             bufffer,
    //             zipName,
    //           );

    //           const filename2 = `${zipName}`;
    //           const newfilename = `${filename2}`;
    //           const firebaseResp = await this.firebaseService.fcDirectUpload(
    //             storeFsData,
    //             newfilename,
    //             this.PROFILEFOLDER,
    //           );
    //           console.log(firebaseResp);
    //       }
    //     })
    //   // } else {
    //   //   // ToDO
    //   // }
    //   // if (fs.existsSync(this.PROFILEFOLDER)) {
    //   //   fs.rmdirSync(this.PROFILEFOLDER);
    //   // }
    const folderPath = 'zip';

// Read all files from the folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }
  let successCount: number = 0;
  let errorCount: number = 0;
  // Iterate through each file and upload it to Firebase Storage
  files.forEach(async (file) => {
    const filePath = `${folderPath}/${file}`;
    const destination = `${this.PROFILEFOLDER}/${file}`; // Change the destination path as per your requirement

    // Upload the file to Firebase Storage
    const firebaseResp = await this.firebaseService.fcDirectUpload(
      filePath,
      file,
      this.PROFILEFOLDER,
    );
    console.log(firebaseResp);
    let type = firebaseResp.mediaType;
    const d = await this.mediaService.update(file, type, {
      file: firebaseResp.filename,
    });
    if (d) {
      successCount++
    } else {
      errorCount++
    }
    console.log(
      `Total Count: ${files.length} successCount: ${successCount} errorCount: ${errorCount}`,
    );
  });
});
  }

  @Mutation(() => Boolean)
  async cmsLibraryUpload(
    // @Args('file', { type: () => GraphQLUpload }) filedata: Upload,
  ) {
    // const { file } = filedata;
    // const fileExt = file.mimetype.split('/')[1];
    // if (fileExt !== 'x-zip-compressed' && fileExt !== 'octet-stream') {
    //   throw new UserInputError('Invalid file type provide zip file');
    // }
    // const { createReadStream } = file;
    // const stream = createReadStream();
    const zipFilePath = 'zip';
    this.processCmsUploadImg(zipFilePath);
    return true;
  }


}
