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

  routes.forEach(route => {
    const [path, cbs] = route
    router.on(path, cbs)
  })

  router.on(NOT_FOUND, (req, res, next) => { next() })

  return router
}

function wrap (handler) {
  return function (req, res, params, next) {
    return handler.call(this, extend(req, { params }), res, next)
  }
}
