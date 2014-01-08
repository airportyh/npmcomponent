var mutateModule = require('../lib/mutate_module')

mutateModule('LearnBoost-expect.js', function(err){
  if (err) return console.error(err.message)
  console.log('done')
})
