const path = require('path');
const {name} = require(path.resolve('./package.json'));

module.exports = () => name;
