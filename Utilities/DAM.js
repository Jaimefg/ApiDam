var request = require('../ServerRequest/Request'),
    globals = require('../Data/globals.json'),
    config = require('../Data/config.json'),
    fs = require('fs'),
    _ = require("underscore");

//Base de datos Mongo
var db = require('../Database/dbUtils');



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
            db.insert({ error: error.statusCode, id : id, url: error.url}, db.Collections.FAILED_CONTENT_GROUPS);
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
            db.insert({ error: error.statusCode, url: error.url}, db.Collections.FAILED_CONTENT_GROUPS);
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

    items.map(function(item) {

        global.contentLogger += 1;

        var ContentGroup = {}

        ContentGroup.title = item.localizableTitles[0].title_long;
        ContentGroup.main_category = getMainCategory(item);
        ContentGroup.internal_id = item.id;
        ContentGroup.external_id = item.uri_id;
        ContentGroup.series_id = (item._links && item._links["carbyne:series"] ? item._links["carbyne:series"].href.split("/").last() : "");
        ContentGroup.season_id = (item._links && item._links["carbyne:season"] && item.type != "Series" ? item._links["carbyne:season"].href.split("/").last() : "");
        ContentGroup.type = item.type;
        ContentGroup.created_at = item.created_at;
        ContentGroup.updated_at = item.updated_at;


        if(stdOut){
            console.log(ContentGroup.attrToString());
            db.insert(ContentGroup, db.Collections.CONTENT_GROUPS);
        }
        else
            fs.appendFile('C:/Users/jfradera/Desktop/Report Files/Test.txt', ContentGroup.attrToString(), 'utf8', (err) => {
                if(err != null)
                    console.log("Error en el fichero: " + err);
            });

    });

}

var loadChildren = function(item, callback){

    //TODO: Hay que hacer esta funcion recursiva
    self = this.loadChildren;

    var childrenIds = getChildrenIds(item);

    _.map(childrenIds, function(id) {
        loadById(id, function (result) {
            if(result != ""){
                var objRes = JSON.parse(result);

                //Si el contenido no es un episodio se vuelven a buscar los descendientes
                if(objRes.type != config.API.CG_TYPES.EPISODE)
                    self.call(undefined, objRes,callback);

                //El callback se llamara por cada uno de los contenidos
                callback(result);
            }
        });
    });
}

var retryErrors = function() {
    db.find({}, db.Collections.FAILED_CONTENT_GROUPS, function(failedItems){
        _.map(failedItems, function(item){
            //Cargamos el contenido fallado
            loadById(item.id, function(result){
                if(result != ""){

                    var itemToRemove = JSON.parse(result);

                    printItem(itemToRemove.toArray(), true);

                    //Eliminamos los contenidos de la lista de errores
                    _.map(itemToRemove.toArray(), function(item) {
                        db.remove({ id : item.id}, db.Collections.FAILED_CONTENT_GROUPS);
                    });
                }

                /*//Cargamos sus hijos
                loadChildren(result, function(result){
                    if(result != null){
                        printItem(result,true);
                        //Si es una temporada cargamos los hijos otra vez
                        if(result[0].type == "Season"){
                            loadChildren(result, function(result){
                                if(result != null){
                                    printItem(result, true);
                                }
                            });
                        }
                    }
                });*/
            })
        })
    })
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
    retryErrors : retryErrors,
    printItem : printItem,
    loadChildren : loadChildren
}
