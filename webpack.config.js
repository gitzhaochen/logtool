/**
 * Created by hc on 2017/6/16.
 */
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
module.exports = {
    devtool: 'eval-source-map',//配置生成Source Maps，选择合适的选项
    entry:  __dirname + "/app/scripts/main.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/build",//打包后的文件存放的地方
        filename: "[name]-[hash].js"//打包后输出文件的文件名
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',//在webpack的module部分的loaders里进行配置即可
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'//添加对样式表的处理
            }
        ]
    },
    // devServer: {
    //     contentBase: "./public",
    //     port:8889,
    //     //colors: true,
    //     historyApiFallback: true,
    //     inline: true
    // },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname + "/app/index.html",
            inject: true,
            // hash:true,
            minify:{    //压缩HTML文件
                removeComments:true,    //移除HTML中的注释
                collapseWhitespace:true    //删除空白符与换行符
            }
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
}