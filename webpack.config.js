module.exports = {
  mode: "production",
  entry: [
    "babel-polyfill",
    "./src/index.js"
  ],
  output: {
    library: 'Qrcode',
    libraryTarget: 'umd',
    path: __dirname + '/dist/',
    publicPath: "/dist/",
    filename: 'qrcode-login.js'
  },
  module: {
    rules: [
      // {
      //   test: /\.jsx?$/,
      //   exclude: /(node_modules|bower_components)/,
      //   loader: 'babel-loader', // 'babel-loader' is also a legal name to reference
      //   query: {
      //     presets: ['@babel/preset-env']
      //   }
      // }
    ]
  }
};
