import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room } from '../class';
import { HomeComponent } from '../home/home.component';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
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
  onEdited() {
    console.log("edit");
  }
}