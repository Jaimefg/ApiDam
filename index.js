//Librerias propias
var config = require('./Data/config.json'),
    DAM = require('./Utilities/DAM'),
    db = require('./DataBase/DbUtils'),
    async = require('async'),
    utils = require('./Utilities/Utils');

//Librerias externas
var _ = require('underscore'),
    argv = require('minimist')(process.argv.slice(2));

var app = function () {
    //Añadimos funcionalidades a los objetos basicos que utilizaremos despues
    utils.extendUtils();

    if(argv.q != null){
        var filter = {
            type: argv.t || config.default_filter.type,
            q: argv.q != null ?  argv.q.split(" ").map(function(word) { return '"' + word + '"'}).join(" and ") : config.default_filter.q,
            orderBy: argv.o || config.default_filter.orderBy,
            limit: argv.l || config.default_filter.limit,
            order: config.default_filter.order //Mantenemos el orden descendente por defecto
        }

        DAM.login(function (result) {

            DAM.loadContentByType(filter, function(result){
                var content = JSON.parse(result);
                DAM.printItem(content._embedded.item, argv.p);

                if(argv.c){
                    _.map(content._embedded.item.toArray(), function(item) {
                        DAM.loadChildren(item, function(result) {
                            if (result != "") {
                                var items = JSON.parse(result);
                                DAM.printItem(items, argv.p);

                                //Cargamos otro nivel
                                _.map(items.toArray(), function(item) {
                                    DAM.loadChildren(item, function(result) {
                                        if (result != "") {
                                            var items = JSON.parse(result);

                                            DAM.printItem(items, argv.p);

                                        };
                                    });
                                })
                            };
                        });
                    });
                }
            });
        });

    }
    else if(argv.i != null){
        DAM.login(function (result) {
            DAM.loadById(argv.i, function(item){

                DAM.printItem(JSON.parse(item), argv.o);

                if(argv.c){
                    DAM.loadChildren(item, function(result) {
                        if (result != "") {
                            var items = JSON.parse(result);

                            DAM.printItem(items, argv.o);

                        };
                    });
                }
            })
        });
    }
    else if(argv.h != null){
        console.log(
            "\n\tOpciones: \n" +
            "\t -i: Internal ID del contenido\n" +
            "\t -t: Tipo del contenido (Series, Season, Episode)\n" +
            "\t -q: Query para buscar texto (debe contener todas las palabras)\n" +
            "\t -o: Ordena los elementos según creacion o actualización (createdAt, updatedAt) \n" +
            "\t -l: Límite de contenidos\n" +
            "\t -c: Se devolverán también los hijos de los contenidos encontrados\n" +
            "\t -p: Muestra los resultados por pantalla"
        );
    }


};

async.waterfall([
    app
],db.disconnect());
