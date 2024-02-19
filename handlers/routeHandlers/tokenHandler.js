/*
 * Title: TOken handler
 * Description: Token handler to handle token CRUD
 * Author: S.M. Shakil
 * Date: 14/02/2024
 */

// Dependencies
const fs = require('fs-extra')
const validator = require('chainable-simple-validator')
const { hash, generateUUID } = require('../../helpers/utilities')

// Module scaffolding
const handler = {}
handler._token = {}
handler.expiryDuration = 60 * 60 * 1000

handler.checkAuthorization = (token, callback) => {
  const { value, errors } = validator(token).type('string')
  if (value && !errors?.length) {
    const file = `${__dirname}/../../.data/tokens/${token}.json`
    fs.readJson(file, (err, tokenData) => {
      if (!err && tokenData.expiry > Date.now()) callback(true, tokenData)
      else callback(false, null)
    })
  } else callback(false, null)
}

handler.tokenHandler = ({ props, body, callback }) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete']
  if (acceptedMethods.indexOf(props.method) > -1) {
    handler._token[props.method]({ props, body, callback })
  } else {
    callback(405)
  }
}

handler._token.get = ({ props, callback }) => {
  const token = props.queryObj.get('token')
  if (token) {
    const file = `${__dirname}/../../.data/tokens/${token}.json`
    fs.readJson(file, (err, tokenData) => {
      if (!err) {
        callback(200, tokenData)
      } else {
        callback(404, { error: 'Requested token was not found.' })
      }
    })
  } else {
    callback(400)
  }
}

handler._token.post = ({ body, callback }) => {
  const { value: phone, errors: pErrors } = validator(body.phone).type('string').exact(11)
  const { value: password, errors: passErrors } = validator(body.password).type('string').min(6)
  if ([pErrors, passErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        phone: pErrors,
        password: passErrors,
      },
    })
  } else {
    const file = `${__dirname}/../../.data/users/${phone}.json`
    fs.readJson(file, (err, user) => {
      if (err) {
        callback(404, { error: 'User was not found.' })
      } else {
        if (hash(password) === user.password) {
          const token = generateUUID()
          const tokenFile = `${__dirname}/../../.data/tokens/${token}.json`
          const payload = { phone, token, expiry: Date.now() + handler.expiryDuration }
          fs.writeJson(tokenFile, payload, (err) => {
            if (err) return callback(500, err)
            callback(200, payload)
          })
        } else {
          callback(400, { error: "Phone or password don't match." })
        }
      }
    })
  }
}

handler._token.put = ({ body, callback }) => {
  const { value: token, errors: tokenErrors } = validator(body.token).type('string')
  const { value: expiry, errors: expiryErrors } = validator(body.expiry).type('boolean')
  if ([tokenErrors, expiryErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        token: tokenErrors,
        expiry: expiryErrors,
      },
    })
  } else {
    const file = `${__dirname}/../../.data/tokens/${token}.json`
    fs.readJson(file, (err, tokenData) => {
      if (!err) {
        if (expiry) {
          if (tokenData.expiry > Date.now()) {
            const payload = { ...tokenData, expiry: Date.now() + handler.expiryDuration }
            fs.writeJson(file, payload, (err) => {
              if (err) return callback(500, err)
              callback(200, payload)
            })
          } else callback(404, { error: 'Token already expired.' })
        } else callback(400)
      } else {
        callback(404, { error: 'Requested token was not found.' })
      }
    })
  }
}

handler._token.delete = ({ props, callback }) => {
  const token = props.queryObj.get('token')
  const file = `${__dirname}/../../.data/tokens/${token}.json`
  fs.readJson(file, (err) => {
    if (!err) {
      fs.remove(file, (error) => {
        if (error) callback(500, error)
        else callback(200, { message: 'Token deleted successfully' })
      })
    } else {
      callback(404, { error: 'Requested token was not found.' })
    }
  })
}

module.exports = handler
