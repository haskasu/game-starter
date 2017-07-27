'use strict';

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

class WebpackConfig {

    constructor(env) {
        this.env = env;
        this.output_filename = '[name].bundle.js';

        this.rules = [
            {
                enforce: 'pre',
                test: /\.jsx?$/,
                loader: 'source-map-loader',
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ];

        this.plugins = [
            new HtmlWebpackPlugin({
                template: 'src/index.' + this.env + '.ejs',
                filename: 'index.html',
                inject: this.env != 'systemjs'
            }),
            new CopyWebpackPlugin([
                { from: 'assets', to: 'assets' }
            ], {ignore: ['js/starter/**', 'js/plugins/**', 'js/compiled/**']}),
            new CopyWebpackPlugin([
                { from: 'assets/js/plugins/lf_core.js.mem', to: 'assets/js/plugins' }
            ])
        ];
    }

    exportConfig() {
        return {
            entry: './src/app.ts',
            output: {
                path: path.resolve(__dirname, '../output/' + this.env),
                filename: this.output_filename
            },
            resolve: {
                extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html']
            },
            module: {
                rules: this.rules
            },
            plugins: this.plugins,
            devServer: {
                contentBase: path.resolve(__dirname, '../output/' + this.env),
                port: 3333,
                historyApiFallback: true,
                inline: true,
                open: true
            },
            devtool: 'source-map'
        };
    }
}

module.exports = WebpackConfig;