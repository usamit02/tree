import { Component, OnInit, Input } from '@angular/core';
import { Room } from '../class';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MysqlService } from '../service/mysql.service';
import { EventEmitter } from 'protractor';
//import { TreeComponent } from "../tree/tree.component";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private _room: Room;
  user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  pay: boolean = false;
  plan = { amount: 3000, billing_day: null, trial_days: null };
  @Input()
  set room(_room: Room) {
    this.undo(_room);
  }
  get room() {
    return this._room;
  }
  discription = new FormControl(
    Validators.maxLength(500)
  );
  chat = new FormControl();
  contents = new FormControl();
  paid = new FormControl();
  amount = new FormControl(
    Validators.min(50),
    Validators.max(10000)
  );
  billing_day = new FormControl(
    Validators.min(0),
    Validators.max(31)
  );
  trial_days = new FormControl(
    Validators.min(0),
    Validators.max(365)
  );
  prorate = new FormControl();
  roomForm = this.builder.group({
    discription: this.discription,
    chat: this.chat,
    contents: this.contents,
    paid: this.paid,
    amount: this.amount,
    billing_day: this.billing_day,
    trial_days: this.trial_days,
    prorate: this.prorate
  });
  constructor(private builder: FormBuilder, private mysql: MysqlService) { }

  ngOnInit() {

  }
  changeContents() {
    if (!this.contents.value) this.paid.reset(false);
  }
  save() {
    console.log(this.roomForm.value);
    let params: any = { room: {}, plan: {} };
    const planProp = ['amount', 'billing_day', 'trial_days'];
    for (const p of Object.keys(this.roomForm.value)) {
      if (!planProp.filter(prop => { return p === prop; }).length && this.roomForm.value[p] !== this.room[p]) {
        params.room[p] = this.roomForm.value[p];
      }
    }
    if (this.roomForm.value.paid && planProp.filter(p => { return this.roomForm.value[p] !== this.room[p]; }).length) {
      for (let i = 0; i < planProp.length; i++) {
        params.plan[planProp[i]] = this.roomForm.value[planProp[i]];
      }
    }
    this.mysql.save("/owner/save.php", { roomForm: JSON.stringify(params), roomId: this.room.id }).subscribe((data: any) => {
      if (data.msg === "ok") {
        for (const p of Object.keys(this.roomForm.value)) {
          this._room[p] = this.roomForm.value[p];
        }
        //this.tree.getNode();
      } else {
        alert("データベースエラー C-Lifeまでお問合せください。");
      }
    });
  }
  undo(_room) {
    this.roomForm.reset();
    this.discription.reset(_room.discription);
    this.chat.reset(_room.chat);
    this.contents.reset(_room.contents);
    this.pay = _room.plan ? true : false;
    this.paid.reset(this.pay);
    let amount = _room.amount > 49 ? _room.amount : 3000;
    this.amount.reset(amount);
    this.billing_day.reset(_room.billing_day);
    this.trial_days.reset(_room.trial_days);
    //let prorate = _room.prorate ? true : false;
    this.prorate.reset(_room.prorate);
    this._room = _room;
  }
}
