var URL = 'https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB,EURRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

var notifier = require('node-notifier'),
    request = require('request'),
    Promise = require('promise');

function getRates(){
  return new Promise(function(resolve, reject){
    request(URL, function(error, response){
      if (error) {
        reject(error)
      }
      else {
        var rates = JSON.parse(response.body).query.results.rate.reduce(function(acc, value){
          acc[value.Name] = parseFloat(value.Rate);
          return acc;
        }, {});
        resolve(rates);
      }
    })
  });
}

var notify = function(text){
  if (text) {
    notifier.notify({
      title: 'Курс рубля',
      message: text,
      icon: __dirname + '/icon.png'
    });
  }
}

var collected = null;

var update = function(){
  getRates().then(function(rates){
    var text = '',
        keys = Object.keys(rates),
        showDiff = (collected != null);
    text = keys.reduce(function(acc, value){
      var diff;
      if (showDiff) {
        diff = (rates[value] - collected[value]).toFixed(2);
        if (diff > 0) {
          diff = "+" + diff;
        }
      }
      acc = acc + value+ ": " + rates[value];
      if (diff) {
        acc += "(" + diff + ")";
      }
      return  acc + "\n";
    }, "");
    collected = rates;
    notify(text);
  })
}


update();
setInterval(update, 1000*60*3);

require('daemon')();