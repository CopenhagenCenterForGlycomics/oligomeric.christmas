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
    static: path.join(__dirname,'www'),
    compress: true,
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all'
  },
  resolve: {
    alias: {
      // tinsel-glycan.js's music module expects a single shared Tone.js
      // instance (see js/oligomerry.js's play-button handler) - without
      // this, its own nested node_modules/tone and ours would resolve
      // to two separate bundled copies.
      tone$: path.resolve(__dirname,'node_modules/tone'),
    },
  },
  module: {
    rules: [
    {
      test: /sugars\.svg$/,
      use: 'raw-loader'
    },
    {
      // Already a built UMD bundle - transpiling it again is wasted
      // work for ~100KB of code that never needs to run through babel.
      test: /\.js$/,
      exclude: [
          /logic-solver/,
          /node_modules\/tone\//,
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
