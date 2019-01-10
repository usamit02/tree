import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TreeComponent } from "../tree/tree.component";
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { MysqlService } from '../service/mysql.service';
import { Room } from '../class';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  @ViewChild(TreeComponent) protected tree: TreeComponent;
  //user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  //user = { uid: "b5FnwHPFmsVwym8vze34PUfeF003" };
  user = { id: "", na: "", avatar: "", p: 0 };
  room = new Room(-1, 0, "ログインしてください");
  rooms;
  save;
  exec;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private afAuth: AngularFireAuth, private mysql: MysqlService) {
  }
  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user.uid) {
        this.room = new Room(0, 0, "お知らせ    ", 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.mysql.query("user.php", { uid: user.uid, na: user.displayName, avatar: user.photoURL }).subscribe((res: any) => {
          if (res.msg !== "ok") {
            alert(res.msg);
          }
          this.user = { id: res.id, na: res.na, avatar: res.avatar, p: res.p };
          let dummy = document.getElementById("dummy");
          dummy.click();
        });
      } else {
        this.user = { id: "", na: "", avatar: "", p: 0 };
        this.room = new Room(-1, 0, "ログインしてください");
      }
    });
    console.log(this.user);
  }
  onGetRooms(rooms) {
    this.rooms = JSON.parse(rooms);
  }
  onSelected(room) {
    this.room = room;
    this.save = "";
  }
  saveCTL(com) {
    if (com === "roomdone") {
      this.tree.getNode();
      this.save = "";
      this.exec = "";
    } else if (com === "done") {
      this.save = ""; this.exec = "";
    } else {
      this.save = com;
    }
  }
  undo() {
    if (this.save === "saveroom") {
      this.exec = "undoroom";
    } else if (this.save === "savestory") {
      this.exec = "undostory";
    }
  }
  login(sns) {
    if (sns === "twitter") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    } else if (sns === "facebook") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
    } else if (sns === "google") {
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  }
  logout() {
    this.afAuth.auth.signOut();
    this.user = { id: "", na: "", avatar: "", p: 0 };
    this.room = new Room(0, 0, "ログインしてください");
  }
}