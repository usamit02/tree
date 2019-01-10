import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { MysqlService } from '../service/mysql.service';
@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.scss']
})
export class CashComponent implements OnInit {
  user = { id: "", na: "", avatar: "", p: 0 };
  room = { id: -1, na: "ログインしてください" };
  constructor(private afAuth: AngularFireAuth, private mysql: MysqlService) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user.uid) {
        //this.room = new Room(0, 0, "お知らせ    ", 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);        
        this.mysql.query("user.php", { uid: user.uid, na: user.displayName, avatar: user.photoURL }).subscribe((res: any) => {
          if (res.msg !== "ok") {
            alert(res.msg);
          }
          this.user = { id: res.id, na: res.na, avatar: res.avatar, p: res.p };
          this.user.id = res.id;
          this.room = { id: 0, na: "お知らせ" };
          let dummy = document.getElementById("dummy");
          dummy.click();
        });
      } else {
        this.user = { id: "", na: "", avatar: "", p: 0 };
        this.room = { id: -1, na: "ログインしてください" }//new Room(-1, 0, "ログインしてください");
      }
    });
    console.log(this.user);
  }

  login(sns) {
    if (sns === "twitter") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    } else if (sns === "facebook") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    } else if (sns === "google") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } else {

    }
  }
  logout() {
    this.afAuth.auth.signOut();
    this.user = { id: "", na: "", avatar: "", p: 0 };
    this.room = { id: -1, na: "ログインしてください" }//new Room(0, 0, "ログインしてください");
  }

}
