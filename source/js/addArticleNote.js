(function() {
    let times = document.getElementsByTagName('time');
    if (times.length === 0) { return; }
    let posts = document.getElementsByClassName('post-content');
    if (posts.length === 0) { return; }

    // 获取 tags
    let noteTags = ["且听秋谷","redis","Ubuntu", "SpringBoot", "redis",
    "android","golang","java","android","微信开发","爬虫","AOSP"];
    let tags = document.getElementsByClassName("hover-with-bg");
    let match = false;
    for(let tagIndex = 0; tagIndex < tags.length; tagIndex++){
        for(let i = 0; i < noteTags.length; i++){
            if(tags[tagIndex].innerText.trim().toLowerCase().indexOf(noteTags[i].trim().toLowerCase()) >= 0) {
                match = true;
                break;
            }
        }
        if(match) {
            break;
        }
    }

    if(!match) { return; }

    var pubTime = new Date(times[0].dateTime);  /* 文章发布时间戳 */
    var now = Date.now()  /* 当前时间戳 */
    var interval = parseInt(now - pubTime)
    /* 发布时间超过指定时间（毫秒） */
    if (interval > 3600*24*30*1000){
      var days = parseInt(interval / 86400000)
      posts[0].innerHTML = '<div class="note note-warning" style="font-size:0.9rem"><p>' +
        '<div class="h6">技术文章时效性提示</div><p>这是一篇发布于 ' + days + ' 天前的文章，部分信息可能已发生改变，请注意甄别。' +
        '</p></p></div>' + posts[0].innerHTML;
    }
  })();
  