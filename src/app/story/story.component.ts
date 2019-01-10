import { Component, OnInit, Input } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss']
})
export class StoryComponent {
  storys = [];
  @Input() user;
  @Input() room;
  constructor(private mysql: MysqlService) { }

  ngOnChanges() {
    this.mysql.query("story.php", { uid: this.user.uid, rid: this.room.id }).subscribe((res: any) => {
      this.storys = res.main;
      setTimeout(() => {
      });
    });
  }
}
