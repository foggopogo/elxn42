var env         = require('./config/env'),
    MongoClient = require('mongodb').MongoClient,
    https       = require('https');

var elxn42;

// Connection URL
MongoClient.connect(env.mongo_url, function(err, db) {
  elxn42 = db.collection("elxn42")
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
        console.log(tweets.statuses); // the tweets!

        // TODO: Trim tweets to what we want to keep

        // insertTweets(tweets)
        // db.close()
    });
});

function insertTweets(tweets){
  elxn42
    .insertMany(tweets, function(err, result){
      if (!err) console.log(tweets.length + " tweets inserted");
    });
}
