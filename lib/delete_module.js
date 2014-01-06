var newGithub = require('./github')
var rimraf = require('rimraf')
var path = require('path')

function deleteModule(credentials, user, repo, callback){
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