var CronJob = require('cron').CronJob;
var cfg = require('./config');
var fs = require('fs');
var dbmanager = require('./dbmanager');

function doEverything() {
    // Crea hijo Java que crawlea info
    dbmanager.erase(cfg.bd.HOT_SPOTS, function(err){
        if (err) {
           console.log("error borrado");
        } else {
           makeJavaChild(function(data) {
              var tmp;
              for (var i=0; i<data.length; i++) {
                 tmp = parseJSON(data[i]);
                 if (tmp.confidence > 30) {
                    dbmanager.insert(cfg.bd.HOT_SPOTS, parseJSON(data[i]));
                 } 
              }
              console.log("Introducidos " + data.length + " docs");
           });
        }
    });
}
exports.doEverything = doEverything;

function makeJavaChild(callback) {
    console.log("crawler.makeJavaChild()");
    var spawn = require('child_process').spawn;
    try {
       var java = spawn('java', ['-jar', '../serviceUtils/serviceUtils.jar', cfg.path.crawler], {detached: false, stdio: ['ignore', 'ignore','ignore']});
        java.on('close', function (code) {
           var data = JSON.parse(fs.readFileSync(cfg.path.crawler, "utf8"));
           console.log("makeJavaChild.makeJavaCrawler() the crawler dies");
           callback(data);
        
        });
    } catch (e) {
        console.log(e);
    }
}

function parseJSON(json) {
    var date = json.acq_date.trim().split("-");
    var newjson = {
          coordinates: {type: "Point", coordinates: [json.longitude, json.latitude]},
          windSpeed: json.windSpeed,
          date: new Date(date[0],date[1],date[2],json.acq_time.trim().substring(0,2),json.acq_time.trim().substring(2,4)),
          confidence: json.confidence,
          temperature: json.temperature,
          humidity: json.humidity,
          vegetation: json.vegetation,
          frp: json.frp,
          noise: 0.0
      };
    return newjson;
}
