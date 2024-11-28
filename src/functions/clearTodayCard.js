const { app } = require('@azure/functions');
const {clearTodayCardStatusForAllUsers} = require('../services/database.service')

app.timer('clearTodayCard', {
    // schedule: '0 0 0 * * *', // midnight
    schedule: '0 */5 * * * *', // 5 min 
    handler: async (myTimer, context) => {
        context.log('Timer function processed request at:', new Date().toISOString());
    
        try {
          //clear today's card
          const result = await clearTodayCardStatusForAllUsers();

        } catch (err) {
          context.log('Error clearing today\'s card status:', err);
        }
    }
});
