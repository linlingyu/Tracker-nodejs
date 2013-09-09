// phantomjs --proxy=127.0.0.1:8085 web.js url pageId
var args = phantom.args,
    page = require('webpage').create(),
    date = require('../node_modules/utility/date').date,
    url = args[0],
    taskId = args[1],
    timer;
!/^http:\/\//.test(url) && (url = 'http://' + url);
console.log('phantomjs start: ' + url);
page.clipRect = {top: 0, left: 0, width: 1280, height: 800};
page.onCallback = function(data){
    switch(data.cmd){
        case 'exit':
            clearTimeout(timer);//清除超时
            console.log('request tracker complete');
            break;
        case 'timeout':
            break;
        default:
            phantom.exit();
    }
    phantom.exit();
}
page.onLoadFinished = function(){
    page.evaluate(function(taskId){//该页面的唯一id，会通过socket pageload事件发送到nodejs里
        window._taskId_ = taskId;
        window._socketFinish_ = function(){
            window.callPhantom({cmd: 'exit'});
        }
    }, taskId);
    var timer = setTimeout(function(){//超时30秒退出
        page.open('http://fe.baidu.com/push/simpleTasks/finish?uuid=' + taskId + '&finishTime=' + date.format(new Date(), 'yyyy-MM-dd'), function(status){
            console.log('request tracker failure, finish task: ' + status);
            phantom.exit();
        });
    }, 30000);
}
page.open(url, function (status) {
    //Page is loaded!
//    var title = page.evaluate(function(args){});
});