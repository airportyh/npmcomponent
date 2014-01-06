var fs = require('fs')
var path = require('path')
var initModule = require('./init_module')
var child_process = require('child_process')
var mutateModule = require('./mutate_module')

function syncModule(credentials, user, repo, callback){
  var moduleDir = path.join('repos', user + '-' + repo)
  fs.exists(moduleDir, function(yes){
    if (yes){
      doSync(user, repo, callback)
    }else{
      initModule(credentials, user, repo, function(err){
        if (err) return callback(null)
        doSync(user, repo, callback)
      })
    }
  })
}

function doSync(user, repo, callback){
  var moduleName = user + '-' + repo
  var moduleDir = path.join('repos', moduleName)
  resetToMaster(user, repo, function(err, changed){
    if (err) return callback(err)
    if (changed){ 
      mutateModule(moduleName, function(err){
        if (err) return callback(err)
        commit(user, repo, function(err){
          if (err) return callback(err)
          callback(null)
        })
      })
    }else{
      return callback(null)
    }
  })
}

function resetToMaster(user, repo, callback){
  var moduleName = user + '-' + repo
  var moduleDir = path.join('repos', moduleName)
  exec('git clean -fd', {cwd: moduleDir}, function(err){
    if (err) return callback(err)
    exec('git fetch upstream', {cwd: moduleDir}, function(err, stdout, stderr){
      if (err) return callback(err)
      var changed = (stderr !== '')
      if (!changed) return callback(null, false)
      exec('git reset --hard upstream/master', {cwd: moduleDir}, function(err){
        if (err) return callback(err)
        callback(null, true)
      })
    })
  })
}

function commit(user, repo, callback){
  var moduleName = user + '-' + repo
  var moduleDir = path.join('repos', moduleName)
  exec('git add .', {cwd: moduleDir}, function(err){
    if (err) return callback(err)
    exec('git commit -m "Automatically rewritten for npm."', {cwd: moduleDir}, function(err){
      if (err) return callback(err)
      exec('git push origin master -f', {cwd: moduleDir}, function(err){
        if (err) return callback(err)
        callback(null)  
      })
    })
  })
}

function exec(){
  var cmd = arguments[0]
  console.log(cmd)
  child_process.exec.apply(null, arguments)
}

module.exports = syncModule