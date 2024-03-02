/*
 * Title: Environments
 * Description: Holds variables for different environment mode
 * Author: S.M. Shakil
 * Date: 01/02/2024
 */

// Module scaffolding
const environments = {}

environments.development = {
  mode: 'development',
  protocol: 'http',
  host: 'localhost',
  port: 9000,
  secretKey: 'hashKeyForPassword',
}
environments.staging = {
  mode: 'staging',
  protocol: 'https',
  host: 'shop.staging.com',
  port: 8080,
  secretKey: 'hashKeyForPassword',
}
environments.production = {
  mode: 'production',
  protocol: 'https',
  host: 'shop.app.com',
  port: 8080,
  secretKey: 'hashKeyForPassword',
}

const appliedMode = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development'
const appliedEnvironment = environments[appliedMode] || environments['development']

module.exports = appliedEnvironment
