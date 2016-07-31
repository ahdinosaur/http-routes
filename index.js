const serverRouter = require('server-router')
const extend = require('xtend')

const routeNotFound = 'routeNotFound'

module.exports = Routes

function Routes (...routes) {
  if (typeof routes[0] === 'string') {
    routes = [[routes[0], routes[1]]]
  }

  var router = serverRouter(routeNotFound, { wrap })

  routes.forEach(route => {
    const [path, cbs] = route
    router.on(path, cbs)
  })

  router.on(routeNotFound, (req, res, next) => { next() })

  return router
}

function wrap (handler) {
  return function (req, res, params, next) {
    handler.call(this, extend(req, { params }), res, next)
  }
}
