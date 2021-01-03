
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-menu-hook.cjs.production.min.js')
} else {
  module.exports = require('./react-menu-hook.cjs.development.js')
}
