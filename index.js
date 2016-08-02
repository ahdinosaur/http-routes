const { compose } = require('stack')
const extend = require('xtend')
const pathToRegexp = require('path-to-regexp')

module.exports = Routes

function Routes (routes) {
  if (typeof arguments[0] === 'string') {
    return Routes([arguments[0], arguments[1]])
  } else if (arguments[0].length == 2 && typeof arguments[0][0] === 'string') {
    return Routes([arguments[0]])
  }

  return compose(...routes.map(route => {
    const [path, handler] = route
    return mount(path, methodify(handler))
  }))
}

function methodify (handler) {
  return typeof handler === 'function'
    ? function get (req, res, next) {
      if (req.method !== 'GET') next()
      else handler(req, res, next)
    } : function byMethod (req, res, next) {
      const methodName = req.method.toLowerCase()
      const method = handler[methodName]
      if (method == null) next()
      else method(req, res, next)
    }
}

function mount (path, handler) {
  var keys = []
  const query = pathToRegexp(path, keys)
  return function (req, res, next) {
    const url = normalizeUrl(req.url)
    const matches = query.exec(url)
    if (matches === null) return next()
    const params = paramify(keys, matches.slice(1))
    handler(extend(req, { params }), res, next)
  }
}

function paramify (keys, values) {
  return keys.reduce((sofar, key, index) => {
    const match = values[index]
    sofar[key.name] = match
    return sofar
  }, {})
}

function normalizeUrl (path) {
  return (path || '').replace(/^\//, '')
}

function none (req, res, next) { next() }
