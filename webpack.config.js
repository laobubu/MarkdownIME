const path = require('path');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'MarkdownIME.js',
    library: "MarkdownIME",
    libraryTarget: "umd",
  }
};
