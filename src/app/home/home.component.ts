import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Room, MyUploadAdapter } from '../class';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MysqlService } from '../service/mysql.service';
import * as BalloonEditor from '@ckeditor/ckeditor5-build-balloon';
//import { } from './upload.adapter'
declare var tinymce: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private _room: Room;
  // user = { uid: "AMavP9Icrfe7GbbMt0YCXWFWIY42" };
  pay: boolean = false;
  plan = { amount: 3000, billing_day: null, trial_days: null };
  @Input()
  set room(_room: Room) {
    this.undoRoom(_room);
  }
  get room() {
    return this._room;
  }
  @Input() user;
  @Output() saveRoom = new EventEmitter();
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
  auth_days = new FormControl(
    Validators.min(0),
    Validators.max(30)
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
    auth_days: this.auth_days,
    prorate: this.prorate
  });
  /*
  tinyMCE = new FormControl();
  tinyForm = this.builder.group({
    tinyMCE: this.tinyMCE
  });*/
  public Editer = BalloonEditor;
  constructor(private builder: FormBuilder, private mysql: MysqlService) { }
  ngOnInit() {
    this.Editer.create(document.querySelector("#fire2"),
      {
        extraPlugins: [MyCustomUploadAdapterPlugin],
      }
    );
    tinymce.init({
      selector: '#mytextarea',
      plugins: 'link table image imagetools media contextmenu wordcount autosave',
      contextmenu: 'link image media',
      language_url: 'https://bloggersguild.cf/js/ja.js',
      menubar: false,
      image_title: false,
      file_picker_types: "image",
      //automatic_uploads: true,
      file_picker_callback: function (cb, value, meta) {
        var input = <HTMLInputElement>document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.onchange = function () {
          var file = input.files[0];
          var reader = new FileReader();
          reader.onload = function () {
            /*
            var id = 'blobid' + (new Date()).getTime();
            var blobCache = tinymce.activeEditor.editorUpload.blobCache;
            var base64 = reader.result[0].split(',')[1];
            var blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);
            cb(blobInfo.blobUri(), { title: file.name });// call the callback and populate the Title field with the file name
            */
          };
          reader.readAsDataURL(file);
        };
        input.click();
      },
      images_upload_handler: function (blobInfo, success, failure) {
        var xhr, formData;
        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', 'http://localhost/public_html/upload.php');
        xhr.onload = function () {
          var json;
          if (xhr.status != 200) {
            failure('HTTP Error: ' + xhr.status);
            return;
          }
          json = JSON.parse(xhr.responseText);
          if (!json || typeof json.location != 'string') {
            failure('Invalid JSON: ' + xhr.responseText);
            return;
          }
          success(json.location);
        };
        formData = new FormData();
        formData.append('file', blobInfo.blob(), "test");
        xhr.send(formData);
      },
      //images_upload_url: 'http://localhost/public_html/upload.php',
      //images_upload_base_path: 'C:/xampp/htdocs_clife/public_html/clife.cf/img/101/'
    });
  }
  changeContents() {
    if (!this.contents.value) this.paid.reset(false);
  }
  saveRoomForm() {
    console.log(this.roomForm.value);
    let params: any = { room: {}, plan: {} };
    const planProp = ['amount', 'billing_day', 'trial_days', 'auth_days'];
    for (const p of Object.keys(this.roomForm.value)) {
      if (!planProp.filter(prop => { return p === prop; }).length && !(this.roomForm.value[p] == this.room[p] || this.roomForm.value[p] == undefined)) {
        params.room[p] = this.roomForm.value[p] === false ? 0 : this.roomForm.value[p];
      }
    }
    if (this.roomForm.value.paid && planProp.filter(p => { return !(this.roomForm.value[p] == this.room[p] || this.roomForm.value[p] == undefined); }).length) {
      for (let i = 0; i < planProp.length; i++) {
        params.plan[planProp[i]] = this.roomForm.value[planProp[i]] === false ? 0 : this.roomForm.value[planProp[i]];
      }
    }
    this.mysql.query("owner/save.php", { roomForm: JSON.stringify(params), roomId: this.room.id }).subscribe((data: any) => {
      if (data.msg === "ok") {
        for (const p of Object.keys(this.roomForm.value)) {
          this._room[p] = this.roomForm.value[p];
        }
        this.saveRoom.emit("");
      } else {
        alert("データベースエラー C-Lifeまでお問合せください。");
      }
    });
  }
  undoRoom(_room) {
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
    this.auth_days.reset(_room.auth_days);
    //let prorate = _room.prorate ? true : false;
    this.prorate.reset(_room.prorate);
    this._room = _room;
  }
  /*
  saveTinyForm() {
    console.log(this.tinyMCE);
  }
  undoTiny() {
    this.tinyMCE.reset("<h1>おっはー</h1>")
  }*/
}
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}