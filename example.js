const Server = require('http').createServer
const Cookie = require('cookie')
const Send = require('http-sender')()
const Route = require('./')

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

Server((req, res) => {
  routerHandler(req, res, {}, Send(req, res))
}).listen(5000)
