const withTM = require("next-transpile-modules")(["react-menu-hook"]);

module.exports = withTM({
  target: 'serverless'
});
