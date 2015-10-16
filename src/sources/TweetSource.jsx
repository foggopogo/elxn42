let env = require("../config/env");
let TweetActions = require("../actions/TweetActions");
let axios = require("axios");

const TweetSource = {
  fetchCounts: {
    remote(state) {
      return axios.get(`${env.apiHost}/count`).then((res) => res.data);
    },

    // here we setup some actions to handle our response
    success: TweetActions.updateCounts, 
    error: TweetActions.countsFailed,

    shouldFetch(state) {
      return true
    }
  }
};

module.exports = TweetSource;
