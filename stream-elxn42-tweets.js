var env = require("./config/twitter");
var Twitter = require("node-tweet-stream"),
  MongoClient = require('mongodb').MongoClient;


var elxn42;

var t = new Twitter({
  consumer_key: env.consumer_key,
  consumer_secret: env.consumer_secret,
  token: env.token,
  token_secret: env.token_secret
});

MongoClient.connect("mongodb://192.168.59.103:27069/elxn42", function(err, db) {
    elxn42 = db.collection("elxn42");
    console.log("Connecting to Local Mixpanel Db");
});

t.on('tweet', function (tweet) {
  console.log('tweet received', tweet);
  insertTweetToDb(tweet);
});
 
t.on('error', function (err) {
  console.log('Oh no');
})
 
t.track('elxn42');

function insertTweetToDb(tweet){
	elxn42
		.insert(tweet, function(err, result){
			if (!err) console.log("Tweet inserted!");
		});
}
