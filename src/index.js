const listEndpoints = require('express-list-endpoints')
const httpMocks = require('node-mocks-http')
const HEADER_SIGNATURE = 'x-express-middlware-help-recursive'

const isHelp = (req, keywords) => {
  return keywords.some(k => {
    return req.query.hasOwnProperty(k)
  })
}

const help = (message = '') => (req, res, next) => {
  // message is an string.
  // the first line is the description
  // the rest can be anything else.
  const h = isHelp(req, ['help', 'h'])

  if (h === false) {
    return next()
  }
  const description = message.trim().split('\n\n')[0]
  const body = message.trim().split('\n\n').slice(1).join('\n\n')
  
  const title = req.get('route')
    ? `url: ${req.route.path}\n${description}`
    : description

  let msg = `${title}\n\t${!req.get(HEADER_SIGNATURE) ? body : ''}\n`

  if (!req.route) {
    const routesHelp = listEndpoints(req.app)
      .map(route => {
        const subroutes = route.methods.map(method => {
          const mreq = httpMocks.createRequest({
            ...req,
            method,
            url: route.path + '?help',
            headers: {
              // this allows the middlware to know that it's calling itself.
              [HEADER_SIGNATURE]: true
            }
          })

          const mres = httpMocks.createResponse()

          req.app._router.handle(mreq, mres)

          return {
            path: route.path,
            method,
            res: mres._getData()
          }
        })

        return subroutes
      })
      .reduce((acc, subroutes) => {
        return [...acc, ...subroutes]
      })
      .reduce((acc, route) => {
        return acc + `\n[${route.method}]:${route.path} - ${route.res}`
      }, '')

    msg = msg + routesHelp
  }

  res.send(msg)
}

module.exports = help
