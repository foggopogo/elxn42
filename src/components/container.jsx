require ("./container.scss");

let React = require("react");
let TweetStore = require("../stores/TweetStore")

let Container = React.createClass({
  displayName: "Container",

  getInitialState() {
    return {
      counts: {}
    };
  },

  componentDidMount() {
    TweetStore.fetchCounts();
    TweetStore.listen(this.onChange);
  },

  componentWillUnmount() {
    TweetStore.unlisten(this.onChange);
  },

  onChange(state) {
    this.setState(state);
  },
  
  render: function() {  
    if (this.state.errorMessage) {
      return (
        <div>Error fetching counts.</div>
      );
    }

    if (Object.keys(this.state.counts).length === 0) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      )
    }

    return (
      <ul>
        <li>{this.state.counts["Harper"]}</li>
        <li>{this.state.counts["Trudeau"]}</li>
        <li>{this.state.counts["Mulcair"]}</li>
      </ul>
    );
  }
});

module.exports = Container;
