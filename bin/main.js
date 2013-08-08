void function(){
    var httpServer = require('httpServer').create(),
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
        var mapList = args.mapList,
            codeList = args.codeList;
        
        clearTimeout(timer);
        timer = setTimeout(function(){
            var array = codeList.list();
            array.forEach(function(item){
                if(item.getCodeId() === 'codeId_0'){
                    console.log(item.getExecuteMapping());
                }
            });
            
        }, 1000);
    });
}();