const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // Support for TS/JS files
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/, // Transform TS/TSX files using babel-loader
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/, // Transform JS/JSX files using babel-loader
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
        exclude: /node_modules/,
      },
      // Handle CSS imports (including Bootstrap CSS)
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Use css-loader and style-loader
      },
    ],
  },
  devtool: 'inline-source-map', // Enable source maps for debugging
  stats: 'minimal', // Reduce verbosity of Webpack logs
};
