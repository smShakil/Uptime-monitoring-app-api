/*
 * Title: Utilities
 * Description: Holds various utility functions
 * Author: S.M. Shakil
 * Date: 07/02/2024
 */

// Dependencies
const crypto = require('node:crypto')
const environment = require('../environments')

// Module scaffolding
const utilities = {}

// parse JSON string
utilities.parseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.log('Error during parsing JSON string', error)
    return {}
  }
}

// hash any string
utilities.hash = (string) => {
  if (string?.length && typeof string === 'string') {
    return crypto.createHmac('sha256', environment.secretKey).update(string).digest('hex')
  } else return null
}

module.exports = utilities
