var newGithub = require('./github')
var rimraf = require('rimraf')
var path = require('path')
var assert = require('assert')
var Repo = require('./repo')

function deleteModule(credentials, repo, callback){
  assert(credentials)
  assert(typeof credentials.username === 'string')
  assert(typeof credentials.password === 'string')
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')
  var github = newGithub(credentials)

  rimraf(repo.dirpath(), function(err){
    if (err) return callback(err)
    github.repos.delete({
      user: 'npmcomponent',
      repo: repo.newName()
    }, callback)
  })
}

module.exports = deleteModule