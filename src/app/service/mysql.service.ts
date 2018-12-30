import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MysqlService {
  //url: string = "http://localhost/public_html/";
  url: string = "https://bloggersguild.cf/";
  constructor(private http: HttpClient) {
  }
  query(url: string, params: any): Observable<Object> {
    return this.http.get(this.url + url, { params: params });
  }
  api(url: string, params: any): Observable<Object> {
    return this.http.get(url, { params: params });
  }
  upload(url: string, formData: any): Observable<Object> {
    let fd = new FormData;
    for (const key of Object.keys(formData)) {
      fd.append(key, formData[key]);
    }
    return this.http.post(this.url + url, fd);
  }
  room(uid: string): Observable<Object> {
    return this.http.get(this.url + "room.php", { params: { uid: uid } });
  }

}