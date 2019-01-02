import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room } from '../class';
import { TreeComponent } from "../tree/tree.component";
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { MysqlService } from '../service/mysql.service';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  @ViewChild(TreeComponent) protected tree: TreeComponent;
  //user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  //user = { uid: "b5FnwHPFmsVwym8vze34PUfeF003" };
  user = { uid: "", displayName: "", photoURL: "" };
  room: Room;
  save;
  exec;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private afAuth: AngularFireAuth, private mysql: MysqlService) {
    this.room = new Room(0, 0, "ログインしてください");
  }
  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user.uid) {
        this.user = user;
        this.room = new Room(0, 0, "お知らせ", 0, "", 0);
        this.mysql.query("user.php", { uid: this.user.uid, na: this.user.displayName, avatar: this.user.photoURL }).subscribe((res: any) => {
          if (res.msg !== "ok") {
            alert(res.msg);
          }
        });
      } else {
        this.user = { uid: "", displayName: "", photoURL: "" };
        this.room = new Room(0, 0, "ログインしてください");
      }
    });
    console.log(this.user);
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
    this.user = { uid: "", displayName: "", photoURL: "" };
    this.room = new Room(0, 0, "ログインしてください");
  }
}