# http-routes

functional http router using [`wayfarer`](https://github.com/yoshuawuyts)

```shell
npm install --save ahdinosaur/http-routes
```

## example

```js
const Server = require('http').createServer
const Stack = require('stack')
const Cookie = require('cookie')
const Route = require('http-routes')

const auth = [
  Route([
    // login and set cookies
    ['login/:id', function login (req, res, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', this.id))
      res.setHeader('Location', '/') // redirect to the home page.
      res.statusCode = 303
      res.end()
    }],
    // logout and clear cookies
    ['logout', function logout (req, res, next) {
      res.setHeader('Set-Cookie', Cookie.serialize('id', ''))
      res.setHeader('Location', '/login') // redirect to the login page.
      res.statusCode = 303
      res.end()
    }]
  ]),
  // check cookies, and authorize this connection (or not)
  function authorize (req, res, next) {
    this.id = Cookie.parse(req.headers.cookie).id
    next()
  },
  // return list of the current access rights. (for debugging)
  Route('whoami', function whoami (req, res, next) {
    res.end(JSON.stringify(this.id) + '\n')
  })
]

var context = { id: null }
const stack = Stack(...auth.map(fn => fn.bind(context)))

Server(stack).listen(5000)
```

## usage

### `Route = require('http-routes')`

### `handler = Route(path, routeHandler(s))`
### `handler = Route([path, routeHandler(s)])`
### `handler = Route([[path, routeHandler(s)], ...])`

where `path` is an Express-style path for [`wayfarer`](https://github.com/yoshuawuyts)

and `routeHandler` is a function of shape `(req, res, next) => { next() }`

and `routeHandlers` is an object mapping [http method names](https://www.npmjs.com/package/methods) to route handler functions

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
