var Github = require('github')
var assert = require('assert')

function newGithub(credentials){
  assert(credentials)
  assert(typeof credentials.username === 'string')
  assert(typeof credentials.password === 'string')
  var github = new Github({
    version: '3.0.0',
    protocol: 'https',
  })

  github.authenticate({
    type: 'basic',
    username: credentials.username,
    password: credentials.password
  })

  return github
}

module.exports = newGithub