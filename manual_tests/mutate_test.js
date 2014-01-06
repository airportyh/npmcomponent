var mutateModule = require('../lib/mutate_module')

mutateModule('semfact-dexdis', function(err){
  if (err) return console.error(err.message)
  console.log('done')
})
