var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var conString = "postgres://xxedceoimtlzhm:fxEHniw4k0jdmAt_QtTjDW6eOE@ec2-54-204-15-48.compute-1.amazonaws.com:5432/d7941jfn7j2bm8";
var app = express();
var params;

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    //res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');

    // Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type');

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function(req, res) {
    params = req.body;
    
    console.log('POST');
    
    if (params['mod'] == "set") {
        pg.connect(conString, function(err, client, done) {
          if(err) {
            return console.error('error fetching client from pool', err);
          }
          client.query("insert into gb_entries (name, ort, eintrag) values ( '"+params['name']+"', '"+params['ort']+"', '"+params['eintrag']+"' )", function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
              return console.error('error running query', err);
            }
          });
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('done');
    } else if (params['mod'] == "get") {
        res.writeHead(200, {'Content-Type': 'text/html'});
        console.log("Geladene Gaestebucheintraege:");
        pg.connect(conString, function(err, client, done) {
          if(err) {
            return console.error('error fetching client from pool', err);
          }
          client.query("select * from gb_entries order by datum desc", function(err, result) {
            if(err) {
              return console.error('error running query', err);
            }
            for (var i in result.rows) {
                console.log(result.rows[i]);
                
                var date = new Date(result.rows[i]['datum']);
                res.write("<div class='panel panel-primary'><div class='panel-heading '>"+result.rows[i]['name']+" aus "+result.rows[i]['ort']+" am "+date.getDate()+"."+((date.getMonth()+1) < 10 ? ("0"+(date.getMonth()+1)) : (date.getMonth()+1))+"."+date.getFullYear()+" "+(date.getHours() < 10 ? ("0"+date.getHours()) : date.getHours())+":"+(date.getMinutes() < 10 ? ("0"+date.getMinutes()) : date.getMinutes()) +"</div><div class='panel-body'>"+result.rows[i]['eintrag']+"</div></div>");
            }
            res.end();
              
                
            //call `done()` to release the client back to the pool
            done();
          });
      });
    }
});

/*process.on( 'SIGTERM', function () {
   pg.close();
});*/

app.listen(process.env.PORT);
console.log('Listening at https://mostdudler.herokuapp.com:' + process.env.PORT)
