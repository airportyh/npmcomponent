var sync = require('../lib/sync_module')
var async = require('async')
var credentials = require('../credentials.json')

var all = require('../all.json')
  .filter(function(pkg){ return pkg })

var first10 = all

var GitHubUrlExp = /https:\/\/github\.com\/(.*)$/
var GitHubRawUrlExp = /https:\/\/raw\.github\.com\/(.*)$/

var repos = first10
  .map(function(pkg){
    var repo = pkg.repo
    var m = repo.match(GitHubUrlExp)
    if (m){
      return m[1]
    }else if (m = repo.match(GitHubRawUrlExp)){
      return m[1]
    }else{
      return repo
    }
  })
  .map(function(repo){
    var parts = repo.split('/')
    return {
      user: parts[0],
      name: parts[1]
    }
  })


async.eachSeries(repos, function(repo, next){
  sync(credentials, repo.user, repo.name, true, next)
}, function(err){
  if (err) return console.error(err.message)
  console.log('Success!')
})
