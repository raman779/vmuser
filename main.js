const cron = require('node-cron');
const main = require('./index')

cron.schedule('00 08 * * *', function() {
  try{
    main()
  }catch(error){
    console.log(error)
  }
 
    
  });
  