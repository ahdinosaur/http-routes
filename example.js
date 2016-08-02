const Server = require('http').createServer
const Stack = require('stack')
const Cookie = require('cookie')
const Route = require('./')

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
