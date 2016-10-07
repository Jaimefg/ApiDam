/**
 * Created by jfradera on 07/10/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ContentGroupSchema = new Schema({
    _id: { type: ObjectId },
    title: { type: String },
    maing_category: { type: String },
    internal_id: { type: String },
    external_id: { type: String },
    series_id: { type: String },
    season_id: { type: String },
    type: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});


ContentGroupSchema.virtual('cgToStr').get(function () {
   return this.title + "|" +
       this.maing_category + "|" +
       this.internal_id + "|"+
       this.external_id + "|"+
       this.series_id + "|"+
       this.season_id + "|"+
       this.type + "|"+
       this.created_at.toISOString() + "|"+
       this.updated_at.toISOString() + "\n";
});

module.exports = mongoose.model('ContentGroup', ContentGroupSchema);

