import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UPURL } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MysqlService {
  constructor(private http: HttpClient) {
  }
  query(url: string, params: any): Observable<Object> {
    return this.http.get(UPURL + url, { params: params });
  }
  post(url: string, params: any): Observable<Object> {
    let body = new HttpParams;
    for (const key of Object.keys(params)) {
      body = body.append(key, params[key]);
    }
    return this.http.post(UPURL + url, body, {
      headers: new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" })
    });
  }
  api(url: string, params: any): Observable<Object> {
    return this.http.get(url, { params: params });
  }
  upload(url: string, formData: any): Observable<Object> {
    let fd = new FormData;
    for (const key of Object.keys(formData)) {
      fd.append(key, formData[key]);
    }
    let params = new HttpParams();
    const req = new HttpRequest('POST', UPURL + url, fd, { params: params, reportProgress: true });
    return this.http.request(req);
    //return this.http.post(this.url + url, fd, { reportProgress: true,observe:'events' });
  }
  room(uid: string): Observable<Object> {
    return this.http.get(UPURL + "room.php", { params: { uid: uid } });
  }

}