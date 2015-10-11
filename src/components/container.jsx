require ("./container.scss");

let React = require("react");

let Container = React.createClass({
  displayName: "Container",
  
  render: function() {
    return (
      <div className="Container">
        <h1>HELLO WORLD</h1>
      </div>
    );
  }
});

module.exports = Container;
