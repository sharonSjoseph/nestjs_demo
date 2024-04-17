import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import serviceAccountConfig from '../assets/firebase/serviceAccount';
import { v4 } from 'uuid';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
// import { HttpService } from '@nestjs/axios';

// const app = initializeApp({ ...serviceAccountConfig } as any);

@Injectable()
export class FirebaseService {
  bucket: any;
  serviceAccount: any;
  databaseURL: any;
  storageBucket: any;
  projectName: any;
  FOLDERNAME: string = 'xat';
  app: any;
  storage: any
  constructor(private readonly configService: ConfigService) {
    const nodeEnv: string = process.env.NODE_ENV;
    let serviceAccount: any = {
      type: process.env.type_firebase,
      auth_uri: process.env.auth_uri_firebase,
      token_uri: process.env.token_uri_firebase,
      auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    };
    if (nodeEnv === 'development') {
      serviceAccount.project_id = process.env.project_id_DEV;
      serviceAccount.private_key_id = process.env.private_key_id_DEV;
      serviceAccount.private_key = process.env.private_key_DEV.replace(
        /\\n/g,
        '\n',
      );
      serviceAccount.client_email = process.env.client_email_DEV;
      serviceAccount.client_id = process.env.client_id_DEV;
      serviceAccount.client_x509_cert_url =
        process.env.client_x509_cert_url_DEV;
      this.databaseURL = process.env.databaseURL_DEV;
      this.storageBucket = process.env.storageBucket_DEV;
      this.projectName = process.env.projectName_DEV;
    }
    if (nodeEnv === 'production') {
      serviceAccount.project_id = process.env.project_id;
      serviceAccount.private_key_id = process.env.private_key_id;
      serviceAccount.private_key = process.env.private_key.replace(
        /\\n/g,
        '\n',
      );
      serviceAccount.client_email = process.env.client_email;
      serviceAccount.client_id = process.env.client_id;
      serviceAccount.client_x509_cert_url = process.env.client_x509_cert_url;
      this.databaseURL = process.env.databaseURL;
      this.storageBucket = process.env.storageBucket;
      this.projectName = process.env.projectName;
    }

    this.serviceAccount = { ...serviceAccount };
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(this.serviceAccount),
        databaseURL: this.databaseURL,
        storageBucket: this.storageBucket,
      });
    }
    this.bucket = admin.storage().bucket();
    this.app = initializeApp(this.serviceAccount);
    this.storage = getStorage(this.app, this.storageBucket);
  }

  getUserByEmail(email: string) {
    return admin.auth().getUserByEmail(email);
  }
  createUser(data: any = {}) {
    return admin.auth().createUser({
      email: data.email,
      emailVerified: false,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
      disabled: false,
    });
  }

  async fcDirectUpload(
    Fpath: any,
    filename2: any,
    folderName: string,
    contentType: string = 'image/png',
  ) {
    let filename;
    let mediaType;
    this.FOLDERNAME = folderName;
    const filePath = {
      path: Fpath,
    };
    await this.uploadFile(filePath, filename2, contentType).then(
      async (resp) => {
        const obj = resp[1];
        filename = `https://firebasestorage.googleapis.com/v0/b/${this.projectName}/o/${resp[0].id}?alt=media&token=${obj.metadata.firebaseStorageDownloadTokens}`;
        mediaType = obj.contentType;

        try {
          fs.unlinkSync(Fpath);
        } catch (er) {
          console.log(er);
        }
      },
    );
    return {
      filename,
      mediaType,
    };
  }

  async fbUpload(Fpath: any, filename2: any, folderName: string) {
    let filename;
    let mediaType;
    this.FOLDERNAME = folderName;
    const filePath = {
      path: Fpath,
    };
    await this.uploadData(filePath, filename2).then(async (resp) => {
      const obj = resp[1];
      filename = `https://firebasestorage.googleapis.com/v0/b/${this.projectName}/o/${resp[0].id}?alt=media&token=${obj.metadata.firebaseStorageDownloadTokens}`;
      mediaType = obj.contentType;

      try {
        fs.unlinkSync(Fpath);
      } catch (er) {
        console.log(er);
      }
    });
    return {
      filename,
      mediaType,
    };
  }

  async fcDirectUpload2(Fpath: any, filename2: any, folderName: string) {
    let filename;
    let mediaType;
    this.FOLDERNAME = folderName;
    const filePath = {
      path: Fpath,
    };
    await this.uploadFile2(filePath, filename2).then(async (resp) => {
      const obj = resp[1];

      filename = `https://firebasestorage.googleapis.com/v0/b/${this.projectName}/o/${resp[0].id}?alt=media&token=${obj.metadata.firebaseStorageDownloadTokens}`;
      mediaType = obj.contentType;

      try {
        fs.unlinkSync(Fpath);
      } catch (er) {
        console.log(er);
      }
    });
    return {
      filename,
      mediaType,
    };
  }

  async uploadFile(
    file: any,
    filename2: any,
    contentType: string = 'image/png',
  ) {
    const filename = file.path;

    const token = v4();
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public, max-age=31536000',
      contentType: contentType,
    };
    return await this.bucket.upload(filename, {
      metadata,
      destination: this.FOLDERNAME + '/' + filename2,
    });
  }

  async uploadFile2(file: any, filename2: any) {
    const filename = file.path;

    const token = v4();
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public, max-age=31536000',
      contentType: 'text/csv',
    };
    return await this.bucket.upload(filename, {
      metadata,
      destination: this.FOLDERNAME + '/' + filename2,
    });
  }
  async downloadFile(
    url: string,
    folderName: string,
    destinationFile: string,
    ext: string,
  ) {
    try {
      const fileName = url.split(`${folderName}%2F`)[1].split('?')[0];
      const options = {
        destination: `${destinationFile}.${ext}`,
      };
      await this.bucket.file(`${folderName}/${fileName}`).download(options);
    } catch (er: any) {
      console.log(er);
    }
  }
  async uploadImage(destination: string, image: Buffer) {
    const token = v4();
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public, max-age=31536000',
    };
    const resp = await this.bucket.upload(image, {
      metadata,
      destination: destination,
    });
  }

  async generateName() {
    let result = '';
    const length = 5;
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${result}`;
  }

  async uploadData(file: any, filename2: any) {
    const filename = file.path;
    const token = v4();
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public, max-age=31536000',
      contentType: 'image/png',
    };
    return await this.bucket.upload(filename, {
      metadata,
      destination: this.FOLDERNAME + '/' + filename2,
    });
  }

  async disableAuth(uid: string, status: boolean) {
    admin.auth().updateUser(uid, {
      disabled: status,
    });
  }

  async getFirebaselistAll(folderName: string) {
    const storage = getStorage(this.app);
    const listRef = ref(storage, folderName);
    return listAll(listRef);
  }

  getDownloadUrl(item: any) {
    return getDownloadURL(item);
  }
//   async sendNotification(id: string, msgData: any, httpService: HttpService) {
//     const key: any =
//       process.env.NODE_ENV === 'development'
//         ? process.env.CLOUD_SERVER_KEY_DEV
//         : process.env.CLOUD_SERVER_KEY_LIVE;
//     return new Promise(async (resolve, reject) => {
//       const db = admin.firestore();
//       const collectionDoc = db.collection('users').doc(id);
//       collectionDoc
//         .get()
//         .then((doc) => {
//           if (doc.exists) {
//             console.log('Document data:', doc.data());
//             if (doc.data()) {
//               const data = doc.data();

//               const body = {
//                 to: data.pushToken,
//                 notification: {
//                   title: msgData.title,
//                   body: msgData.body,
//                   icon: msgData.icon,
//                 },
//                 data: {
//                   message: msgData.message,
//                 },
//               };

//               httpService
//                 .post('https://fcm.googleapis.com/fcm/send', body, {
//                   headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${key}`,
//                   },
//                 })
//                 .subscribe(
//                   ({ data }) => {
//                     resolve(data);
//                     console.log(data);
//                   },
//                   (er) => {
//                     reject(er);
//                   },
//                 );
//             }
//           } else {
//             console.log('No such document!');
//           }
//         })
//         .catch((error) => {
//           console.log('Error getting document:', error);
//         });
//     });
//   }

  async readHtmlFileFromFirebase(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const fileBuffer = await file.download();
      return fileBuffer[0].toString();
    } catch (error) {
      throw new Error('Error reading HTML file from Firebase: ' + error.message);
    }
  }

