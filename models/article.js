/*
 *  Defines the model for Articles database.  Note that it refers to Note model
 *  Also has a boolean to indicate whether or not this Article is part of the saved set
 */ 

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// `title` is required and of type String
var ArticleSchema = new Schema({
	title: String,
	url: String,
	summary: String,
	saved: {
		type: Boolean,
		default: false
	},
	notes: [
	    {
	      // Store ObjectIds in the array
	      type: Schema.Types.ObjectId,
	      // The ObjectIds will refer to the ids in the Note model
	      ref: "Note"
	    }
  	] // array of user Notes
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;