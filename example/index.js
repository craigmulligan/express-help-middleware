const express = require('express')
const app = express()
const help = require('../src')

app.get(
  '/greeting/:name',
  help({
    description: 'Returns a greeting',
    params: {
      name: 'A word that you would like to be called by'
    }
  }),
  function(req, res) {
    res.send(`Hello ${req.params.name}!`)
  }
)

app.get(
  '/greeting',
  help({
    description: 'Returns a general greeting'
  }),
  function(req, res) {
    res.send('Hii')
  }
)

app.use(
  (req, res, next) => {
    res.status(404)
    next()
  },
  // display full routes on 404
  help({
    description: 'Welcome to my greeting API'
  })
)
module.exports = app
