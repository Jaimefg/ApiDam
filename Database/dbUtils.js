/**
 * Created by jfradera on 11/10/2016.
 */
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/ApiDAMdb';


/***
 * Inserta en la base de datos la lista de documentos recibidos
 * @param items
 */
module.exports.insert = function(items, collection){
// Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        
        // Insert multiple documents
        db.collection(collection).insertMany(items.toArray(), function(err, r) {
            assert.equal(null, err);
            assert.notEqual(0, r.insertedCount);

            db.close();
        });

    });
};

module.exports.find = function(filter, collection, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        // Insert multiple documents
        db.collection(collection).find(filter).toArray(function(err, documents) {
            assert.equal(null, err);
            
            db.close();
            
            callback(documents.filter(function(item) {return item.id; }))
        });

    });
};

module.exports.remove = function(filter, collection) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Eliminando: " + filter)
        // Delete multiple documents
        db.collection(collection).deleteMany(filter, function(err, r) {
            assert.equal(null, err);

            db.close();
        });

    });
};


module.exports.Collections =  {
    CONTENT_GROUPS : "contentGroups",
    FAILED_CONTENT_GROUPS : "failedCgs"
}