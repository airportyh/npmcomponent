var fs = require('fs')
var path = require('path')
var initModule = require('./init_module')
var mutateModule = require('./mutate_module')
var log = require('npmlog')
var assert = require('assert')
var getArgs = require('getargs')
var commit = require('./commit')
var resetToMaster = require('./reset_master_module')
var Repo = require('./repo')

function syncModule(){
  
  var args = getArgs(
    'credentials:object, repo, ' +
    '[options]:object, callback:function',
    arguments)

  var credentials = args.credentials
  var repo = args.repo
  var options = args.options || {}
  var callback = args.callback

  log.info(repo, 'syncing')
  
  fs.exists(repo.dirpath(), function(yes){
    if (yes){
      log.info(repo, 'directory already exists')
      if (options.skipExisting){
        log.info(repo, 'skipping existing directory')
        return callback(null)
      }
      doSync(repo, options.force, callback)
    }else{
      initModule(credentials, repo, function(err){
        if (err) {
          return callback(err)
        }
        doSync(repo, options.force, callback)
      })
    }
  })
}

function doSync(repo, forcePush, callback){
  log.info(repo, 'performing sync')
  assert(repo instanceof Repo)
  assert(typeof forcePush === 'boolean')
  assert(typeof callback === 'function')
  repo.git.fetch('upstream', function(err, changed){
    if (err) return callback(err)
    if (forcePush || changed){
      resetToMaster(repo, function(err, changed){
        if (err) return callback(err)  
        mutateModule(repo, function(err){
          if (err) return callback(err)
          commit(repo, function(err){
            if (err) return callback(err)
            repo.git('push origin master -f', function(err, stdout, stderr){
              if (err) return callback(new Error(err.message + '\n' + stdout + '\n' + stderr))
              callback(null)
            })
          })
        })  
      })
    }else{
      callback(null)
    }
  })
}

module.exports = syncModule