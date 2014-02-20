var fs = require('fs')
var path = require('path')
var glob = require('glob')
var async = require('async')
var falafel = require('falafel')
var find = require('lodash.find')
var log = require('npmlog')
var assert = require('assert')
var Repo = require('./repo')
var stringToJs = require('string-to-js')

function mutateModule(repo, callback){
  assert(repo instanceof Repo)
  assert(typeof callback === 'function')

  log.info(repo, 'mutating module')
  fs.readFile(path.join(repo.dirpath(), 'component.json'), function(err, data){
    if (err) {
      if (err.code === 'ENOENT'){
        log.error(repo, 'component.json not found.')
        return callback(null)
      }else{
        return callback(err)
      }
    }
    var config = JSON.parse('' + data)
    var deps = readDeps(config)
    var jsFiles = config.scripts.map(function(script){
      return path.join(repo.dirpath(), script)
    })
    var templateFiles = config.templates.map(function(template){
      return path.join(repo.dirpath(), template)
    })
    async.eachLimit(jsFiles, 50, function(filepath, next){
      mutateJsFile(filepath, repo, deps, next)
    }, function(err){
      async.eachLimit(templateFiles, 50, function(filepath, next){
        mutateTemplateFile(filepath, repo, next)
      }, function(err){
        if (err) return callback(err)
        mutatePackageJson(repo, config, deps, function(err){
          if (err) return callback(err)
          modifyReadMe(repo, callback)
        })
      })
    })
  })
}

function modifyReadMe(repo, callback){
  log.info(repo, 'modifying readme for')
  var ReadMeFileNameRe = /^readme(\.(?:md|markdown|mdown|textile|rdoc|org|creole|mediawiki|rst|asciidoc|adoc|asc|pod))?$/i
  fs.readdir(repo.dirpath(), function(err, entries){
    if (err) return callback(err)
    var readme = find(entries, function(name){
      return name.match(ReadMeFileNameRe)
    })
    if (!readme) return callback(null)
    var readmePath = path.join(repo.dirpath(), readme)
    fs.readFile(readmePath, function(err, buf){
      var text = buf + ''
      var originalName = repo.originalName()
      var upstreamUrl = 'http://github.com/' + originalName
      var msg = '*This repository is a mirror of the [component](http://component.io) module [' + originalName + '](' + upstreamUrl + '). ' +
        'It has been modified to work with NPM+Browserify. ' +
        'You can install it using the command `npm install npmcomponent/' + repo.newName() + '`.*'
      text = msg + '\n' + text
      fs.writeFile(readmePath, text, callback)
    })
  })
}

function mutatePackageJson(repo, config, deps, callback){
  log.info('mutating package.json')
  var packageConfig = {
    name: repo.newName(),
    description: config.description,
    version: config.version,
    keywords: config.keywords,
    main: config.main,
    styles: config.styles,
    dependencies: packageJsonDeps(deps),
    license: config.license
  }
  fs.writeFile(path.join(repo.dirpath(), 'package.json'), 
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

function mutateJsFile(filepath, repo, dep, callback){
  log.info(repo, 'mutating file ' + filepath)
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
          }else{
            if (requirePath[0] === '.'){
              // relative path
            }else{
              log.warn(repo, 'require not found: ' + requirePath)
              if (node.parent.type === 'VariableDeclarator' &&
                node.parent.parent.type === 'VariableDeclaration'){
                // unknown require, make it go away
                // probably used to reference alternative name in node
                node.parent.parent.update('')
              }
            }
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

function mutateTemplateFile(filepath, repo, callback){
  log.info(repo, 'mutating template file ' + filepath)
  fs.readFile(filepath, function(err, data){
    if (err) return callback(err)
    fs.writeFile(filepath + '.js', stringToJs(data + ''), function(err){
      if (err) return callback(err)
      fs.unlink(filepath, callback)
    })
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
