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
      directory: path.join(__dirname, "/client"),
    },
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
};
