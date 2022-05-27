const MdApiUrl = 'http://10.40.192.210:9091/'
module.exports = {
  publicPath: '/',
  devServer: {
    port: 8080,
    proxy: {
      '/mdapi/': {
        target: MdApiUrl,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/mdapi/': '',
        },
      },
      '/esmanageapi/': {
        target: 'http://10.11.233.213:8000/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/esmanageapi/': '',
        },
      },
    },
  },
}
