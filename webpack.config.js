module.exports = {
  entry: './src/index.ts',
  output: {
    filename: './dist/bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    loaders: [{ test: /\.tsx?$/, loader: 'awesome-typescript-loader' }],
    preLoaders: [{ test: /\.js$/, loader: 'source-map-loader' }],
  },
};
