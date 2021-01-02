const withTM = require("next-transpile-modules")(["@rkusa/use-menu"]);

module.exports = withTM({
  target: 'serverless'
});
