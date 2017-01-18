const test = require('tape')

const httpRoutes = require('../')

test('http-routes', function (t) {
  t.ok(httpRoutes, 'module is require-able')
  t.end()
})
