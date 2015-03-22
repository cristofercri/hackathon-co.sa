var CronJob = require('cron').CronJob;
var filter = require('./filter');
var crawler = require('./crawler');
var dbmanager = require('./dbmanager');

function insertJob(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function() {
            dbmanager.connect(function(err) {
                if (!err) {
                    crawler.doEverything();
                } else {
                    console.log("Database no conectada");
                }
            });
        },
        start: true,
        timeZone: "Europe/Madrid"
    });
}

exports.insertJob = insertJob;

function filterJob(time) {
    var job = new CronJob({
        cronTime: time,
        onTick: function() {
            dbmanager.connect(function(err) {
                if (!err) {
                    filter.run();
                } else {
                    console.log("Database no conectada");
                }
            });
        },
        start: true,
        timeZone: "Europe/Madrid"
    });
}
exports.filterJob = filterJob;

