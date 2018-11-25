import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MysqlService {
  url: string = "http://localhost/public_html";
  //url: string = "https://bloggersguild.cf";
  constructor(private http: HttpClient) {
  }
  room(uid: string): Observable<Object> {
    return this.http.get(this.url + "/room.php", { params: { uid: uid } });
  }
  getNode(uid: string): Observable<Object> {
    return this.http.get(this.url + "/owner/room.php", { params: { uid: uid } });
  }
  saveNode(uid: string, sql: string): Observable<Object> {
    return this.http.get(this.url + "/owner/room.php", { params: { uid: uid, sql: sql } });
  }
}