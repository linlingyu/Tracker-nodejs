void function(){
    var fs = require('fs'),
        date = require('utility/date').date,
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
//    var timer;
    function getRefeList(mapList){
        var ret = [], refe;
        mapList.list().forEach(function(item){
            ret.push(refe = {});
            refe.title = item.getTitle();
            refe.refererId = item.getRefererId();
        });
        return ret;
    }
    
    
    function getCodeList(refeList, mapList, codeList){
        var ret = [], refe, code, codeInst;
        refeList.forEach(function(item){
            refe = mapList.get(item.refererId);
            item.codeList = [];
            refe.getCodeList().forEach(function(codeId){
                code = codeList.get(codeId);
                item.codeList.push(codeInst = {});
                ret.push(codeInst);
                codeInst.codeId = code.getCodeId();
                codeInst.name = code.getFileName();
                codeInst.url = code.getUrl();
                codeInst.formattedCode = code.getFormattedCode();
                codeInst.arrivalMapping = code.getArrivalMapping();
                codeInst.executeCount = code.getExecuteCount();
                codeInst.totalLineNumber = codeInst.formattedCode.length;
                codeInst.coverRatio = Math.round(codeInst.executeCount / codeInst.totalLineNumber * 100);
                codeInst.executeTime = code.getEndTime() - code.getStartTime();
                codeInst.loadTime = code.getLoadTime();
                codeInst.status = code.getStatus();
            });
        });
        return ret;
    }
    
    function getFnList(codeArray, codeList, fnList){
        var ret = [],
            code, fn, fnInst;
        codeArray.forEach(function(item, index){
            code = codeList.get(item.codeId);
            item.fnList = [];
            code.getFnList().forEach(function(fnId, index){
                fn = fnList.get(fnId);
                item.fnList.push(fn);
                ret.push(fn);
            });
        });
        return ret;
    }
    
    socketProxy.on('pageload', function(args){
        var socket = args.socket,
            taskId = args.taskId,
            mapList = args.mapList,
            codeList = args.codeList,
            fnList = args.fnList,
            refeList = getRefeList(mapList);
        
        if(!refeList.length){return;}
        var codeArray = getCodeList(refeList, mapList, codeList);
        getFnList(codeArray, codeList, fnList);
        mapList.clear();
        taskId = taskId || refeList[0].refererId;
//        '../../data/tracker-data-'
        fs.writeFileSync('D:/Program Files/workspace/BAIDU_TANGRAM/web/tracker-ret/data/tracker-data-'+ taskId +'.js',
            '{"tracker": ' + JSON.stringify(refeList, null, 4) + '}', 'utf-8');
        socket.emit('finish', {ident: taskId});
        //发送请求到
//        args.taskId && httpReq.httpRequest({
//            uuid: taskId,
//            finishTime: date.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
//        });
        console.log(date.format(new Date(), 'yyyy-MM-dd') + ', complete: ' + taskId);
    });
}();