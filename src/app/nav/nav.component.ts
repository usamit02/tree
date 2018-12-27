import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room } from '../class';
import { TreeComponent } from "../tree/tree.component"
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  @ViewChild(TreeComponent) protected tree: TreeComponent;
  user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  //user = { uid: "b5FnwHPFmsVwym8vze34PUfeF003" };
  room: Room = new Room(0, 0, "お知らせ");
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver) {

  }
  ngOnInit() {


  }
  onSelected(room) {
    this.room = room;
  }
  saveRoom() {
    this.tree.getNode();
  }
}