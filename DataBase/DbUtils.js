/**
 * Created by jfradera on 07/10/2016.
 */
var mongoose = require('mongoose'),
    Models = require('../DataBase/DbUtils'),
    db = mongoose.connect("mongodb://localhost/ApiDAMdb");

//Modelos de DB
var contentGroup = require("./Models/ContentGroup")

module.exports.insert = function(item){
    item.save();
}

module.exports.disconnect = function(){
    console.log("Desconectando...");
    db.disconnect();
}

module.exports.models = {
    contentGroup : contentGroup
}

