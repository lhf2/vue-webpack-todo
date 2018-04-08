const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack');
//判断是什么环境
const isDev = process.env.NODE_ENV === 'development'

const config = {
    target:'web',//目标平台
    entry:path.join(__dirname,'src/index.js'),//入口文件
    output:{
        filename:"bundle.[hash:8].js",//输出名称
        path:path.join(__dirname,'dist')//输出目录
    },
    //处理文件的loader
    module:{
        rules:[
            {
                test: /\.vue$/,
                loader:'vue-loader'
            },
            {
                test:/\.jsx$/,
                loader:'babel-loader'
            },
            {
                test: /\.css$/,
                use:[
                    'style-loader',
                    'css-loader',
                    {
                        loader:'postcss-loader',
                        options:{
                            sourceMap:true,
                        }
                    }
                ]
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use:[
                    {
                        loader:'url-loader',
                        //配置url-loader的可选项
                        options:{
                            //限制图片大小2000B(2000000) 小于限制会将图片转换为base64格式写到代码里面 减少服务器压力 1M = 1024KB 1KB =1024字节 一般用10k 数值是100000 因为vue限制为10k
                            limit:1024,
                            //超出限制，创建的文件格式
                            //bulid/images/[图片名].[hash].[图片格式]
                            name:'[name]-aaa.[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins:[
        //存一个变量区分
        new webpack.DefinePlugin({
            "process.env":{
                NODE_ENV:isDev?'"development"':'"production"'
            }
        }),
        new htmlWebpackPlugin()
    ]
}

//判断环境是开发还是正式环境
if(isDev){
    //处理stylus文件 开发环境
    config.module.rules.push({
        test: /\.styl/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                }
            },
            'stylus-loader'
        ]
    })
    //启动服务
    config.devServer = {
        port:'8000',
        host:'0.0.0.0',//可以在本机内网IP访问 手机调试 访问的时候可以输入localhost:8080
        overlay:{
            error:true,//有任何错误显示在网页中
        },
        //open:true,//自动打开浏览器
        hot:true,//热加载
    }

    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),//如果不加载这个插件 就在package.json里设置hmr命令为webpack-dev-server --hot也可以
        new webpack.NoEmitOnErrorsPlugin(),//减少不需要的信息展示
        //方便调试
        new webpack.LoaderOptionsPlugin({
            options:{
                devTool:'#cheap-module-eval-source-map'
            }
        })
    )
}else{
    //正式环境
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue']
    }
    config.output.filename = '[name].[chunkhash:8].js'

    //分离css js 文件
    config.module.rules.push(
        {
            test: /\.styl/,
            use: ExtractPlugin.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    'stylus-loader'
                ]
            })
        }
    )

    //分离内库代码
    config.optimization={
        splitChunks: {
            minSize: 1,
            chunks: "initial",
            name:"vendor"
        }
    },
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css')
        /*new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        })*/
    )

}

module.exports = config;