import { Component, Input, OnInit } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
declare var $; declare var twttr; declare var tinymce;
@Component({
  selector: 'app-tiny2',
  templateUrl: './tiny2.component.html',
  styleUrls: ['./tiny2.component.scss']
})
export class Tiny2Component implements OnInit {
  @Input() rid: number;
  storys = [];
  txts = [];
  medias = [];
  pays = [];
  storyLength: number;
  storyMaxid: number;
  contextMenu = null;
  drag = null;
  newTxt = "新しい段落";
  newMedia = "ファイルをドロップ<br>または<br>右クリック";
  tinyinit = {
    selector: ".tiny",
    menubar: false,
    inline: true,
    theme: 'inlite',
    language_url: 'https://bloggersguild.cf/js/ja.js',
    plugins: [
      'autolink', 'autosave', 'codesample', 'contextmenu', 'link', 'lists', 'table', 'textcolor', 'image', 'imagetools', 'media', 'paste'
    ],
    selection_toolbar: 'forecolor backcolor | fontselect fontsizeselect | bold italic | h2 h3 | blockquote quicklink copy paste',
    contextmenu: '| undo redo | paste up down restoredraft del | inserttable cell row column deletetable | paystart payend',
    forced_root_block: false, allow_conditional_comments: true, allow_html_in_named_anchor: true, allow_unsafe_link_target: true,
    setup: (editor) => { // オリジナルのプラグインボタンの追加 
      editor.addMenuItem('del', { //editor.addButton(contextmenu以外のmenu)
        text: '段落を削除',
        onclick: () => { $("#" + editor.id).parent().fadeOut(500); }
      });
      editor.addMenuItem('up', {
        text: '段落を上に移動',
        onclick: () => { updown(true, editor); }
      });
      editor.addMenuItem('down', {
        text: '段落を下に移動',
        onclick: () => { updown(false, editor); }
      });
      editor.addMenuItem('paystart', {
        text: 'ここから有料',
        onclick: () => {
          const idx = $("#" + editor.id).parent().attr('id');
          editor.windowManager.open({
            title: '有料設定',
            body: [
              {
                type: 'textbox',
                size: 10,
                height: '100px',
                name: 'pay',
                label: '価格',
                value: this.storys[idx].pay
              }
            ],
            onsubmit: (e) => {
              let p = e.data.pay;
              if (p >= 0 && p < 1000000 && this.storys[idx].pay != p) {
                this.storys[idx].pay = p;
                this.pays[idx] = p;
              }
            }
          })
        }
      });
      editor.addMenuItem('payend', {
        text: 'ここまで有料',
        onclick: () => {
          const idx = $("#" + editor.id).parent().attr('id');
          for (let i = idx; i >= 0; i--) {
            if (this.storys[i].pay > 0) {
              for (let j = i; j <= idx; j++) {
                if (this.storys[j].pay != this.storys[i].pay) {
                  this.storys[j].pay = this.storys[i].pay;
                  this.pays[j] = this.storys[i].pay;
                }
              }
              break;
            }
          }
        }
      });
      editor.on('blur', (e) => {
        if ($("#" + editor.id).parent().css('display') !== 'none') {
          let html = makeStory(editor);
          if (html != this.newTxt) this.txts[editor.id] = html;
          console.log(editor.id + ":" + html);
        }
      });
      function updown(up, editor) {
        let rep = up ? $("#" + editor.id).parent().prev() : $("#" + editor.id).parent().next();
        if (rep !== undefined) {
          if (up) {
            rep.before($("#" + editor.id).parent());
          } else {
            rep.after($("#" + editor.id).parent());
          }
        }
      }
      function makeStory(editor) {
        var html = editor.getContent({ format: "html" });
        return html;
      }
    }
  }
  constructor(private mysql: MysqlService) {
  }
  ngOnChanges() {
    this.load();
  }
  ngOnInit() {
    $(document).on('dragenter', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $(document).on('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      $(".media").css('border', '2px dotted #0B85A1');
    });
    $(document).on('drop', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  }
  load() {
    this.mysql.query("owner/story.php", { rid: this.rid }).subscribe((storys: any) => {
      this.storyLength = storys.length;
      this.storyMaxid = storys.length ? Math.max(...storys.map(story => story.id)) : 0;
      this.storys = storys;
      this.storys.push({ id: this.storyMaxid + 1, txt: this.newTxt, media: this.newMedia, pay: 0 });
      setTimeout(() => {
        twttr.widgets.load();
        tinymce.init(this.tinyinit);
      });
    });
  }
  dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).css('border', '2px solid #0B85A1');
  }
  dragover(e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.currentTarget.className === "row") {
      $(e.currentTarget).css('border', '1px solid lightgray');
    }
  }
  dragstart(e) {
    this.drag = e.currentTarget;
  }
  dragentertxt(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.drag && e.currentTarget.className === "row" && this.drag.id !== e.currentTarget.id) {
      $(e.currentTarget).css('border', '2px solid #0B85A1');
    }
  }
  dropmedia(e) {
    let media = e.currentTarget;
    e.preventDefault();
    if (media.className === "media") {
      $(media).css('border', '2px dotted #0B85A1');
      this.upload(e.dataTransfer.files, media);
    }
  }
  droptxt(e) {
    let drop = e.currentTarget;
    e.preventDefault();
    if (this.drag && drop.className === "row") {
      if ($("#" + this.drag.id).prev().attr('id') === drop.id) {
        $("#" + drop.id).before($("#" + this.drag.id));
      } else {
        $("#" + drop.id).after($("#" + this.drag.id));
      }
    }
    $(".row").css('border', '1px solid lightgray');
    $(".media").css('border', '2px dotted #0B85A1');
  }
  dragend() {
    let fix = $("#" + this.drag.id).children(".row");
    if (fix) fix.className = "media";
    this.drag = null;
  }
  context(e) {
    let media = e.currentTarget;
    e.stopPropagation();
    e.preventDefault();
    if (media.className !== "media") {
      media = $(media).parents(".media");
    }
    this.contextMenu = this.contextMenu ? null : { media: media, x: e.pageX, y: e.pageY };
  }
  fileup(e) {
    this.upload(e.target.files, this.contextMenu.media);//$(e.target).prevAll('.media'));
    this.contextMenu = null;
  }
  urlup(e) {
    this.getMedia(e.target.value, this.contextMenu.media);//$(e.target).prevAll('.media'));
    this.contextMenu = null;
  }
  mediaDel(e) {
    let media = this.contextMenu.media;
    media.innerHTML = "";
    this.medias[media.id] = "";
    this.contextMenu = null;
  }
  newrow() {
    let id = this.storys.length ? Math.max(...this.storys.map(story => story.id)) : 0;
    this.storys.push({ id: id + 1, txt: this.newTxt, media: this.newMedia });
    setTimeout(() => {
      tinymce.init(this.tinyinit);
    });
  }
  getMedia(html, media) {
    if (!html) return;
    if (html.indexOf("twitter.com") > 0) {
      let url = html.match("twitter.com/[0-9a-zA-Z_]{1,15}/status(?:es)?/[0-9]{19}");
      if (url && url.length) {
        let tweet = '<blockquote class="twitter-tweet" data-conversation="none"><a href="https://' + url[0] + '"></a></blockquote>';
        $(media).html(tweet);
        twttr.widgets.load();
        this.medias[media.id] = tweet;
      } else {
        alert("twitterのurlを解析できませんでした。");
      }
    } else if (html.indexOf("youtu.be") > 0 || html.indexOf("youtube.com") > 0) {
      let id = html.match('[\/?=]([a-zA-Z0-9\-_]{11})');
      if (id && id.length) {
        let tag = '<img src="http://i.ytimg.com/vi/' + id[1] + '/sddefault.jpg">';
        let youtube = '<a href="https://youtube.com/watch?v=' + id[1] + '" target="_blank">' + tag + '</a>';
        $(media).html(youtube);
        this.medias[media.id] = youtube;
      } else {
        alert("youtubeのurlを解析できませんでした。");
      }
    } else {
      alert("twitterかyoutubeのurlを入力してください。");
    }
  }
  upload(files, media) {
    var rid = this.rid.toString();
    if (!files.length) return;
    var medias = this.medias;
    var rowCount = 0;
    var status = new createStatusbar(media); //Using this we can set progress.
    status.setFileNameSize(files[0].name, files[0].size);
    if (files[0].type.match(/image.*/)) {
      var canvas = document.querySelector('canvas');
      var ctx = canvas.getContext('2d');
      var img = new Image();
      var reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          let h = 480;
          let w = img.width * (h / img.height);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(send, 'image/jpeg');
        }
        img.src = <string>reader.result;
      }
      reader.readAsDataURL(files[0]);
    } else {
      send(files[0]);
    }
    function send(file) {
      var fd = new FormData();
      fd.append('rid', rid);
      fd.append('id', media.id);
      fd.append('file', file);
      var jqXHR = $.ajax({
        xhr: () => {
          var xhrobj = $.ajaxSettings.xhr();
          if (xhrobj.upload) {
            xhrobj.upload.addEventListener('progress', function (event) {
              var percent = 0;
              var position = event.loaded || event.position;
              var total = event.total;
              if (event.lengthComputable) {
                percent = Math.ceil(position / total * 100);
              }
              status.setProgress(percent);
            }, false);
          }
          return xhrobj;
        },
        url: "http://localhost/public_html/owner/upload.php",
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: fd,
        success: (data) => {
          status.setProgress(100);
          var res = JSON.parse(data);
          if (res.err === undefined) {
            let html: string;
            let src = '="http://localhost/public_html/media/' + rid + '/' + media.id + '.' + res.ext + '?' + new Date().getTime();
            if (res.typ === "img") {
              html = '<img src' + src + '">';
            } else if (res.typ === "audio") {
              html = '<audio src' + src + '" controls>';
            } else if (res.typ === "video") {
              html = '<video src' + src + '" controls>';
            } else {
              html = '<a href' + src + '" download="' + media.id + '.' + res.ext + '"><img src="img/downlord.jpg"></a>';
            }
            media.innerHTML = html;
            medias[media.id] = html;
          } else {
            alert(res.err);
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
          alert("ajax通信に失敗しました。");
        }
      });
    }
    function createStatusbar(obj) {
      rowCount++;
      var row = "odd";
      if (rowCount % 2 == 0) row = "even";
      this.statusbar = $("<div class='statusbar " + row + "'></div>");
      this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
      this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
      this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
      this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
      $(obj).children().replaceWith(this.statusbar);
      this.setFileNameSize = function (name, size) {
        var sizeStr = "";
        var sizeKB = size / 1024;
        if (sizeKB > 1024) {
          var sizeMB = sizeKB / 1024;
          sizeStr = sizeMB.toFixed(2) + " MB";
        }
        else {
          sizeStr = sizeKB.toFixed(2) + " KB";
        }
        this.filename.html(name);
        this.size.html(sizeStr);
      }
      this.setProgress = function (progress) {
        var progressBarWidth = progress * this.progressBar.width() / 100;
        this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
        if (parseInt(progress) >= 100) {
          this.abort.hide();
        }
      }
      this.setAbort = function (jqxhr) {
        var sb = this.statusbar;
        this.abort.click(function () {
          jqxhr.abort();
          sb.hide();
        });
      }
    }
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return "'" + y + "-" + m + "-" + d + " " + h + ":" + min + ":" + sec + "'";
  }
  save() {
    const rid = this.rid, storys = this.storys, txts = this.txts, medias = this.medias, pays = this.pays;
    var i = 0, sql = "", reload = false, newStoryLength = 0;
    $(".row").each((index, row) => {
      const idx = Number($(row).attr('id'));
      const mceId = $(row).children(".tiny").attr('id');
      if ($(row).css('display') === 'none') {//削除行
        if (idx < this.storyLength) {
          sql += "DELETE FROM t21story WHERE rid=" + rid + " AND id=" + storys[idx].id + ";;\r\n";
          reload = true;
        }
      } else {
        const mediaId = $(row).find(".media").attr('id');
        if (idx >= this.storyLength) {//新規行
          if (txts[mceId] === undefined && medias[mediaId] === undefined && pays[idx] === undefined) {
            reload = true;//新規行に変更ないときは消すためにリロード
          } else {//新規保存
            let txt = txts[mceId] === undefined ? "" : txts[mceId];
            let media = medias[mediaId] === undefined ? "" : medias[mediaId];
            let pay = pays[idx] === undefined ? 0 : pays[idx];
            sql += "INSERT INTO t21story (rid,id,idx,txt,media,pay,upd) VALUES (" + rid + "," + storys[idx].id +
              "," + i + ",'" + txt + "','" + media + "'," + pay + "," + this.dateFormat() + ");;\r\n";
            newStoryLength++;
          }
        } else {//既存行
          if (txts[mceId] !== undefined && storys[idx].txt != txts[mceId]) {//テキストの変更
            sql += "UPDATE t21story SET txt='" + txts[mceId] + "',rev=" + this.dateFormat() +
              " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";;\r\n";
          }
          if (medias[mediaId] !== undefined) {//メディアの変更
            sql += "UPDATE t21story SET media='" + medias[mediaId] + "',rev=" + this.dateFormat() +
              " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";;\r\n";
          }
          if (pays[idx] !== undefined) {//有料の変更
            sql += "UPDATE t21story SET pay='" + pays[idx] + "',rev=" + this.dateFormat() +
              " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";;\r\n";
          }
          if (idx !== i) {//順番の変更、要リロード
            sql += "UPDATE t21story SET idx=" + i + " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";;\r\n";
            reload = true;
          }
        }
        i++;
      }
    });
    console.log(sql);
    if (sql) {
      this.mysql.query("owner/story.php", { sql: sql.substr(0, sql.length - 1) }).subscribe((res: any) => {
        if (res.msg === "ok") {
          this.txts = []; this.medias = []; this.storyLength += newStoryLength;
          if (reload) this.load();
        } else {
          if (confirm("データベースエラーにより保存できませんでした。\n" + res.msg +
            "\n\n編集中の内容は失われますがリロードしますか。\nリロード前に編集内容をメモ帳などにコピーをお勧めします。")) {
            this.load();
          };
        }
      });
    }
  }
}
