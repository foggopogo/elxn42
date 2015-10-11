var Webpack = require("webpack");

var config = {
  entry: {
    app: [
      "./src/app.jsx"
    ]
  },
  devtool: "eval",
  output: {
    path: "./build",
    filename: "bundle.js"
  },
  resolve: {
    alias: {},
    extensions: ["", ".js", ".jsx"] // allow require without extension
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, loader: "babel" },
      { test: /\.scss$/, loader: "style!css!autoprefixer!sass" },
      { test: /\.(jpg|png)$/, loader: "url" },
      { test: /\.json$/, loader: "json" },
    ]
  }
};

module.exports = config;
