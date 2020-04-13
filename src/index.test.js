const app = require('../example')
const request = require('supertest')

describe('middleware', () => {
  test('returns help message with ?help', () => {
    return request(app)
      .get('/greeting/craig?help')
      .expect(200)
      .then(response => {
        expect(response.text).toMatchSnapshot()
      })
  })

  test('returns help message with ?h', () => {
    return request(app)
      .get('/greeting/craig?help')
      .expect(200)
      .then(response => {
        expect(response.text).toMatchSnapshot()
      })
  })

  test('returns normal response without ?help', () => {
    return request(app)
      .get('/greeting/craig')
      .expect(200)
      .then(response => {
        expect(response.text).toBe('Hello craig!')
      })
  })

  test('if it does not match a route it should return all subroutes', () => {
    return request(app)
      .get('/gretting/craig?help')
      .expect(404)
      .then(response => {
        expect(response.text).toMatchSnapshot()
      })
  })

  test('works with post', () => {
    return request(app)
      .post('/greeting?help')
      .expect(200)
      .then(response => {
        expect(response.text).toMatchSnapshot()
      })
  })
})
