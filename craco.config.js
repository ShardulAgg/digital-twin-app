module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find ForkTsCheckerWebpackPlugin
      const ForkTsCheckerWebpackPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin'
      );
      
      if (ForkTsCheckerWebpackPlugin) {
        // Increase memory limit to 4096 MB
        ForkTsCheckerWebpackPlugin.options.memoryLimit = 4096;
      }
      
      // Ensure hot reloading is enabled
      webpackConfig.devServer = {
        ...webpackConfig.devServer,
        hot: true,
      };
      
      return webpackConfig;
    },
  },
  devServer: {
    hot: true,
    open: false,
  },
};