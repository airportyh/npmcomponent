var mutateModule = require('./mutate_module')
var assert = require('assert')
var log = require('npmlog')
var commit = require('./commit')
var Repo = require('./repo')

function retagModule(repo, tag, callback){
  assert(repo instanceof Repo)
  assert(typeof tag === 'string')
  assert(typeof callback === 'function')
  log.info(repo, 'retagging ' + tag)
  repo.git('checkout ' + tag, function(err, stdout, stderr){
    if (err) return callback(new Error([err.message, stdout, stderr].join('\n')))
    mutateModule(repo, function(err){
      if (err) return callback(err)
      commit(repo, function(err){
        if (err) return callback(err)
        repo.git('tag ' + tag + ' -f', function(err){
          if (err) return callback(err)
          callback(null)
        })
      })
    })
  })
}

module.exports = retagModule