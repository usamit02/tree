import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MysqlService {
  url: string = "http://localhost/public_html/";
  //url: string = "https://bloggersguild.cf/";
  constructor(private http: HttpClient) {
  }
  query(url: string, params: any): Observable<Object> {
    return this.http.get(this.url + url, { params: params });
  }
  api(url: string, params: any): Observable<Object> {
    return this.http.get(url, { params: params });
  }
  upload(url: string, data: FormData): Observable<Object> {
    return this.http.post(this.url + url, data);
  }
  room(uid: string): Observable<Object> {
    return this.http.get(this.url + "room.php", { params: { uid: uid } });
  }
  getNode(uid: string): Observable<Object> {
    return this.http.get(this.url + "owner/room.php", { params: { uid: uid } });
  }
  saveNode(uid: string, sql: string): Observable<Object> {
    return this.http.get(this.url + "owner/room.php", { params: { uid: uid, sql: sql } });
  }
  newNode(parent: number): Observable<Object> {
    return this.http.get(this.url + "owner/room.php", { params: { parent: parent.toString() } });
  }

}