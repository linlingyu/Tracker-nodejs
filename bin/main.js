void function(){
    var fs = require('fs'),
        httpServer = require('httpServer').create(),
        httpProxy = require('httpProxy').create(httpServer);
        socketServer = require('socketServer').create(),
        socketProxy = require('socketProxy').create(socketServer),
        codeController = require('CodeController').create();
        
    httpProxy.initialize(codeController);
    socketProxy.initialize(codeController);
    httpProxy.start();
    socketProxy.start(httpProxy.getServer());
    
    var timer;
    socketProxy.on('send:arrival', function(args){
        var socket = args.socket,
            mapList = args.mapList,
            codeList = args.codeList;
        
        clearTimeout(timer);
        timer = setTimeout(function(){
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
                });
            });
            mapList.clear();
            !refe && (refe = {refererId: null});
            fs.writeFileSync('D:/Program Files/workspace/BAIDU_TANGRAM/web/tracker-ret/data/tracker-data-'+ refe.refererId +'.js',
                'tracker = tracker.concat(' + JSON.stringify(ret, null, 4) + ');',
                'utf-8');
            refe.refererId && socket.emit('finish', {ident: refe.refererId});
            console.log('complete: ' + refe.refererId);
        }, 4000);
    });
}();