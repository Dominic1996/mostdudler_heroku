var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
var params;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host : 'ec2-54-204-15-48.compute-1.amazonaws.com',
    port : 5432,
    user : 'xxedceoimtlzhm',
    password : 'fxEHniw4k0jdmAt_QtTjDW6eOE',
    database : 'd7941jfn7j2bm8'
});

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function(req, res) {
    params = req.body;
    
    console.log('POST');
    
    if (params['mod'] == "set") {
        pool.query("insert into gb_entries (name, ort, eintrag) values ( '"+params['name']+"', '"+params['ort']+"', '"+params['eintrag']+"' )", function(err, result) {
            if (!err)
                console.log(params);
            else
                console.log(err);
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('done');
    } else if (params['mod'] == "get") {
        res.writeHead(200, {'Content-Type': 'text/html'});
        console.log("Geladene Gaestebucheintraege:");
        pool.query("select * from gb_entries order by datum desc", function(err, rows, fields) {
            if (err) throw err;

            for (var i in rows) {
                console.log(rows[i]);
                
                var date = new Date(rows[i]['datum']);
                res.write("<div class='panel panel-primary'><div class='panel-heading '>"+rows[i]['name']+" aus "+rows[i]['ort']+" am "+date.getDate()+"."+((date.getMonth()+1) < 10 ? ("0"+(date.getMonth()+1)) : (date.getMonth()+1))+"."+date.getFullYear()+" "+(date.getHours() < 10 ? ("0"+date.getHours()) : date.getHours())+":"+(date.getMinutes() < 10 ? ("0"+date.getMinutes()) : date.getMinutes()) +"</div><div class='panel-body'>"+rows[i]['eintrag']+"</div></div>");
            }
            res.end();
        });
    }
});

process.on( 'SIGTERM', function () {
   server.close(function () {
     pool.close();
   });
});

app.listen(process.env.PORT);
console.log('Listening at '+process.env.hostname+':' + process.env.PORT)