'use strict';

const WebpackConfig = require('./webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = new WebpackConfig('systemjs');

config.plugins.push(
    new CopyWebpackPlugin([
        { from: 'assets/js/plugins/pixi.min.js', to: 'assets/js' },
        { from: 'assets/js/compiled/plugins.min.js', to: 'assets/js' },
        { from: 'assets/js/compiled/boot.systemjs.min.js', to: 'assets/js' },
        { from: 'src', to: 'src' },
        { from: 'node_modules/systemjs/dist/system.js', to: 'static/js' },
        { from: 'node_modules/systemjs/dist/system.src.js', to: 'static/js' },
        { from: 'node_modules/typescript/lib/typescript.js', to: 'static/js/typescript' },
        { from: 'node_modules/plugin-typescript/lib/plugin.js', to: 'static/js/ts' },
        { from: 'tsconfig.json', to: '' }
    ])
);

module.exports = config.exportConfig();