//   async compileHanldeBarFirebase(filePath: any, data: any) {
//     hbs.registerHelper('ifeq', function (a, b, block) {
//       return a == b ? block.fn() : block.inverse();
//     });
//     hbs.registerHelper('mod', function (a, b) {
//       return a % b;
//     });
//     const file = this.bucket.file(filePath);
//     const fileBuffer = await file.download();
//     const html = fileBuffer[0].toString();
//     return hbs.compile(html)(data);
//   }

  async fireUploadBytes(file, filename) {
    return new Promise(async (resolve, reject) => {
      const storageRef = ref(
        this.storage,
        `uploads/${filename}${await this.generateName()}.png`,
      );

      uploadBytes(storageRef, file).then((snapshot) => {
        console.log('snap', snapshot);

        getDownloadURL(storageRef).then((url) => {
          resolve(url);
        });
      });
    });
  }

  async getImageFromFirebase(id: any) {
    return new Promise(async (resolve, reject) => {
      const storageRef = ref(
        this.storage,
        `profile-pic/${id}/main`,
      );
      listAll(storageRef).then((res) => {
        if (!res?.items?.length) return;
        getDownloadURL(res?.items?.[0]).then((url) => {
          resolve(url);
        });
      });
    })
  }

  async deleteFiles(path:string){
    const [files] = await this.bucket.getFiles({ prefix: path });
    if (files.length === 0) {
      console.log('Folder not found or already deleted.');
      return;
    }
    console.log(files);
    
    const deletePromises = files.map((file) => file.delete());
    return Promise.all(deletePromises);
  }
}
