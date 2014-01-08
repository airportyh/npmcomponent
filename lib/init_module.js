var exec = require('child_process').exec
var newGithub = require('./github')
var path = require('path')
var assert = require('insist')
var fs = require('fs')
var log = require('npmlog')

function initModule(credentials, user, repo, callback){
  log.info('init module ' + user + '/' + repo)
  var github = newGithub(credentials)

  get(github, user, repo, function(err, data){
    if (err) return callback(err)
    var fullName = data.full_name
    assert(fullName.match(/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/))
    user = fullName.split('/')[0]
    repo = fullName.split('/')[1]
    assert(user)
    assert(repo)
    var newRepoName = user + '-' + repo

    log.info('Fetched info for ' + fullName)

    var dirpath= path.join('repos', newRepoName)
    fs.mkdir(dirpath, function(err){
      if (err) return callback(err)
      exec('git init', {cwd: dirpath}, function(err, stdout, stderr){
        if (err) return callback(err)
        log.info('Creating GitHub Repo', newRepoName)
        github.repos.create({
          name: newRepoName
        }, function(err){
          if (err) return callback(err)
          var newRepoUrl = 'https://' + credentials.username + ':' + credentials.password + 
            '@github.com/npmcomponent/' + newRepoName + '.git'
          exec('git remote add origin ' + newRepoUrl, {cwd: dirpath}, function(err){
            if (err) return callback(err)
            var upstreamUrl = 'https://github.com/' + user + '/' + repo + '.git'
            exec('git remote add upstream ' + upstreamUrl, {cwd: dirpath}, function(err){
              if (err) return callback(err)
              callback(null)
            })
          })
        })
      
      })
    })

  })
}

function get(github, user, repo, callback){
  github.repos.get({
    user: user,
    repo: repo
  }, callback)
}

module.exports = initModule
