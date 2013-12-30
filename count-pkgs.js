var pkgs = require('./all.json')

console.log(pkgs.length)

console.log(pkgs.filter(function(pkg){
  return !!pkg
}).length)