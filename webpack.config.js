const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    content: './src/content.tsx',
    background: './src/background.ts',
    popup: './src/popup.tsx',
    utils: './src/utils.ts',
    panelTemplate: './src/panelTemplate.js',
    panelManager: './src/panelManager.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimization: {
    splitChunks: false,
    usedExports: true,
    // minimize: true,
  },
}; 