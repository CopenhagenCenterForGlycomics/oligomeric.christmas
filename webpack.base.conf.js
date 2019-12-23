const path = require('path');

module.exports = {
  entry: {
    'oligomerry': [ './js/oligomerry.js' ],
  },
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: '[name]-bundle.js',
    path: __dirname + '/dist'
  },
  devServer: {
    contentBase: path.join(__dirname,'www'),
    compress: true,
    host: '0.0.0.0',
    port: 8080
  },
  resolve: {
    alias: {
    },
  },
  module: {
    rules: [
    {
      test: /sugars\.svg$/,
      use: 'raw-loader'
    },
    {
      test: /\.js$/,
      exclude: [
          /logic-solver/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              modules: false,
              corejs: 'core-js@2',
              useBuiltIns: 'entry',
              targets: {
                browsers: [
                  'Chrome >= 60',
                  'Safari >= 10.1',
                  'iOS >= 10.3',
                  'Firefox >= 54',
                  'Edge >= 15',
                ],
              },
            }],
          ],
        },
      },
    }],
  },
  plugins: [
  ],
};