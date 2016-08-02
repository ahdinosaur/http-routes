const serverRouter = require('server-router')
const extend = require('xtend')

const NAMESPACE = 'http-routes__'
const NOT_FOUND = NAMESPACE + 'notFound'

module.exports = Routes

function Routes (routes) {
  if (typeof arguments[0] === 'string') {
    return Routes([arguments[0], arguments[1]])
  } else if (arguments[0].length == 2 && typeof arguments[0][0] === 'string') {
    return Routes([arguments[0]])
  }

  var router = serverRouter(NOT_FOUND, { wrap })

  routes.forEach(function (route) {
    router.on(route[0], route[1])
  })

  router.on(NOT_FOUND, function (req, res, next) { next() })

  return router
}

function wrap (handler) {
  return typeof handler === 'function'
    ? wrapFunction(handler)
    : wrapObject(handler)
}

function wrapObject (handler) {
  return Object.keys(handler)
  .reduce(function (sofar, key) {
    sofar[key] = wrapFunction(handler[key])
    return sofar
  }, {})
}

function wrapFunction (handler) {
  return function (req, res, params, next) {
    handler(extend(req, { params }), res, next)
  }
}
