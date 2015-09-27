var env         = require('./config/env'),
    MongoClient = require('mongodb').MongoClient,
    https       = require('https');
    _           = require('lodash');

var options = {
    hostname: 'api.twitter.com',
    path: '/1.1/search/tweets.json?q=elxn42',
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

        _.forEach(tweets.statuses, function(tweet) {
            // TODO: Trim tweets to what we want to keep
            delete tweet.user
            delete tweet.retweeted_status
            delete tweet.source
        })

        MongoClient.connect(env.mongo_url, function(err, db) {
          insertTweets(db, tweets.statuses, function() {
            db.close();
          });
        });

    });
});

function insertTweets(db, tweets, callback){
    var elxn42 = db.collection('elxn42');

    elxn42.insertMany(tweets, function(err, result){
        if (!err) {
            console.log("15 tweets inserted");
            callback(result);
        }
    });
}
