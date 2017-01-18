# http-routes

functional http router using [`http-compose`](https://github.com/ahdinosaur/http-compose) and [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp)

```shell
npm install --save http-routes
```

## example

```js
const Server = require('http').createServer
const Cookie = require('cookie')
const Route = require('http-routes')

const routerHandler = Route([
  Route([
    // login and set cookies
    ['/login/:id', function login (req, res, context, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', context.params.id, { path: '/' }))
      res.setHeader('Location', '/whoami') // redirect to the whoami page.
      res.statusCode = 303
      res.end()
    }],
    // logout and clear cookies
    ['/login', {
      get: function view (req, res, context, next) {
        const newId = Math.random().toString(8).substring(2)
        const html = `<a href='/login/${newId}'>login!</a>`
        res.setHeader('Content-Type', 'text/html')
        next(null, html)
      }
    }],
    Route(['/logout', function logout (req, res, context, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', '', { path: '/' }))
      res.setHeader('Location', '/whoami') // redirect to the whoami page
      res.statusCode = 303
      res.end()
    }])
  ]),
  // check cookies, and authorize this connection (or not)
  function authorize (req, res, context, next) {
    context.id = Cookie.parse(req.headers.cookie).id || null
    next()
  },
  // return list of the current access rights. (for debugging)
  Route('/whoami', function whoami (req, res, context, next) {
    res.setHeader('Content-Type', 'application/json')
    next(null, context.id)
  })
])

const finalHandler = (req, res) => (err, value) => {
  if (err) {
    console.error(err.stack)
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end(err.stack + '\n')
  } else if (value) {
    res.statusCode = 200
    if (typeof value === 'string') {
      res.end(value)
    } else {
      res.end(JSON.stringify(value, null, 2) + '\n')
    }
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end('Not Found\n')
  }
}

Server((req, res) => {
  routerHandler(req, res, {}, finalHandler(req, res))
}).listen(5000)
```

## usage

### `Route = require('http-routes')`

### `handler = Route(path, routeHandler(s))`
### `handler = Route([path, routeHandler(s)])`
### `handler = Route([[path, routeHandler(s)], ...])`

where `path` is an Express-style path for [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp)

and `handler` is a function of shape `(req, res, context, next) => { next(err, value) }` for [`http-compose`](https://github.com/ahdinosaur/http-compose)

and `routeHandler` is a handler where `context.params` is an object of path matches and `context.url` is substring of original url after path match

and `routeHandlers` is an object mapping [http method names](https://www.npmjs.com/package/methods) to route handler functions.

## license

The Apache License

Copyright &copy; 2016 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
