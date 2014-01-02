var fs = require('fs')
var path = require('path')
var glob = require('glob')
var async = require('async')
var falafel = require('falafel')

function mutateModule(moduleName, callback){
  var dirpath = 'repos/' + moduleName
  fs.readFile(path.join(dirpath, 'component.json'), function(err, data){
    if (err) return callback(err)
    var config = JSON.parse('' + data)
    var deps = readDeps(config)
    glob(path.join(dirpath, '**/*.js'), function(err, files){
      async.each(files, function(filepath, next){
        mutateFile(filepath, deps, next)
      }, function(err){
        if (err) return callback(err)
        writePackageJson(dirpath, moduleName, config, deps, callback)
      })
    })
  })
}

function writePackageJson(dirpath, moduleName, config, deps, callback){
  var packageConfig = {
    name: moduleName,
    description: config.description,
    version: config.version,
    keywords: config.keywords,
    main: config.main,
    dependencies: packageJsonDeps(deps),
    license: config.license
  }
  fs.writeFile(path.join(dirpath, 'package.json'), 
    JSON.stringify(packageConfig, null, '  '), 
    callback)

}

function packageJsonDeps(deps){
  var ret = {}
  for (var dep in deps){
    var fullname = deps[dep]
    ret[fullname] = 'git://github.com/npmcomponent/' + fullname + '.git'
  }
  return ret
}

function mutateFile(filepath, dep, callback){
  fs.readFile(filepath, function(err, data){
    if (err) return callback(err)
    var code = '' + data
    code = falafel(code, function(node){
      if (isRequire(node)){
        var requirePath = node.arguments[0].value
        if (requirePath in dep){
          var override = dep[requirePath]
          node.arguments[0].update("'" + override + "'")
        }
      }
    })
    fs.writeFile(filepath, code, callback)
  })
}

function isRequire(node){
  return node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal' &&
    typeof node.arguments[0].value === 'string'
}

function readDeps(config){
  var ret = {}
  for (var repo in config.dependencies){
    var parts = repo.split('/')
    ret[parts[1]] = parts.join('-')
  }
  return ret
}

mutateModule('component-model', function(err){
  if (err) return console.error(err.message)
  console.log('done')
})