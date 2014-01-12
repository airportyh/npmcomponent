var child_process = require('child_process')
var log = require('npmlog')

function Git(repo){
  var exec = function(cmd, callback){
    cmd = 'git ' + cmd
    log.info(repo, cmd)
    child_process.exec(cmd, 
      {cwd: repo.dirpath()}, callback)
  }

  exec.fetch = function(from, callback){
    exec('fetch ' + from, function(err, stdout, stderr){
      if (err) return callback(err)
      var changed = (stderr !== '')
      callback(null, changed)
    })
  }

  exec.commit = function(msg, callback){
    exec('commit -am "' + msg + '"', function(err, stdout){
      if (err) {
        if (stdout.match(/nothing to commit/)){
          return callback(null, false)
        }
        return callback(err)
      }
      callback(null, true)
    })
  }

  exec.tags = function(callback){
    exec('tag', function(err, stdout, stderr){
      if (err) return callback(err)
      callback(null, parseTags(stdout))
    })
  }

  function parseTags(output){
    return output.split('\n').filter(function(line){
      return line.length > 0
    })
  }


  return exec
}

module.exports = Git