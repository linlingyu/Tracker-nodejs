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
    
    function getExecuteCount(mapping, start, end){
        var count = {},
            item;
        for(var i = start; i <= end; i++){
            item = mapping[i];
            if(!item){continue;}
            count[i] = 1;
            for(j in item){
                count[j] = 1;
            }
        }
        return Object.keys(count).length;
    }
    
    function getFnList(codeArray, codeList, fnList){
        var ret = [],
            code, fn, fnInst, mapping;
        codeArray.forEach(function(item, index){
            code = codeList.get(item.codeId);
            mapping = code.getArrivalMapping();
            item.fnList = [];
            code.getFnList().forEach(function(fnId, index){
                fn = fnList.get(fnId);
                item.fnList.push(fn);
                ret.push(fn);
                fn.executeCount = getExecuteCount(mapping, fn.loc.start, fn.loc.end);
                fn.totalLineNumber = fn.loc.end - fn.loc.start + 1;
                fn.coverRatio = Math.round(fn.executeCount / fn.totalLineNumber * 100);
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
            JSON.stringify({tracker: refeList}, null, 4), 'utf-8');
        socket.emit('finish', {ident: taskId});
        //发送请求到
//        args.taskId && httpReq.httpRequest({
//            uuid: taskId,
//            detail: refeList
//        });
        console.log(date.format(new Date(), 'yyyy-MM-dd') + ', complete: ' + taskId);
    });
}();