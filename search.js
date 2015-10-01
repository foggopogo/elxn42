/*
 * Pillars: Environment, Economy, Cultural, Bureaucracy, International Issues
 */

var env         = require('./config/env'),
    MongoClient = require('mongodb').MongoClient,
    https       = require('https'),
    _           = require('lodash'),
    async       = require('async'),
    schedule    = require('node-schedule'),
    pillars     = require('./data/pillar');

var options = {
    hostname: 'api.twitter.com',
    headers: {
        Authorization: 'Bearer ' + env.bearer_token
    }
};

var subPillarMaxIds = {};
var elxn42;
var SEARCH_URL = '/1.1/search/tweets.json?count=100&';

var SUBPILLAR = 0;
var SUBPILLAR_QUERY = 1;

var twitterQueue = async.queue(function(task, callback){
     getTweetsAndInsert(task.query, callback); 
}, 1);

async
    .waterfall([
        connectToDB,
        assignCollections,
        startScheduler],
        function(err, result){
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
    // schedule.scheduleJob('15 * * * *', addToQueue);
    addToQueue();
}

function addToQueue(){
    // TODO: Add function to ask Twitter how many requests we have left (as a check)
    var maxRequests = 400;
    var numberOfRequests = 0;
    for (var i = 1; i <= maxRequests; i++){ 
        twitterQueue.push({ query: pillars[i % 1]}, function(err){
            if (err) throw err;
        });
    }
}

// TwitterQueue
function getTweetsAndInsert(query, callback){
    var SEARCH_QUERY = SEARCH_URL + query[SUBPILLAR_QUERY];
    var sub_pillar = query[SUBPILLAR];
    var maxId = subPillarMaxIds[sub_pillar];
    options.path = (maxId == undefined) ? SEARCH_QUERY : SEARCH_QUERY + '&max_id=' + maxId;
    console.log(sub_pillar);
    
    https.get(options, function (result) {
        var buffer = '';
        result.setEncoding('utf8');
        result.on('data', function (data) {
            buffer += data;
        });
        result.on('end', function () {
            var tweets = JSON.parse(buffer).statuses;
            if (tweets.length == 1 || tweets.length == 0){
                console.log("Shit query pal " + tweets.length);
                return callback(null);
            }
            insertTweets(sub_pillar, modifyTweets(tweets, sub_pillar), callback);
        });
    });
}

function insertTweets(subpillar, tweets, callback){
    elxn42.insertMany(tweets, function(err, result){
        if (!err) console.log(tweets.length + " tweets inserted");
        var numberOfTweets = tweets.length;
        subPillarMaxIds[subpillar] = tweets[numberOfTweets - 1]['id_str'];
        callback(err);
    });
}

function modifyTweets(tweets, sub_pillar){
    tweets = _.map(tweets, function(tweet) {
        // TODO: Trim tweets to what we want to keep
        tweet.sub_pillar = sub_pillar;
        delete tweet.user
        delete tweet.retweeted_status;
        delete tweet.source;
        return tweet;
    });   
    return tweets; 
}

twitterQueue.drain = function(){
    console.log("Twitter queue is empty");
}