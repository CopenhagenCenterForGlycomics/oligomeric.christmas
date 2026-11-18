'use strict'
const path = require('path')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
  },
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js'
  },
  optimization: {
    moduleIds: 'deterministic', // keep module ids stable when vendor modules does not change
    concatenateModules: true, // enable scope hoisting
    runtimeChunk: 'single', // enable "runtime" chunk
    splitChunks: {
      cacheGroups: {
        // 'initial', not 'all' - Tone.js only ever gets reached via the
        // play button's dynamic import() (see js/oligomerry.js), and
        // 'all' would merge it straight into this eagerly-loaded
        // bundle, shipping ~340KB extra to every visitor whether or
        // not they ever press play.
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial'
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
      }),
    ],
  },
  plugins: [
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'www/index.html',
      inject: true,
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    // copy custom static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'www'),
          to: '',
          globOptions: {
            ignore: ['**/.*', '**/index.html']
          }
        }
      ]
    })
  ]
})

const CompressionWebpackPlugin = require('compression-webpack-plugin')

webpackConfig.plugins.push(
  new CompressionWebpackPlugin({
    filename: '[path][base].gz',
    algorithm: 'gzip',
    test: new RegExp(
      '\\.(' +
      'js' +
      ')$'
    ),
    threshold: 1024,
    minRatio: 0.8
  })
)

module.exports = webpackConfig
