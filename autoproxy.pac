function FindProxyForURL(url, host) {
    if (url.substring(0, 3) == 'ws:') return 'DIRECT';
    if (url.substring(0, 6) == 'https:') return 'DIRECT';
    if (url.indexOf('proxy=off') > -1) return 'DIRECT';
    if (/\/devtools\//.test(url)) return 'DIRECT';
    if (/\/socket\.io\//.test(url)) return 'DIRECT';
    if (/\/tracker\//.test(url)) return 'DIRECT';
    return 'PROXY cq01-sdc-ma01.vm.baidu.com:8085; PROXY 127.0.0.1:8085; DIRECT';
}