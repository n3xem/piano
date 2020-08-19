module.exports = {
    entry: "./src/app.ts",

    output: {
        filename: "./assets/bundle.js"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader', options: { transpileOnly: true } }
        ]
    }
};