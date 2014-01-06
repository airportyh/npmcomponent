var Github = require('github')

function newGithub(credentials){
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