const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'iguanachart.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'eval',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};
