var env         = require('./config/env'),
    MongoClient = require('mongodb').MongoClient,
    _           = require('lodash'),
    prompt      = require('prompt'),
    async       = require('async');

prompt.start();

var elxn42;
var leaders;

var partyLeaders = [
	'Mulcair',
	'Trudeau',
	'Harper',
	'May'];

MongoClient.connect(env.local_mongo_url, function(err, db){
    leaders = db.collection('leaders');
    elxn42 = db.collection('elxn42');  
    start();  
});

function start(){
    var leaders = [];
    for (var i = 0; i < 4; i++){
        leaders[i] = performAggregationAndContext(partyLeaders[i]);
    }

    async.waterfall(leaders, function(err, result){
        if (err) throw err;
        console.log("done");
    });
}

function performAggregationAndContext(leader){
    return function(callback){
        async.waterfall([
            performAggregation(leader),
            provideContext
            // prompt,
            ],
            callback);
    }
}

function performAggregation(leader){
    return function(callback){
    	var cursor = elxn42
                		.aggregate(
                			{ $match: { sub_pillar: leader }}, 
                			{ $group: { 
                				_id: "$text", 
                				retweet_count: { $first: "$retweet_count"}}},
                            { $project: tweet: "$_id", retweet_count: 1, _id: 0}
                            { $sort: { retweet_count: 1 }},
                            { $limit: 5 });
        callback(null, cursor);
    }
}

function provideContext(cursor, callback){
    cursor.forEach(function(tweet){
        callback(null, tweet);
    });
}

function prompt(tweet, callback){
    
}