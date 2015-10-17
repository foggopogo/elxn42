let alt = require("../alt");

class TweetActions {
  constructor() {
    this.generateActions(
      "updateCounts",
      "countsFailed"
    );
  }
}

module.exports = alt.createActions(TweetActions);
