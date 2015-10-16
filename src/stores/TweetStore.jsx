let alt = require("../alt");
let TweetActions = require("../actions/TweetActions");
let TweetSource = require("../sources/TweetSource");

class TweetStore {
  constructor () {
    this.counts = {};

    this.errorMessage = null;

    this.bindListeners({
      handleUpdate: TweetActions.updateCounts,
      handleFailed: TweetActions.countsFailed
    });

    this.registerAsync(TweetSource);
  }

  handleUpdate(counts) {
    this.counts = counts;
  }

  handleFailed(errorMessage) {
    this.errorMessage = errorMessage;
  }
}

module.exports = alt.createStore(TweetStore, "TweetStore");
