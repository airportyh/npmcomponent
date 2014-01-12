var assert = require('assert')
var path = require('path')
var log = require('npmlog')
var Repo = require('./repo')

function commit(repo, callback){
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')
  repo.git('add .', function(err){
    repo.git.commit('Automatically rewritten for npm.',
      function(err, committed){
        if (err) return callback(err)
        callback(null)
      })
  })
}

module.exports = commit