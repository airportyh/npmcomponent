var retag = require('./retag_module')
var assert = require('assert')
var log = require('npmlog')
var retagModule = require('./retag_module')
var async = require('async')
var Repo = require('./repo')

function retagAllModule(repo, callback){
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')
  log.info(repo, 'retagging')
  repo.git.tags(function(err, tags){
    if (err) return callback(err)
    async.eachSeries(tags, function(tag, next){
      retagModule(repo, tag, next)
    }, function(err){
      if (err) return callback(err)
      callback(null)
    })
  })
}

module.exports = retagAllModule
