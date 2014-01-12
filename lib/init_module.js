var newGithub = require('./github')
var path = require('path')
var assert = require('insist')
var fs = require('fs')
var log = require('npmlog')
var Repo = require('./repo')

function initModule(credentials, repo, callback){
  assert(credentials)
  assert(typeof credentials.username === 'string')
  assert(typeof credentials.password === 'string')
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')

  log.info(repo, 'init module')
  var github = newGithub(credentials)

  get(github, repo, function(err, data){
    if (err) return callback(err)
    repo = Repo(data.full_name) // update repo name

    log.info(repo, 'fetched github info')

    fs.mkdir(repo.dirpath(), function(err){
      if (err) return callback(err)
      repo.git('init', function(err){
        if (err) return callback(err)
        log.info(repo, 'creating GitHub Repo')
        github.repos.create({
          name: repo.newName()
        }, function(err){
          if (err) return callback(err)
          repo.git('remote add origin ' + repo.originUrl(credentials), function(err){
            if (err) return callback(err)
            repo.git('remote add upstream ' + repo.upstreamUrl(), function(err){
              if (err) return callback(err)
              callback(null)
            })
          })
        })
      })
    })

  })
}

function get(github, repo, callback){
  assert(github)
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')
  github.repos.get({
    user: repo.user,
    repo: repo.name
  }, callback)
}

module.exports = initModule
