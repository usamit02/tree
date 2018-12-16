import { Component, OnInit } from '@angular/core';
import { MysqlService } from '../service/mysql.service';
declare var tinymce: any;
declare var $;
declare var twttr;
@Component({
  selector: 'app-tiny',
  templateUrl: './tiny.component.html',
  styleUrls: ['./tiny.component.scss']
})
export class TinyComponent implements OnInit {
  rid = 1002;//@input() rid:number;
  storys = [];
  orgStorys: string;
  constructor(private mysql: MysqlService) {
  }
  ngOnInit() {
    this.mysql.query("owner/story.php", { rid: this.rid }).subscribe((storys: any) => {
      this.orgStorys = JSON.stringify(storys);
      this.storys = storys;
      for (let i = 0; i < storys.length; i++) {
        $("#wrap").append('<div id="tiny' + i + '"class="tiny mce-content-body" contenteditable="true" style="position: relative;" spellcheck="false">' + storys[i].txt + '</div>');
        $("form").append('<input id="row' + i + '" type="hidden"></input>');
      }
      this.tiny(0);
    });
  }
  tiny(id) {
    let selector = id ? "#tiny" + id : "div .tiny";
    tinymce.init({
      selector: selector,
      menubar: false,
      inline: true,
      event_root: '#wrap',
      theme: 'inlite',
      language_url: 'https://bloggersguild.cf/js/ja.js',
      plugins: [
        'autolink', 'codesample', 'contextmenu', 'link', 'lists', 'table', 'textcolor', 'image', 'imagetools', 'media'
      ],
      toolbar: [
        'undo redo | bold italic underline | fontselect fontsizeselect',
        'forecolor backcolor | alignleft aligncenter alignright alignfull | link unlink | numlist bullist outdent indent'
      ],
      insert_toolbar: 'quicktable image media',
      selection_toolbar: 'forecolor backcolor | fontselect fontsizeselect | bold italic | h2 h3 | blockquote quicklink',
      contextmenu: 'image media tweet inserttable | cell row column deletetable | undo redo | del up down',
      forced_root_block: false, allow_conditional_comments: true, allow_html_in_named_anchor: true, allow_unsafe_link_target: true,
      extended_valid_elements: "twitter-widget[class|id|data-tweet-id|style]",//"*[*]",//"ngx-tweet[tweetId]",
      images_upload_handler: (blobInfo, success, failure) => {
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
      setup: (editor) => { // オリジナルのプラグインボタンの追加 
        editor.addMenuItem('del', { //editor.addButton(contextmenu以外のmenu)
          text: '行を削除',
          onclick: () => {
            $("#" + editor.id).remove();
            this.storys[Number(editor.id.replace("tiny", ""))].txt = null;
          }
        });
        editor.addMenuItem('up', {
          text: '行を上に移動',
          onclick: () => { updown(true, editor); }
        });
        editor.addMenuItem('down', {
          text: '行を下に移動',
          onclick: () => { updown(false, editor); }
        });
        editor.addMenuItem('tweet', {
          text: "tweet",
          onclick: () => {
            editor.windowManager.open({
              title: 'Tweet埋め込み',
              body: [
                {
                  type: 'textbox',
                  size: 40,
                  height: '100px',
                  name: 'twitter',
                  label: 'url'
                }
              ],
              onsubmit: (e) => {
                $.ajax({
                  url: "https://publish.twitter.com/oembed?url=" + e.data.twitter,
                  dataType: "jsonp",
                  async: false,
                  success: (data) => {
                    let widget = data.html.substring(0, data.html.indexOf("<script"));
                    tinymce.activeEditor.insertContent(
                      '<div contenteditable="false" class="div_border" data-mce-style="width:' + data.width + 'px;">' + widget + '</div>');
                  },
                  error: (jqXHR, exception) => {
                    var msg = '';
                    if (jqXHR.status === 0) {
                      msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                      msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                      msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                      msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                      msg = 'Time out error.';
                    } else if (exception === 'abort') {
                      msg = 'Ajax request aborted.';
                    } else {
                      msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    alert(msg);
                  },
                  complete: (result) => {
                    twttr.widgets.load();
                  }
                });
              }
            });
          }
        });
        editor.on('blur', (e) => {
          let story = makeStory(editor);
          let i = Number(editor.id.replace("tiny", ""));
          this.storys[i].txt = story;
          console.log(i + ":" + story);
        });
      }
    });
    function updown(up: boolean, editor) {
      let rep = up ? $("#" + editor.id).prev() : $("#" + editor.id).next();
      if (rep !== undefined) {
        if (up) {
          rep.before($("#" + editor.id));
        } else {
          rep.after($("#" + editor.id));
        }
      }
    }
    function makeStory(editor) {
      var html = editor.getContent({ format: "html" });
      html = makeHtml(html, editor, '<div class="div_border" contenteditable="false">&nbsp;</div>', 'twitter-widget');
      return html;
    }
    function makeHtml(html, editor, replaceHtml, tag) {
      if (html.indexOf(replaceHtml) > 0) {
        let rawHtml = editor.getContent({ format: "raw" });
        let start = rawHtml.indexOf("<" + tag);
        let end = rawHtml.indexOf('</' + tag + '>', start) + tag.length + 3;
        if (start > 0 && start < end) {
          html = html.replace(replaceHtml, rawHtml.substring(start, end));
        } else {
          alert("埋め込みエラー");
          html = html.replace(replaceHtml, "");
        }
      }
      return html;
    }
    /*
    function makeHtml(editor, replaceHtml, tag) {
      var html = editor.getContent({ format: "html" });
      if (html.indexOf(replaceHtml) > 0) {
        let rawHtml = editor.getContent({ format: "raw" });
        let start = rawHtml.indexOf("<" + tag);
        let end = rawHtml.indexOf('</' + tag + '>', start) + tag.length + 3;
        if (start > 0 && start < end) {
          html = html.replace(replaceHtml, rawHtml.substring(start, end));
        } else {
          alert("tweet埋め込みエラー");
          html = html.replace(replaceHtml, "");
        }
      }
      return html;
    }
    */
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
    var sql = ""; var maxid = 0; var i = 0; const rid = this.rid;
    $("#wrap div").each(function () {
      let id = Number($(this).attr('id').replace("tiny", ""));
      if (id != i) {
        sql += "UPDATE t21story SET idx=" + id + " WHERE rid=" + rid + " AND idx=" + i + ";\n";
      }
      i++;
    });
    const storys = JSON.parse(this.orgStorys);
    for (let i = 0; i < storys.length; i++) {
      if (this.storys[i].txt != storys[i].txt) {
        if (this.storys[i].txt === null) {
          sql += "DELETE FROM t21story WHERE rid=" + rid + " AND id=" + this.storys[i].id + ";\n";
        } else {
          sql += "UPDATE t21story SET txt='" + this.storys[i].txt + "',rev=" + this.dateFormat() + " WHERE rid=" + rid + " AND id=" + i + ";\n";
        }
      }
      maxid = (maxid < this.storys[i].id) ? this.storys[i].id : maxid;
    }
    for (let i = storys.length; i < this.storys.length; i++) {
      let id = maxid + i - storys.length + 1;
      sql += "INSERT INTO t21story (rid,id,idx,txt,upd) VALUES (" + rid + "," + id + "," + i + ",'" + this.storys[i].txt + "'," + this.dateFormat() + ");\n";
    }
    console.log(sql);
  }
  next() {
    let idx = this.storys.length;
    $("#wrap").append('<div id="tiny' + idx + '" class="tiny mce-content-body" contenteditable="true" style="position: relative;" spellcheck="false">新しい行</div>');
    $("form").append('<input id="row' + idx + '" type="hidden"></input>');
    this.tiny(idx);
    this.storys.push({ id: Math.max(...this.storys.map(story => story.id)) + 1, idx: idx, txt: "" });
  }
}
