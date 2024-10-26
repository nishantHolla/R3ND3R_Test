//@ts-check

'use strict';

const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // 'none' leaves the code unminified, ideal for development

  entry: './src/extension.ts', // the entry point of the extension
  output: {
    // the bundle is stored in the 'out' folder (consistent with package.json main setting)
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2' // for VS Code compatibility
  },
  externals: {
    vscode: 'commonjs vscode' // VS Code modules need to be external
  },
  resolve: {
    // support reading TypeScript, JavaScript, and JSX files
    extensions: ['.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.jsx?$/, // process .jsx files with Babel
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Transpile modern JS
              '@babel/preset-react' // Transpile JSX
            ]
          }
        }
      }
    ]
  },
  devtool: 'source-map', // for easier debugging with source maps
  infrastructureLogging: {
    level: 'log', // enables logging required for problem matchers
  }
};

module.exports = [extensionConfig];
