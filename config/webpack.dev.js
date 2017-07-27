'use strict';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackConfig = require('./webpack.common.js');

let config = new WebpackConfig('dev');

config.plugins.push(
    new CopyWebpackPlugin([
        { from: 'assets/js/plugins', to: 'assets/js/plugins' }
    ]),
);

module.exports = config.exportConfig();
