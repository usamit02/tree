import { Component, OnInit } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
declare var $;
declare var twttr;
@Component({
  selector: 'app-tiny2',
  templateUrl: './tiny2.component.html',
  styleUrls: ['./tiny2.component.scss']
})
export class Tiny2Component implements OnInit {
  rid = 1002;//@input() rid:number;
  storys = [];
  edits = [];
  storyLength: number;
  storyMaxid: number;
  contextMenu = null;
  tinyInit = {
    selector: ".tiny",
    menubar: false,
    inline: true,
    theme: 'inlite',
    language_url: 'https://bloggersguild.cf/js/ja.js',
    plugins: [
      'autolink', 'autosave', 'codesample', 'contextmenu', 'link', 'lists', 'table', 'textcolor', 'image', 'imagetools', 'media', 'paste'
    ],
    toolbar: [
      'undo redo | bold italic underline | fontselect fontsizeselect',
      'forecolor backcolor | alignleft aligncenter alignright alignfull | link unlink | numlist bullist outdent indent | copy paste'
    ],
    insert_toolbar: 'quicktable image media',
    selection_toolbar: 'forecolor backcolor | fontselect fontsizeselect | bold italic | h2 h3 | blockquote quicklink copy paste',
    contextmenu: 'image media tweet inserttable | cell row column deletetable | undo redo | paste up down restoredraft del',
    forced_root_block: false, allow_conditional_comments: true, allow_html_in_named_anchor: true, allow_unsafe_link_target: true,
    extended_valid_elements: "twitter-widget[class|id|data-tweet-id|style]",//"*[*]",//"ngx-tweet[tweetId]",
    setup: (editor) => { // オリジナルのプラグインボタンの追加 
      editor.addMenuItem('del', { //editor.addButton(contextmenu以外のmenu)
        text: '行を削除',
        onclick: () => { $("#" + editor.id).parent().fadeOut(500); }
      });
      editor.addMenuItem('up', {
        text: '行を上に移動',
        onclick: () => { updown(true, editor); }
      });
      editor.addMenuItem('down', {
        text: '行を下に移動',
        onclick: () => { updown(false, editor); }
      });
      editor.on('blur', (e) => {
        if ($("#" + editor.id).parent().css('display') !== 'none') {
          let html = makeStory(editor);
          this.edits[editor.id] = html;
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
        //html = makeHtml(html, editor, '<div class="tweet" contenteditable="false">&nbsp;</div>', 'twitter-widget');
        //html = makeHtml(html, editor, 'div.tweet', 'twitter-widget');
        return html;
      }
    }
  }
  constructor(private mysql: MysqlService) {
  }
  ngOnInit() {
    this.mysql.query("owner/story.php", { rid: this.rid }).subscribe((storys: any) => {
      this.storys = storys;
      this.storyLength = storys.length;
      this.storyMaxid = Math.max(...storys.map(story => story.id));
    });
    $(document).on('dragenter', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $(document).on('dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      //$(".media").css('border', '2px dotted #0B85A1');
    });
    $(document).on('drop', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  }
  dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.target).css('border', '2px solid #0B85A1');
  }
  dragover(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  drop(e) {
    let media = e.target;
    e.preventDefault();
    if (media.className !== "media") {
      media = $(media).parents(".media");
    }
    if (media) {
      $(media).css('border', '2px dotted #0B85A1');
      this.upload(e.dataTransfer.files, media);
    }
  }
  context(e) {
    let media = e.target;
    e.stopPropagation();
    e.preventDefault();
    if (media.className !== "media") {
      media = $(media).parents(".media");
    }
    this.contextMenu = this.contextMenu ? null : { media: media, x: e.pageX, y: e.pageY };
  }
  fileup(e) {
    this.upload(e.target.files, this.contextMenu.media);//$(e.target).prevAll('.media'));
  }
  urlup(e) {
    this.flame(e.target.value, this.contextMenu.media);//$(e.target).prevAll('.media'));
  }
  newrow() {
    this.storys.push({ id: Math.max(...this.storys.map(story => story.id)) + 1, txt: "新しい行", media: "" });
  }
  flame(html, media) {
    if (!html) return;
    if (html.indexOf("twitter.com") > 0) {
      let id = html.match("twitter.com/[0-9a-zA-Z_]{1,15}/status(?:es)?/([0-9]{19})");
      if (id && id.length) {
        $(media).html('<ngx-tweet tweeId="' + id[1] + '"></ngx-tweet>');
      } else {
        alert("twitterのurlを解析できませんでした。");
      }
    } else if (html.indexOf("youtu.be") > 0 || html.indexOf("youtube.com") > 0) {
      let id = html.match('[\/?=]([a-zA-Z0-9\-_]{11})');
      if (id && id.length) {
        let tag = '<img src="http://i.ytimg.com/vi/' + id[1] + '/sddefault.jpg">';
        $(media).html('<a href="https://youtube.com/watch?v=' + id[1] + '" target="_blank">' + tag + '</a>');
      } else {
        alert("youtubeのurlを解析できませんでした。");
      }
    } else {

    }
  }
  upload(files, media) {
    var rid = this.rid.toString();
    if (!files.length) return;
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
      var id = $(media).attr('id');
      var fd = new FormData();
      fd.append('rid', rid);
      fd.append('id', id);
      fd.append('file', file);
      var jqXHR = $.ajax({
        xhr: function () {
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
        url: "http://localhost/public_html/upload.php",
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: fd,
        success: function (data) {
          status.setProgress(100);
          var res = JSON.parse(data);
          if (res.err === undefined) {
            let src = '="http://localhost/public_html/media/' + rid + '/' + id + '.' + res.ext + '?' + new Date().getTime();
            if (res.typ === "img") {
              $(media).html('<img src' + src + '">');
            } else if (res.typ === "audio") {
              $(media).html('<audio src' + src + '" controls>');
            } else if (res.typ === "video") {
              $(media).html('<video src' + src + '" controls>');
            } else {
              $(media).html('<a href' + src + '" download="' + id + '.' + res.ext + '">ダウンロード</a>');
            }
          } else {
            alert(res.err);
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
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
    var sql = ""; const rid = this.rid; const storys = this.storys; const edits = this.edits;
    var i = 0;
    $(".row").each((index, row) => {
      let idx = Number($(row).attr('id'));
      let mceId = $(row).children(".tiny").attr('id');
      if ($(row).css('display') === 'none') {
        if (idx < this.storyLength) {
          sql += "DELETE FROM t21story WHERE rid=" + rid + " AND id=" + storys[idx].id + ";\n";
        }
      } else {
        if (idx >= this.storyLength && edits[mceId] !== undefined) {
          let id = this.storyMaxid + idx - this.storyLength + 1;
          sql += "INSERT INTO t21story (rid,id,idx,txt,upd) VALUES (" + rid + "," + id + "," + i + ",'" +
            edits[mceId] + "'," + this.dateFormat() + ");\n";
        } else {
          if (edits[mceId] !== undefined && storys[idx].txt != edits[mceId]) {
            sql += "UPDATE t21story SET txt='" + edits[mceId] + "',rev=" + this.dateFormat() +
              " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";\n";
          }
          if (idx !== i) {
            sql += "UPDATE t21story SET idx=" + i + " WHERE rid=" + rid + " AND id=" + storys[idx].id + ";\n";
          }
        }
        i++;
      }
    });
    console.log(sql);
    if (sql) {
      this.mysql.query("owner/save.php", { sql: sql.substr(0, sql.length - 1) }).subscribe((res: any) => {
        if (res.msg !== "ok") {
          alert("データベースエラーにより保存できませんでした。");
        }
      });
    }
  }
}
