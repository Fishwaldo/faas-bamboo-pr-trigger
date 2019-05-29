"use strict"

const http = require('http');
var fs = require('fs');

module.exports = (event, context) => {
    let err;
    
//    if (event.headers["api-key"] !== 'abc123') {
//      context
//          .status(403)
//          .fail("Unauthorized: missing or invalid api-key.");
//      return;
//    }
//console.log(event.body);

//    var body = JSON.parse(event.body);
    var body = event.body;
     
    /************* Process PR events *************/
console.log("Headers:")
console.log(event.headers);
console.log("Event Type" + event.headers["x-github-event"]);
console.log("Action " + body.action);
    if (event.headers["x-github-event"] === "pull_request"
        && (body.action === "opened" || body.action === "reopened" || body.action === "synchronize" )) {
 
        var pr = body.number;
        var user = fs.readFileSync('/var/openfaas/secrets/bamboo-username', 'utf8');
        var password = fs.readFileSync('/var/openfaas/secrets/bamboo-password', 'utf8');
        var options = {
            method: 'put',
            host: 'bamboo.my-ho.st',
            path: '/bamboo/rest/api/latest/plan/OZW-PRTST/branch/' + pr + '.json?vcsBranch=refs/pull/' + pr + '/head',
            auth: user + ':' + password,
            options: {
                'vscBranch': 'refs/heads/' + pr + '/head',
                'os_authType': 'basic'
            }
        };
 
        var req = http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        // write data to request body
        req.write('data\n');
        req.write('data\n');
        req.end(); 
//        var req = http.request(options, (response) => {
//            response.on('data', (chunk) => {
//                context
//                    .status(response.statusCode)
//                    .succeed(JSON.parse(chunk.toString()))
//                    return
//            });
//        });
//        req.on('error', (e) => { context.status(500).succed(e); });
//        req.end();
    }
 
    context
        .status(200)
        .succeed("All Done Master!");
}
