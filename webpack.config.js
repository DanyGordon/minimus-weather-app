const nodeExternals = require('webpack-node-externals');

module.exports = {
  externalsPresets: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: ['aws-cdk', 'mock-aws-s3', 'nock', 'mongodb-client-encryption'], // in order to ignore all modules in node_modules folder
};