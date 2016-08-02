const { compose } = require('stack')
const extend = require('xtend')
const pathToRegexp = require('path-to-regexp')

module.exports = Routes

function Routes (routes) {
  if (typeof arguments[0] === 'string') {
    return Routes([[arguments[0], arguments[1]]])
  } else if (arguments[0].length == 2 && typeof arguments[0][0] === 'string') {
    return Routes([arguments[0]])
  }

  return compose(...routes.map(route => {
    if (typeof route === 'function') return route
    const [path, handler] = route
    return mount(path, byMethod(handler))
  }))
}

function byMethod (handler) {
  const methodNames = Object.keys(handler)
  return typeof handler === 'function'
    ? ifMethod(handler, 'get')
    : compose(...methodNames.map(methodName => {
      return ifMethod(handler[methodName], methodName)
    }))
}

function ifMethod (handler, methodName) {
  var METHOD = methodName.toUpperCase()
  return function (req, res, next) {
    if (req.method !== METHOD) next()
    else handler(req, res, next)
  }
}

function mount (path, handler) {
  var keys = []
  const query = pathToRegexp(path, keys)
  return function (req, res, next) {
    const matches = query.exec(req.url)
    if (matches === null) return next()
    const params = paramify(keys, matches.slice(1))
    const nextUrl = req.url.substring(matches[0].length)
    const nextReq = extend(req, { url: nextUrl, params })
    handler(nextReq, res, next)
  }
}

function paramify (keys, values) {
  return keys.reduce((sofar, key, index) => {
    const match = values[index]
    sofar[key.name] = match
    return sofar
  }, {})
}

function none (req, res, next) { next() }
