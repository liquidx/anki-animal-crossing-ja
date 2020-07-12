
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',  
  entry: { 
    index: ['./src/index.js', './src/index.scss']
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    publicPath: '/'
  },

  devServer: {
    contentBase: './public'
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Index',
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['index']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })  
  ],
  module: {
    rules:[
      {
        test:  /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader'},
          { loader: 'postcss-loader'},
          {
            loader: 'sass-loader',
            options: {implementation: require('node-sass')}
          }
        ]
      }
    ]
  }
};