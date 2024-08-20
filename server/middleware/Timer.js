const schedule = require('node-schedule')
const axios = require('axios')

const Timer = () => {
    schedule.scheduleJob('*/5 * * * *', () => {
        axios.get('https://darkpan-api.onrender.com/wake')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });
    })
}

module.exports = { Timer }