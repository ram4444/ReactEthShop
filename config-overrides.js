const webpack = require("webpack")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = function override (config, env) {
    console.log('Using plug-in react-app-rewired to override webpack version > 5')
    let loaders = config.resolve
    loaders.fallback = {
        ...loaders.fallback,
        fs: false,
        tls: false,
        net: false,
        zlib: require.resolve("browserify-zlib") ,
        path: require.resolve("path-browserify"),
        util: require.resolve("util/"),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        console: require.resolve('console-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
    }
    loaders.extensions = [...loaders.extensions, ".ts", ".js"]
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"]
        })
    ]
    
    return config
}
