var Github = require('github')
var exec = require('child_process').exec

function initModule(credentials, user, repo, callback){

  var github = newGithub(credentials)

  var newRepoName = user + '-' + repo

  console.log('Forking ' + user + '/' + repo + '.')
  fork(github, user, repo, function(err){

    if (err) return callback(err)
  
    waitTillExists(github, 'npmcomponent', repo, function(err, data){

      if (err) return callback(err)

      var parent = data.parent

      user = parent.full_name.split('/')[0]
      repo = parent.full_name.split('/')[1]

      console.log('npmcomponent/' + repo + ' successfully created.')
      
      console.log('Renaming npmcomponent/' + repo + ' to npmcomponent/' + newRepoName + '.')
      
      renameRepo(github, repo, newRepoName, function(err){
        if (err) return console.error(err.message)
        console.log('Rename successful.')

        console.log('Cloning', newRepoName + '.')

        clone(credentials, 'npmcomponent', newRepoName, function(err){
          if (err) return console.error(err.message)

          console.log('Successfully cloned', newRepoName + '.')

          console.log('Adding upstream')
          addUpStream(user, repo, function(err){
            if (err) return console.error(err.message)
            console.log('Successfully added upstream.')
            callback(null)
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

function newGithub(credentials){
  var github = new Github({
    version: '3.0.0',
    protocol: 'https',
  })

  github.authenticate({
    type: 'basic',
    username: credentials.username,
    password: credentials.password
  })

  return github
}

module.exports = initModule
