var request = require('../ServerRequest/Request'),
    globals = require('../Data/globals.json'),
    config = require('../Data/config.json'),
    fs = require('fs'),
    dbUtils = require('../DataBase/DbUtils'),
    _ = require("underscore");


var login = function (callback) {

    self = this.login;
    var loginURL = config.API.BASE_URL + config.API.LOGIN;

    request.post(loginURL,config.credentials, function (error, body) {

        if(error == null){
            var data = JSON.parse(body);

            if(data != null){
                globals.TOKEN = JSON.parse(body).token;
                callback(globals.TOKEN);
            }
            else{
                Function.apply(self, callback);
            }
        }

    } );

}


var loadById = function(id, callback) {

    request.get(config.API.BASE_URL + config.API.CONTENT_GROUPS + "/" + id, function(error, result){
        if(error != null){
            console.log("URL: " + error.url + " Error " + error.statusCode);
        }
        else
            callback(result);
    });
}


var loadContentByType = function(params, callback){

    if(!params){
        params = config.default_filter;
    }else{
        params.limit = params.limit || config.default_filter.limit,
        params.type = params.type || config.default_filter.type,
        params.q = params.q || config.default_filter.q
    }

    request.get(config.API.BASE_URL + config.API.CONTENT_GROUPS + params.attrToQueryString(), function(error, result){
        if(error != null){
            console.log("URL: " + error.url + " Error " + error.statusCode);
        }
        else
            callback(result);
    });

}


var printItem = function(itemList, stdOut){

    var items = [];

    if(Array.isArray(itemList))
        items = itemList;
    else
        items.push(itemList);

    if(global.contentLogger % 20 == 0)
         console.log("Ficheros procesados: " + global.contentLogger);

    items.map(function(item) {

        global.contentLogger += 1;

        var contentGroup = dbUtils.models.contentGroup;

        var dbContentGroup = new contentGroup({
            title: item.localizableTitles[0].title_long,
            maing_category: getMainCategory(item),
            internal_id: item.id,
            external_id: item.uri_id,
            series_id: (item._links && item._links["carbyne:series"] ? item._links["carbyne:series"].href.split("/").last() : ""),
            season_id: (item._links && item._links["carbyne:season"] && item.type != "Series" ? item._links["carbyne:season"].href.split("/").last() : ""),
            type: item.type,
            created_at: item.created_at,
            updated_at: item.updated_at
        });

        if(stdOut)
            console.log(dbContentGroup.cgToStr);
        else
            fs.appendFile('C:/Users/jfradera/Desktop/Report Files/Test.txt', dbContentGroup.cgToStr, 'utf8', (err) => {
                if(err != null)
                    console.log("Error en el fichero: " + err);
            });

    });

}

var loadChildren = function(item, callback){
    var childrenIds = getChildrenIds(item);

    var children = _.map(childrenIds, function(id) {
        loadById(id, function (result) {
            if(result != "")
            //children.push(JSON.parse(result))
                callback(result);
        });
    });
}


//Elementos privados
var getMainCategory = function(item){
    var mainCategory = item.additional_metadata.find(function(item) { if(item.key == "categoria_principal") return item.value; })

    return  mainCategory ? mainCategory.value : "Sin definir";
}

var getChildrenIds = function(item){

    var childrenType = "";
    switch(item.type){
        case config.API.CG_TYPES.SERIES:
            childrenType = "season";
            break;
        case config.API.CG_TYPES.SEASON:
            childrenType = "episode";
            break;
        default:
            break
    }

    if(!item._links["carbyne:"+childrenType])
        return null;

    var childrenIds = _.map(item._links["carbyne:"+childrenType].toArray(), function(link) {
        if(link != null && link != "")
            return link.href.split('/').pop()}
    );

    return childrenIds;
}


//Exposicion del modulo
module.exports = {
    loadById : loadById,
    login : login,
    loadContentByType : loadContentByType,
    printItem : printItem,
    loadChildren : loadChildren
}
