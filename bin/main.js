void function(){
    var fs = require('fs'),
        utility = require('utility/utility'),
        httpReq = require('sendHttpRequest'),
        httpServer = require('httpServer').create(),
        httpProxy = require('httpProxy').create(httpServer),
        socketServer = require('socketServer').create(),
        socketProxy = require('socketProxy').create(socketServer),
        codeController = require('CodeController').create();
        
    httpProxy.initialize(codeController);
    socketProxy.initialize(codeController);
    httpProxy.start();
    socketProxy.start(httpProxy.getServer());
    
    var timer;
    socketProxy.on('pageload', function(args){
        var socket = args.socket,
            taskId = args.taskId,
            mapList = args.mapList,
            codeList = args.codeList;
        
        var ret = [],
            refe, inst, code;
        mapList.list().forEach(function(item){
            ret.push(refe = {codeList: []});
            refe.title = item.getTitle();
            refe.refererId = item.getRefererId();
            item.getCodeList().forEach(function(codeId){
                code = codeList.get(codeId);
                refe.codeList.push(inst = {});
                inst.codeId = code.getCodeId();
                inst.name = code.getFileName();
                inst.url = code.getUrl();
                inst.formattedCode = code.getFormattedCode();
                inst.arrivalMapping = code.getArrivalMapping();
                inst.executeCount = code.getExecuteCount();
                inst.totalLineNumber = inst.formattedCode.length;
                inst.coverRatio = Math.round(inst.executeCount / inst.totalLineNumber * 100);
                inst.executeTime = code.getEndTime() - code.getStartTime();
                inst.loadTime = code.getLoadTime();
                inst.status = code.getStatus();
           });
        });
        mapList.clear();
        if(!refe || !refe.refererId){return;}
        taskId = taskId || refe.refererId;
//        '../../data/tracker-data-'
        fs.writeFileSync('D:/Program Files/workspace/BAIDU_TANGRAM/web/tracker-ret/data/tracker-data-'+ taskId +'.js',
            'tracker = tracker.concat(' + JSON.stringify(ret, null, 4) + ');',
            'utf-8');
        socket.emit('finish', {ident: taskId});
        //发送请求到
        args.taskId && httpReq.httpRequest({
            id: taskId,
            finishTime: utility.date.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
        });
        console.log('complete: ' + refe.refererId);
    });
}();