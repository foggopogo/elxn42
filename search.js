var env         = require('./config/env'),
    MongoClient = require('mongodb').MongoClient,
    https       = require('https'),
    _           = require('lodash'),
    async       = require('async'),
    cron        = require('node-schedule'),
    pillars     = require('./data/pillar');

var options = {
    hostname: 'api.twitter.com',
    headers: {
        Authorization: 'Bearer ' + env.bearer_token
    }
};

var elxn42;
var SEARCH_URL = '/1.1/search/tweets.json?';

/*
 * - Query Twitter to find out how many requests are left
 * x Create a priorityQueue
 * x Add cron job for every 15 min 
 * - Use max_id to get the latests tweets
 * - 
 */

var twitterQueue = async.queue(function(query, maxId, callback){
     getTweetsAndInsert(query, maxId, callback); 
}, 2);

async
    .waterfall([
        connectToDB,
        assignCollections,
        startScheduler],
        function(err, maxid){
            if (err) throw err;
            console.log("DONE!");

        });

function connectToDB(callback){
    MongoClient.connect(env.local_mongo_url, callback);
}

function assignCollections(db, callback){
    elxn42 = db.collection('elxn42');
    callback(null, 0);
}

function startScheduler(callback){
    schedule.scheduleJob('15 * * * *', addToQueue);
}

function addToQueue(){
    // TODO: Add function to ask Twitter how many requests we have left (as a check)
    var numberOfRequests = 400;
    // TODO: Iterate over pillars 'numberOfRequests' times and add to queue
}

// TwitterQueue
function getTweetsAndInsert(query, maxId, callback){
    var SEARCH_QUERY = SEARCH_URL + query;
    options.path = (maxId == 0) ? SEARCH_QUERY : SEARCH_QUERY + '&max_id=' + maxId;
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
            });

            insertTweets(tweets.statuses, callback);
        });
    });
}

function insertTweets(tweets, callback){
    elxn42.insertMany(tweets, function(err, result){
        if (!err) console.log("15 tweets inserted");
        callback(err, tweets[99]['id']);
    });
}

twitterQueue.drain = function(){
    console.log("Twitter queue is empty");
}