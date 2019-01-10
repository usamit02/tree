import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';
@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
  displayedColumns: string[] = ['rqd', 'upd', 'room', 'amount'];
  data;
  pageSize: number = 25;
  pageSizeOptions: number[] = [20, 50, 100];
  pager;
  fee: number = 0;
  @Input() user;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private mysql: MysqlService) { }

  ngOnInit() {

  }
  ngOnChanges() {
    if (this.user.id) {
      this.mysql.query("owner/book.php", { uid: this.user.id }).subscribe((data: any) => {
        this.data = new MatTableDataSource(data);
        this.data.paginator = this.paginator;
        this.pager = data.length < 25 ? true : false;
      });
    }
  }
  culcFee(e) {
    let amount = Number(e.currentTarget.value);
    if (amount > this.user.p) {
      alert("現在残高" + this.user.p + "ポイントまでしか請求できません。");
      amount = this.user.p;
    }
    this.fee = Math.ceil(amount * 0.08 + 324);
  }
  request() {
    let input = <HTMLInputElement>document.getElementById('amount');
    let amount = Number(input.value);
    if (amount > this.user.p) {
      alert("現在残高" + this.user.p + "ポイントまでしか請求できません。");
      input.value = this.user.p;
    } else {
      alert(amount + "ポイントを出金請求しました。\nシステム手数料" + this.fee + "円を差し引いた" + (amount - this.fee) + "円が振り込まれます。");
      input.value = "0";
      this.user.p -= amount;
    }
  }
}
