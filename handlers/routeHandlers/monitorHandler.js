/*
 * Title: Monitor handler
 * Description: Monitor handler to handle user added monitors CRUD
 * Author: S.M. Shakil
 * Date: 19/02/2024
 */

// Dependencies
const fs = require('fs-extra')
const validator = require('chainable-simple-validator')
const { generateUUID } = require('../../helpers/utilities')
const { checkAuthorization } = require('./tokenHandler')

// Module scaffolding
const handler = {}
handler.acceptedMethods = ['get', 'post', 'put', 'delete']
handler._monitor = {}

handler.monitorHandler = ({ props, body, callback }) => {
  checkAuthorization(props?.headerObj?.token, (isAuthorized, user) => {
    if (isAuthorized) {
      if (handler.acceptedMethods.includes(props.method)) {
        handler._monitor[props.method]({ props, body, user, callback })
      } else callback(405)
    } else callback(403, { error: 'Unauthorized' })
  })
}

handler._monitor.get = ({ props, callback }) => {
  const id = props.queryObj.get('id')
  if (id) {
    const file = `${__dirname}/../../.data/monitors/${id}.json`
    fs.readJson(file, (err, data) => {
      if (!err) {
        callback(200, data)
      } else {
        callback(404, { error: 'Requested monitor-check was not found.' })
      }
    })
  } else {
    callback(400)
  }
}

handler._monitor.post = ({ body, user, callback }) => {
  const { value: url, errors: urlErrors } = validator(body.url).type('string').isURL()
  const { value: method, errors: mErrors } = validator(body.method)
    .type('string')
    .custom((el) => handler.acceptedMethods.includes(el.toLowerCase()), 'Method not accepted')
  const { value: successCodes, errors: scErrors } = validator(body.successCodes).type('array')
  const { value: timeoutInSeconds, errors: tosErrors } = validator(body.timeoutInSeconds)
    .type('number')
    .custom((el) => el <= 10, 'Maximum brandwidth 10 seconds')
    .custom((el) => el % 1 === 0, 'Must be a whole number')

  if ([urlErrors, mErrors, scErrors, tosErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        url: urlErrors,
        method: mErrors,
        successCodes: scErrors,
        timeoutInSeconds: tosErrors,
      },
    })
  } else {
    const id = generateUUID()
    const file = `${__dirname}/../../.data/monitors/${id}.json`
    const payload = { id, phone: user.phone, url, method, successCodes, timeoutInSeconds }
    fs.writeJson(file, payload, (err) => {
      if (err) return callback(500, err)
      callback(200, payload)
    })
  }
}

handler._monitor.put = ({ body, callback }) => {
  const { value: id, errors: idErrors } = validator(body.id)
    .type('string')
    .isAlphaNumericWithHyphenUnderscore()
  const { value: url, errors: urlErrors } = validator(body.url).nullable().type('string').isURL()
  const { value: method, errors: mErrors } = validator(body.method)
    .nullable()
    .type('string')
    .custom((el) => handler.acceptedMethods.includes(el.toLowerCase()), 'Method not accepted')
  const { value: successCodes, errors: scErrors } = validator(body.successCodes)
    .nullable()
    .type('array')
  const { value: timeoutInSeconds, errors: tosErrors } = validator(body.timeoutInSeconds)
    .nullable()
    .type('number')
    .custom((el) => el <= 10, 'Maximum brandwidth 10 seconds')
    .custom((el) => el % 1 === 0, 'Must be a whole number')

  if ([idErrors, urlErrors, mErrors, scErrors, tosErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        id: idErrors,
        url: urlErrors,
        method: mErrors,
        successCodes: scErrors,
        timeoutInSeconds: tosErrors,
      },
    })
  } else {
    const file = `${__dirname}/../../.data/monitors/${id}.json`
    fs.readJson(file, (err, data) => {
      if (!err) {
        const payload = {
          id,
          phone: data.phone,
          url: url ?? data.url,
          method: method ?? data.method,
          successCodes: successCodes ?? data.successCodes,
          timeoutInSeconds: timeoutInSeconds ?? data.timeoutInSeconds,
        }
        fs.writeJson(file, payload, (err) => {
          if (err) return callback(500, err)
          callback(200, payload)
        })
      } else {
        callback(404, { error: 'Requested monitor-check was not found.' })
      }
    })
  }
}

handler._monitor.delete = ({ props, callback }) => {
  const id = props.queryObj.get('id')
  const file = `${__dirname}/../../.data/monitors/${id}.json`
  fs.readJson(file, (err) => {
    if (!err) {
      fs.remove(file, (error) => {
        if (error) callback(500, error)
        else callback(200, { message: 'Monitor-check deleted successfully' })
      })
    } else {
      callback(404, { error: 'Requested monitor-check was not found.' })
    }
  })
}

module.exports = handler
