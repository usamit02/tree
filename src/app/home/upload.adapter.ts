import { MysqlService } from '../service/mysql.service';
export class MyUploadAdapter {
  constructor(private loader, private mysql: MysqlService) {
  }
  upload() {
    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('upload', this.loader.file);
      this.mysql.upload("upload.php", data).subscribe((res: any) => {
        if (!res || res.error) {
          return reject(res && res.error ? res.error.message : "アップロードに失敗しました。");
        }
        resolve({
          default: res.url
        });
      });
    });
  }
  abort() {
    console.log("abort!");
  }
}