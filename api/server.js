var express = require('express');
var async = require('async');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var env = require('./config/env');
var assert = require('assert');

var tweets;

app.get('/count', function (req, res) {
  
  MongoClient.connect(env.local_mongo_url, function(err, db) {
    assert.equal(null, err);
    tweets = db.collection('elxn42');

    var tweet_counts = {
      Harper: getSubPillarCount({ "sub_pillar": "Harper" }),
      Trudeau: getSubPillarCount({ "sub_pillar": "Trudeau" }),
      Mulcair: getSubPillarCount({ "sub_pillar": "Mulcair" })
    };

    async
      .parallel(
      tweet_counts,
      function(err, counts){
        if (err) throw err;
        console.log(counts);
        res.send(counts);
        db.close();
      });
  });
});

var server = app.listen(3000, function () {
  console.log("Server is running at localhost:3000")
});

function getSubPillarCount(query){
    return function(callback){
      tweets
        .find(query)
        .count(callback);
    }
}
