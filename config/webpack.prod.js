'use strict';

const WebpackConfig = require('./webpack.common');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = new WebpackConfig('prod');
config.output_filename = '[name].[hash].bundle.js';

config.plugins.push(
    new CopyWebpackPlugin([
        { from: 'assets/js/compiled/plugins.min.js', to: 'assets/js' },
        { from: 'assets/js/plugins/pixi.min.js', to: 'assets/js' }
    ]),
    new UglifyJsPlugin({
        sourceMap: true,
        beautify: false,
        output: {
            comments: false
        },
        mangle: {
            screw_ie8: true,
            keep_fnames: true // important, as we need to keep the origin constructor.name in ObjectBase.ts
        },
        compress: {
            screw_ie8: true,
            warnings: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            negate_iife: false // we need this for lazy v8
        },
    })
);


module.exports = config.exportConfig();
