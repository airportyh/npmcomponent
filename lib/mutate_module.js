var fs = require('fs')
var path = require('path')
var glob = require('glob')
var async = require('async')
var falafel = require('falafel')
var find = require('lodash.find')
var log = require('npmlog')
var assert = require('assert')

function mutateModule(user, repo, callback){
  assert(typeof user === 'string')
  assert(typeof repo === 'string')
  assert(typeof callback === 'function')

  var moduleName = user + '-' + repo
  log.info('mutating module ' + moduleName)
  var dirpath = 'repos/' + moduleName
  fs.readFile(path.join(dirpath, 'component.json'), function(err, data){
    if (err) {
      if (err.code === 'ENOENT'){
        return callback(null)
      }else{
        return callback(err)
      }
    }
    var config = JSON.parse('' + data)
    var deps = readDeps(config)
    glob(path.join(dirpath, '**/*.js'), function(err, files){
      async.eachLimit(files, 50, function(filepath, next){
        mutateFile(filepath, deps, next)
      }, function(err){
        if (err) return callback(err)
        mutatePackageJson(dirpath, moduleName, config, deps, function(err){
          if (err) return callback(err)
          modifyReadMe(dirpath, moduleName, callback)
        })
      })
    })
  })
}

function modifyReadMe(dirpath, moduleName, callback){
  log.info('modifying readme for ' + moduleName)
  var ReadMeFileNameRe = /^readme(\.(?:md|markdown|mdown|textile|rdoc|org|creole|mediawiki|rst|asciidoc|adoc|asc|pod))?$/i
  fs.readdir(dirpath, function(err, entries){
    if (err) return callback(err)
    var readme = find(entries, function(name){
      return name.match(ReadMeFileNameRe)
    })
    if (!readme) return callback(null)
    var readmePath = path.join(dirpath, readme)
    fs.readFile(readmePath, function(err, buf){
      var text = buf + ''
      var originalName = moduleName.replace('-', '/')
      var upstreamUrl = 'http://github.com/' + originalName
      var msg = '*This repository is a mirror of the [component](http://component.io) module [' + originalName + '](' + upstreamUrl + '). ' +
        'It has been modified to work with NPM+Browserify. ' +
        'You can install it using the command `npm install npmcomponent/' + moduleName + '`.*'
      text = msg + '\n' + text
      fs.writeFile(readmePath, text, callback)
    })
  })
}

function mutatePackageJson(dirpath, moduleName, config, deps, callback){
  log.info('mutating package.json')
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
  log.info('mutating file ' + filepath)
  fs.readFile(filepath, function(err, data){
    if (err) {
      if (err.code === 'ENOENT' || err.code === 'EISDIR'){
        return callback(null)
      }else{
        return callback(err)
      }
    }
    var code = '' + data
    try{
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
    }catch(e){
      var msg = 'Parse error reading file ' + filepath + ': ' + e.message
      log.warn(msg)
      callback(null)
    }
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

module.exports = mutateModule
