var path = require('path')
var Git = require('./git')
var assert = require('assert')

function Repo($1, $2){
  var user, name
  if ($2 === undefined){
    user = $1.split('/')[0]
    name = $1.split('/')[1]
  }else{
    user = $1
    name = $2
  }
  assert(user.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*$/))
  assert(name.match(/^[a-zA-Z0-9\-\_\.]+$/))
  if (!(this instanceof Repo)) return new Repo(user, name)
  this.user = user
  this.name = name
  this.git = Git(this)
}

Repo.prototype = {
  dirpath: function(){
    return path.join('repos', this.newName())
  },
  newName: function(){
    return this.user + '-' + this.name
  },
  originalName: function(){
    return this.user + '/' + this.name
  },
  upstreamUrl: function(){
    return 'https://github.com/' + this.user + '/' + this.name + '.git'
  },
  originUrl: function(credentials){
    assert(credentials)
    return 'https://' + credentials.username + ':' + credentials.password + 
      '@github.com/npmcomponent/' + this.newName() + '.git'
  },
  toString: function(){
    return this.originalName()
  }
}

module.exports = Repo