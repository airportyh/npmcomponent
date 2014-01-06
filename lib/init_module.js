var exec = require('child_process').exec
var newGithub = require('./github')
var path = require('path')
var assert = require('insist')
var fs = require('fs')

function initModule(credentials, user, repo, callback){

  var github = newGithub(credentials)

  get(github, user, repo, function(err, data){
    var fullName = data.full_name
    assert(fullName.match(/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/))
    user = fullName.split('/')[0]
    repo = fullName.split('/')[1]
    assert(user)
    assert(repo)
    var newRepoName = user + '-' + repo

    var dirpath= path.join('repos', newRepoName)
    fs.mkdir(dirpath, function(err){
      if (err) return callback(err)
      exec('git init', {cwd: dirpath}, function(err, stdout, stderr){
        if (err) return callback(err)
        console.log('Creating GitHub Repo', newRepoName)
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

function addUpStream(user, repo, callback){
  var upstreamUrl = 'git://github.com/' + user + '/' + repo + '.git'
  var newRepoName = user + '-' + repo
  exec('git --work-tree repos/' + newRepoName + 
    ' --git-dir repos/' + newRepoName + '/.git' +
    ' remote add upstream ' + upstreamUrl, callback)
}

function waitTillExists(github, user, repo, callback){
  var wait = 1000
  function check(){
    get(github, user, repo, function(err, data){
      if (!err){
        callback(null, data)
      }else{
        setTimeout(check, wait)
      }
    })
  }
  setTimeout(check, wait)
}

function clone(credentials, user, repo, callback){
  var url = 'https://' + credentials.username + ':' + credentials.password + '@github.com/npmcomponent/' + repo + '.git'
  exec('git clone ' + url + ' repos/' + repo, callback)
}

function fork(github, user, repo, callback){
  github.repos.fork({
    user: user,
    repo: repo,
    organization: 'npm-component'
  }, callback)
}

function get(github, user, repo, callback){
  github.repos.get({
    user: user,
    repo: repo
  }, callback)
}

function renameRepo(github, from, to, done){

  github.repos.update({
    user: 'npmcomponent',
    repo: from,
    name: to
  }, done)

}

module.exports = initModule
