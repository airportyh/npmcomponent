var fromApi = require('./all.json')
  .filter(function(pkg){ return pkg })
var fromWiki = require('./from-wiki.json')

var GitHubUrlExp = /https:\/\/github\.com\/(.*)$/
var GitHubRawUrlExp = /https:\/\/raw\.github\.com\/(.*)$/

var reposFromApi = fromApi
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


var reposFromWiki = fromWiki.map(function(url){
  return url.match(GitHubUrlExp)[1]
})

//console.log(diff(reposFromWiki, reposFromApi).length)
console.log(diff(reposFromApi, reposFromWiki))

function diff(one, other){
  var ret = []
  one.forEach(function(repo){
    if (other.indexOf(repo) === -1){
      ret.push(repo)
    }
  })
  return ret
}

