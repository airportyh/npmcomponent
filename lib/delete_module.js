var newGithub = require('./github')
var rimraf = require('rimraf')
var path = require('path')
var assert = require('assert')

function deleteModule(credentials, user, repo, callback){
  assert(credentials)
  assert(typeof credentials.username === 'string')
  assert(typeof credentials.password === 'string')
  assert(typeof user === 'string')
  assert(typeof repo === 'string')
  assert(typeof callback === 'function')
  var github = newGithub(credentials)

  var repoName = user + '-' + repo
  rimraf(path.join('repos', repoName), function(err){
    if (err) return callback(err)
    github.repos.delete({
      user: 'npmcomponent',
      repo: repoName
    }, callback)
  })
}

module.exports = deleteModule