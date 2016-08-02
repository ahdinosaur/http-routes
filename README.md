# http-routes

functional http router using [`stack`](https://github.com/creationix/stack) and [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp)

```shell
npm install --save http-routes
```

## example

```js
const Server = require('http').createServer
const Stack = require('stack')
const Cookie = require('cookie')
const Route = require('http-routes')

const route = Route([
  Route([
    // login and set cookies
    ['/login/:id', function login (req, res, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', req.params.id, { path: '/' }))
      res.setHeader('Location', '/whoami') // redirect to the whoami page.
      res.statusCode = 303
      res.end()
    }],
    // logout and clear cookies
    ['/login', {
      get: function view (req, res, next) {
        const newId = Math.random().toString(8).substring(2)
        const html = `<a href='/login/${newId}'>login!</a>`
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      },
    }],
    Route(['/logout', function logout (req, res, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', '', { path: '/' }))
      res.setHeader('Location', '/whoami') // redirect to the whoami page
      res.statusCode = 303
      res.end()
    }])
  ]),
  // check cookies, and authorize this connection (or not)
  function authorize (req, res, next) {
    req.id = Cookie.parse(req.headers.cookie).id || null
    next()
  },
  // return list of the current access rights. (for debugging)
  Route('/whoami', function whoami (req, res, next) {
    res.end(JSON.stringify(req.id) + '\n')
  })
])

Server(Stack(route)).listen(5000)
```

## usage

### `Route = require('http-routes')`

### `handler = Route(path, routeHandler(s))`
### `handler = Route([path, routeHandler(s)])`
### `handler = Route([[path, routeHandler(s)], ...])`

where `path` is an Express-style path for [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp)

and `handler` is a function of shape `(req, res, next) => { next() }` for [`stack`](https://github.com/creationix/stack)

and `routeHandler` is a handler where `req.params` is an object of path matches and `req.url` is substring of original url after path match

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
