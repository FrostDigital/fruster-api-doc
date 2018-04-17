const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const isProduction = process.env.NODE_ENV === "production";
const productionPluginDefine = [
    new webpack.DefinePlugin({ "process.env": { "NODE_ENV": JSON.stringify("production") } })
];
const clientLoaders = isProduction ? productionPluginDefine.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }, sourceMap: false })
]) : [];

const commonLoaders = [
    {
        test: /\.json$/,
        loader: "json-loader"
    }
];


module.exports = [
    {
        entry: ["babel-polyfill", "./src/server.js"],
        output: {
            path: "./dist",
            filename: "server.js",
            libraryTarget: "commonjs2",
            publicPath: "/"
        },
        target: "node",
        node: {
            console: false,
            global: false,
            process: false,
            Buffer: false,
            __filename: false,
            __dirname: false
        },
        externals: nodeExternals(),
        plugins: productionPluginDefine,
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: "babel"
                }
            ].concat(commonLoaders)
        }
    },
    {
        entry: ["babel-polyfill", "./src/app/client.js"],
        output: {
            path: "./dist/assets",
            publicPath: "/",
            filename: "client.js"
        },
        plugins: clientLoaders.concat([
            new ExtractTextPlugin("index.css")
        ]),
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel"
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract("css!sass")
                }
            ]
        },
        resolve: {
            extensions: ["", ".js", ".jsx"]
        }
    }
];
