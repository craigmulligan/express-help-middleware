const listEndpoints = require('express-list-endpoints')
const httpMocks = require('node-mocks-http')
const HEADER_SIGNATURE = 'x-express-middlware-help-recursive'

const isHelp = (req, keywords) => {
  return keywords.some(k => {
    return req.query.hasOwnProperty(k)
  })
}

const help = (options = {}) => (req, res, next) => {
  const h = isHelp(req, ['help', 'h'])
  let msg = ''

  if (h === false) {
    return next()
  }

  if (!options.params) {
    options.params = {}
  }

  const paramsInfo = Object.entries(options.params).reduce((acc, [k, v]) => {
    return acc + `${k}: ${v}\n`
  }, ``)

  const title = req.get('route')
    ? `url: ${req.route.path}\n${options.description}`
    : options.description

  msg = `${title}\n\t${!req.get(HEADER_SIGNATURE) ? paramsInfo : ''}\n`

  if (!req.route) {
    const routesHelp = listEndpoints(req.app)
      .map(route => {
        const subroutes = route.methods.map(method => {
          const mreq = httpMocks.createRequest({
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
        // TODO do is it better to ...?
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
