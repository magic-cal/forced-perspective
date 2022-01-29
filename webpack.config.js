const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
  plugins: [
    // Re-generate index.html with injected script tag.
    // The injected script tag contains a src value of the
    // filename output defined above.
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, "/client/src/public/cards.html"),
    }),
  ],
};
