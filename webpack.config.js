const path = require("path");

// webpack config file
module.exports = {
  mode: "development",
  entry: path.join(__dirname, "/client/src/app/cards.js"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "client/dist"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "/client/src/public"),
    },
    port: 3000,
  },
};
