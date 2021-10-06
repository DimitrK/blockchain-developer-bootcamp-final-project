module.exports = (environment = process.env.NODE_ENV) => 'production' !== environment && 'staging' !== environment;
