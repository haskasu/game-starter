if (window.opener) {

    let convertJsStackToTs = function(stack) {
        stack = stack.trim();
        var httpStart = stack.indexOf("http");
        if (httpStart == -1)
            return stack;
        var httpEnd = stack.lastIndexOf(".ts!transpiled");
        if (httpEnd == -1)
            return stack;
        var filename = stack.substring(httpStart, httpEnd + 3);
        var posStart = stack.indexOf(":", httpEnd) + 1;
        var posEnd = stack.indexOf(")", posStart);
        var posStr = stack.substring(posStart, posEnd);
        var pos = posStr.split(":");
        var smc = new sourceMap.SourceMapConsumer(transpiled_scripts[filename].load.sourceMap);
        var pos = smc.originalPositionFor({ line: parseInt(pos[0]), column: parseInt(pos[1]) });
        stack = stack.replace(posStr, "" + pos.line + ":" + pos.column).replace('.ts!transpiled:', '.ts @ ');

        var srcStart = stack.indexOf('src/');
        var srcPrefix = stack.substring(httpStart, srcStart + 4);
        stack = stack.replace(srcPrefix, '');

        return stack;
    }

    let systemLog = console.log;
    console.log = function (text) {
        systemLog(text);
        window.opener.postMessage({ type: "log", text: text }, '*');
    };

    window.onerror = function (msg, src, line, col, err) {
        if (src.indexOf('.ts!transpiled') != -1) {
            var stacks = err.stack.split("\n");
            for (var i in stacks) {
                stacks[i] = convertJsStackToTs(stacks[i]);
            }
            err.stack = stacks.join("\n");
        }
        console.log(err);
    }
}

var _system_fetch = fetch;
var src_url_map = src_url_map || {};
fetch = function(url, opt) {
    if(src_url_map[url]) {
        url = src_url_map[url];
    } else if(src_url_map[url+'.ts']) {
        url = src_url_map[url+'.ts'];
    }
    return _system_fetch(url, opt);
}