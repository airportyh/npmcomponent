var log = require('npmlog')
var assert = require('assert')
var path = require('path')
var Repo = require('./repo')

function resetToMaster(repo, callback){
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')
  log.info(repo, 'reset to master')
  repo.git('clean -fd', function(err){
    if (err) return callback(err)  
    repo.git('reset --hard upstream/master', function(err){
      if (err) return callback(err)
      callback(null, true)
    })
  })
}


module.exports = resetToMaster