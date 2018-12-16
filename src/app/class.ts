export class Room {
  constructor(public id?: number,
    public parent?: number,
    public na?: string,
    public idx?: number,
    public discription?: string,
    public price?: number,
    public folder?: number,
    public chat?: number,
    public contents?: number,
    public plan?: number,
    public prorate?: number,
    public auth?: number,
    public amount?: number,
    public billing_day?: number,
    public trial_days?: number,
    public auth_days?: number
  ) {
  }
}
export class MyUploadAdapter {
  xhr: XMLHttpRequest;
  constructor(private loader) {
  }
  upload() {
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest();
    });
  }
  abort() {
    if (this.xhr) this.xhr.abort();
  }
  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    xhr.open('POST', "http://localhost/public_html/upload.php", true);
    xhr.responseType = 'json';
  }
  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = 'Couldn\'t upload file:' + ` ${loader.file.name}.`;
    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;
      if (!response || response.error) {
        return reject(response && response.error ? response.error.message : genericErrorText);
      }
      resolve({
        default: response.url
      });
    });
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }
  _sendRequest() {
    const data = new FormData();
    data.append('upload', this.loader.file);
    this.xhr.send(data);
  }
}
