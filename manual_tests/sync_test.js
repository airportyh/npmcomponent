var sync = require('../lib/sync_module')

var credentials = require('../credentials.json')


/*
sync(credentials, 'component', 'collection', function(err){
  if (err) return console.error(err.message)
  console.log('Success!')
})
*/
/*
sync(credentials, 'component', 'enumerable', function(err){
  if (err) return console.error(err.message)
  console.log('Success!')
})
*/
sync(credentials, 'godmodelabs', 'spinner', function(err){
  if (err) return console.error(err.message)
  console.log('Success!')
})
