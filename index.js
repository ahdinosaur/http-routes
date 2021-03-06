const assign = Object.assign
const Url = require('url')
const compose = require('http-compose')
const pathToRegexp = require('path-to-regexp')
const zipObject = require('@f/zip-obj')

module.exports = Routes

function Routes (routes) {
  if (typeof arguments[0] === 'string') {
    return Routes([[arguments[0], arguments[1]]])
  } else if (arguments[0].length === 2 && typeof arguments[0][0] === 'string') {
    return Routes([arguments[0]])
  }

  return compose(routes.map(route => {
    if (typeof route === 'function') return route
    const path = route[0]
    const handler = route[1]
    return mount(path, byMethod(handler))
  }))
}

function byMethod (handler) {
  const methodNames = Object.keys(handler)
  return typeof handler === 'function'
    ? ifMethod(handler, 'get')
    : compose(methodNames.map(methodName => {
      return ifMethod(handler[methodName], methodName)
    }))
}

function ifMethod (handler, methodName) {
  var METHOD = methodName.toUpperCase()
  return function (req, res, context, next) {
    if (req.method !== METHOD) next()
    else handler(req, res, context, next)
  }
}

function mount (path, handler) {
  var keys = []
  const query = pathToRegexp(path, keys)
  return function (req, res, context, next) {
    var url = context && context.url ||
      Url.parse(req.headers.host + req.url)

    const matches = query.exec(url.pathname)
    if (matches === null) return next()

    const nextPathname = url.pathname.substring(matches[0].length)
    const nextUrl = Url.parse(Url.format(assign({}, url, {
      pathname: '/' + nextPathname
    })))

    const keyNames = keys.map(key => key.name)
    const routeParams = zipObject(keyNames, matches.slice(1))
    const nextParams = assign(context.params || {}, routeParams)

    const nextContext = assign({}, context, {
      url: nextUrl,
      params: nextParams
    })

    handler(req, res, nextContext, next)
  }
}
