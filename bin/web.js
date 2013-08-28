// phantomjs --proxy 127.0.0.1:8085 web.js url pageId
var args = phantom.args,
    page = require('webpage').create(),
    url = args[0],
    taskId = args[1];
console.log('phantomjs start: ' + url);
page.clipRect = {top: 0, left: 0, width: 1280, height: 800};

page.onCallback = function(data){
    data.cmd === 'exit' && phantom.exit();
}
page.onLoadFinished = function(){
    page.evaluate(function(taskId){//该页面的唯一id，会通过socket pageload事件发送到nodejs里
        var socket = window._socket_;
        window._taskId_ = taskId;
        socket && socket.on('finish', function(data){
            window.callPhantom({cmd: 'exit'});
        });
    }, taskId);
    
}
page.open(url, function (status) {
    //Page is loaded!
//    var title = page.evaluate(function(args){});
});