$(document).ready(function () {

  tinymce.PluginManager.add('twitter_url', function (editor, url) {
    var icon_url = 'img/social/twitter.png';

    editor.on('init', function (args) {
      editor_id = args.target.id;

    });
    editor.addButton('twitter_url',
      {
        text: false,
        icon: true,
        image: icon_url,

        onclick: function () {

          editor.windowManager.open({
            title: 'Twitter Embed',

            body: [
              {
                type: 'textbox',
                size: 40,
                height: '100px',
                name: 'twitter',
                label: 'twitter'
              }
            ],
            onsubmit: function (e) {

              var tweetEmbedCode = e.data.twitter;

              $.ajax({
                url: "https://publish.twitter.com/oembed?url=" + tweetEmbedCode,
                dataType: "jsonp",
                async: false,
                success: function (data) {
                  // $("#embedCode").val(data.html);
                  // $("#preview").html(data.html)
                  tinyMCE.activeEditor.insertContent(
                    '<div class="div_border" contenteditable="false">' +
                    '<img class="twitter-embed-image" src="' + icon_url + '" alt="image" />'
                    + data.html +
                    '</div>');

                },
                error: function (jqXHR, exception) {
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
              });
              setTimeout(function () {
                iframe.contentWindow.twttr.widgets.load();

              }, 1000)
            }
          });
        }
      });
  });


  tinymce.init({
    selector: "#content",
    height: 300,
    theme: 'modern',
    menubar: true,
    plugins: 'preview code twitter_url',
    toolbar: 'code preview twitter_url',

    valid_elements: '+*[*]',

    extended_valid_elements: "+iframe[width|height|name|align|class|frameborder|allowfullscreen|allow|src|*]," +
      "script[language|type|async|src|charset]" +
      "img[*]" +
      "embed[width|height|name|flashvars|src|bgcolor|align|play|loop|quality|allowscriptaccess|type|pluginspage]" +
      "blockquote[dir|style|cite|class|id|lang|onclick|ondblclick"
      + "|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
      + "|onmouseover|onmouseup|title]",

    content_css: ['css/main.css?' + new Date().getTime(),
      '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
      '//www.tinymce.com/css/codepen.min.css'
    ],
    setup: function (editor) {
      console.log(editor);
      editor.on('init', function (args) {
        editor_id = args.target.id;
      });

    },
  })
})