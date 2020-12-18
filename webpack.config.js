const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'iguanachart.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  // devtool: 'eval',
  // plugins: [
  //   new webpack.ProvidePlugin({
      // $: window.$,
      // jQuery: window.jQuery,
      // 'window.$': window.$,
      // 'window.jQuery': 'jquery',
    // }),
  // ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      }
    ],
  }
};
