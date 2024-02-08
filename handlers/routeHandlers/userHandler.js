/*
 * Title: User handler
 * Description: User handler to handle user CRUD
 * Author: S.M. Shakil
 * Date: 08/02/2024
 */

// Dependencies
const fs = require('fs-extra')
const validator = require('../../helpers/validators')
const { hash } = require('../../helpers/utilities')

// Module scaffolding
const handler = {}
handler._user = {}

handler.userHandler = ({ props, body, callback }) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete']
  if (acceptedMethods.indexOf(props.method) > -1) {
    handler._user[props.method]({ props, body, callback })
  } else {
    callback(405)
  }
}

handler._user.get = ({ props, callback }) => {
  const phone = props.queryObj.get('phone')
  if (phone) {
    const file = `${__dirname}/../../.data/users/${phone}.json`
    fs.readJson(file, (err, user) => {
      if (!err) {
        delete user.password
        callback(200, user)
      } else {
        callback(404, { error: 'Requested user was not found.' })
      }
    })
  } else {
    callback(400)
  }
}

handler._user.post = ({ body, callback }) => {
  const { value: firstName, errors: fErrors } = validator(body.firstName).type('string')
  const { value: lastName, errors: lErrors } = validator(body.lastName).nullable().type('string')
  const { value: phone, errors: pErrors } = validator(body.phone).type('string').exact(11)
  const { value: password, errors: passErrors } = validator(body.password).type('string').min(6)
  const { value: termsConditions, errors: tcErrors } = validator(body.termsConditions).type(
    'boolean',
  )
  if ([fErrors, lErrors, pErrors, passErrors, tcErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        firstName: fErrors,
        lastName: lErrors,
        phone: pErrors,
        password: passErrors,
        termsConditions: tcErrors,
      },
    })
  } else {
    const file = `${__dirname}/../../.data/users/${phone}.json`
    fs.readJson(file, (err) => {
      if (err) {
        const payload = { firstName, lastName, phone, termsConditions }
        fs.writeJson(file, { ...payload, password: hash(password) }, (err) => {
          if (err) return callback(500, err)
          callback(200, payload)
        })
      } else {
        callback(400, { error: 'User already exists' })
      }
    })
  }
}

handler._user.put = ({ body, callback }) => {
  const { value: firstName, errors: fErrors } = validator(body.firstName).nullable().type('string')
  const { value: lastName, errors: lErrors } = validator(body.lastName).nullable().type('string')
  const { value: phone, errors: pErrors } = validator(body.phone).type('string').exact(11)
  const { value: password, errors: passErrors } = validator(body.password)
    .nullable()
    .type('string')
    .min(6)
  const { value: termsConditions, errors: tcErrors } = validator(body.termsConditions)
    .nullable()
    .type('boolean')
  if ([fErrors, lErrors, pErrors, passErrors, tcErrors].some((err) => err.length)) {
    callback(400, {
      error: {
        firstName: fErrors,
        lastName: lErrors,
        phone: pErrors,
        password: passErrors,
        termsConditions: tcErrors,
      },
    })
  } else {
    const file = `${__dirname}/../../.data/users/${phone}.json`
    fs.readJson(file, (err, user) => {
      if (!err) {
        const payload = {
          firstName: firstName ?? user.firstName,
          lastName: lastName ?? user.lastName,
          termsConditions: termsConditions ?? user.termsConditions,
        }
        fs.writeJson(
          file,
          { ...payload, password: password ? hash(password) : user.password },
          (err) => {
            if (err) return callback(500, err)
            callback(200, { ...payload, phone })
          },
        )
      } else {
        callback(404, { error: 'Requested user was not found.' })
      }
    })
  }
}
handler._user.delete = ({ props, callback }) => {
  const phone = props.queryObj.get('phone')
  const file = `${__dirname}/../../.data/users/${phone}.json`
  fs.readJson(file, (err) => {
    if (!err) {
      fs.remove(file, (error) => {
        if (error) callback(500, error)
        else callback(200, { message: 'User deleted successfully' })
      })
    } else {
      callback(404, { error: 'Requested user was not found.' })
    }
  })
}

module.exports = handler
