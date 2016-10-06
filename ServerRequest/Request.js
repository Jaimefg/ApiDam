var request = require('requestretry'),
    globals = require('../Data/globals.json'),
    config = require('../Data/config.json');

module.exports = {
    
    get : function(url, callback) {
        request({
            method: 'GET', //URL to hit
            url: url,
            auth: {
                bearer: globals.TOKEN
            },
            maxAttemps: 10,
            retryStrategy: _myRetryStrategy,
            headers: _defaultOoyalaHeaders,
        }, function(error, response, body){
            if(error) {
                callback({
                    error: "Error",
                    statusCode : response.statusCode
                })
            } else {
                if(response.statusCode != 200){
                    console.log("Error: " + response.statusCode);
                    callback({
                        error: "Error",
                        statusCode : response.statusCode,
                        url : response.request.href
                    }, null);
                }
                else
                    callback(null, body);
            }
        });

    },
    post: function(url,body, callback){

        request({
            url: url, //URL to hit
            method: 'POST',
            headers: _defaultOoyalaHeaders(body),
            maxAttemps: 10,
            body: JSON.stringify(body) //Set the body as a string
        }, function(error, response, body){
            if(error) {
                callback({
                    error: "Error",
                    statusCode : response.statusCode
                })
            } else {
                if(response.statusCode != 200){
                    console.log("Error: " + response.statusCode);
                    callback({
                        error: "Error",
                        statusCode : response.statusCode,
                        url : response.request.href
                    }, null);
                }
                else
                    callback(null, body);
            }
        });
    }
}

/*********************
 * Elementos privados
 ********************/

var _myRetryStrategy = function (err, response, body){
    // retry the request if we had an error or if the response was a 'Bad Gateway'
    return err || response.statusCode != 200 || body == "";
};

var _defaultOoyalaHeaders = function (body) {

    var headers = {
        'Host':'mediaset.prod.carbyne.ps.ooyala.com',
        'Connection':'keep-alive',
        'Accept':'application/jsonm text/plain, */*',
        'Origin':'https://mediaset.prod.carbyne.ps.ooyala.com',
        'User-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
        'Referer':'https://mediaset.prod.carbyne.ps.ooyala.com/',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept-Language':'es-ES,es;q=0.8,en;q=0.6',
        'Content-Type': 'application/json;charset=UTF-8'
    }

    if(body != null)
        headers['Content-length'] = JSON.stringify(body).length;

    return headers
}
