var env         = require("./config/twitter"),
    MongoClient = require('mongodb').MongoClient,
    https       = require('https');

var elxn42;

MongoClient.connect("mongodb://192.168.59.103:27069/elxn42", function(err, db) {
    elxn42 = db.collection("elxn42");
    console.log("Connecting to Local Mixpanel Db");
});

var options = {
    hostname: 'api.twitter.com',
    path: '/1.1/search/tweets.json?q=elxn42&src=typd',
    headers: {
        Authorization: 'Bearer ' + env.bearer_token
    }
};

https.get(options, function (result) {
    var buffer = '';
    result.setEncoding('utf8');
    result.on('data', function (data) {
        buffer += data;
    });
    result.on('end', function () {
        var tweets = JSON.parse(buffer);
        console.log(tweets.statuses.length); // the tweets!
    });
});

function insertTweetToDb(tweet){
  elxn42
    .insert(tweet, function(err, result){
      if (!err) console.log("Tweet inserted!");
    });
}
