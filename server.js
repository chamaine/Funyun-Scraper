// var axios = require("axios");
var request = require("request")
var cheerio = require("cheerio");
var logger = require("morgan");
var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from the onion's entertainment section:" +
            "\n***********************************\n");

// // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
// request("https://entertainment.theonion.com/", function(error, response, html) {

//   // Load the HTML into cheerio and save it to a variable
//   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//   var $ = cheerio.load(html);
  
  // Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/Funyun-Scraper", {
  useMongoClient: true
});

// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  
  // First, we grab the body of the html with request
  request("https://entertainment.theonion.com/", function(error, response, html) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
  var $ = cheerio.load(html);

// Now, we grab every h2 within an article tag, and do the following:
    $("article.postlist__item ").each(function(i, element) {
      // Save an empty result object
      var result = {};

   // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("header h1 a")
        .attr("href");
      result.summary = $(this)
        .children(".entry-summary")
        .text();

// Create a new Article using the `result` object built from scraping

      db.Article
        .create(result)        
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
  })
  res.redirect("/articles");
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles", function(req, res) {
  db.Article
    .find({})
    .then(function(stuff){console.log("===========more things========",stuff)} )
    .catch(function(err) {res.json(err)});

})
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT)

  // var articles = $("article.postlist__item ");
  // // An empty array to save the data that we'll scrape
  // var results = [];

  // articles.each(function () {
  //   var article = $(this);
  //   var header = article.find('header').text();
  //   var link = article.find('header h1 a').attr('href');
  //   var summary = article.find('.entry-summary').text();
  //   results.push({
  //     headline: header,
  //     url: link,
  //     summary: summary,
  //   });
  // });

  // results = results.filter(function (article) {
  //   if (article.summary.length === 0) {
  //     return false;
  //   }
  //   return true;
  // });

  // console.log(results)

