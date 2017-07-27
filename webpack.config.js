let env = process.env.NODE_ENV || "dev";
env = env.trim();

console.log("env = " + env);

switch (env) {
    case 'prod':
    case 'production':
        module.exports = require('./config/webpack.prod');
        break;
    case 'test':
    case 'testing':
        module.exports = require('./config/webpack.test');
        break;
    case 'dev':
    case 'development':
    default:
        module.exports = require('./config/webpack.dev');
}
