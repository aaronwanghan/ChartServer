const exporter = require('highcharts-export-server');
const ProjectOperation = require('./zhope/entity/projectoperation');
const Utils = require("./zhope/util/utils");

var express = require('express');
var app = express();
var i = 0;
app.use(express.static('public'));

app.get('/',function(req,res){
	res.send('Chart Server!');
});

app.get('/createChart/:id',function(req,res){
	var start = new Date();
	console.log('start ' + start.format("yyyy-MM-dd hh:mm:ss"));
	console.log(req.params.id);
	var filename = (new Date()).getTime() + '.png';
	//console.log((i++)+" "+req.url);
	//res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
	
	res.send("http://115.47.119.233:8099/"+filename);
	
	var po = new ProjectOperation();
	po.read(req.params.id,function(ret){
		if(ret) {
			po.readPositions(function(pRet){
				if(pRet){
					po.readPositionDatas(function(dret){
						if(dret){
							po.createTChart(filename,function(ret){
								var end = new Date();
								console.log(end.getTime()-start.getTime());
								console.log('end ' + end.format("yyyy-MM-dd hh:mm:ss"));
							});
						}
					});
					
				}
			});
		}
	});
});

app.get('/testChart',function(req,res){
	
	//Export settings 
	var exportSettings = {
		type: 'png',
		options: {
			title: {
				text: 'My Chart'
			},
			xAxis: {
				categories: ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			},
			series: [
				{
					type: 'line',
					data: [1, 3, 2, 4]
				},
				{
					type: 'line',
					data: [5, 3, 4, 2]
				}
			]
		}
	};

	//Set up a pool of PhantomJS workers
	exporter.initPool();

	//Perform an export
	/*
		Export settings corresponds to the available CLI arguments described
		above.
	*/
	exporter.export(exportSettings, function (err, expRes) {
		//res.send(expRes.filename);
		var fs = require('fs');
		var path = './public/'+(new Date()).getTime()+'.png';
		fs.writeFile(path,Buffer.from(expRes.data, 'base64'),function(err){
			if(err) {
				res.send('error');
			} else {
				res.send(path);
			}
		});

		//res.writeHead('200',{'Content-Type':'image/png'});
		//res.end(Buffer.from(expRes.data, 'base64'));
		
		//res.send(expRes.data);
		//exporter.killPool();
		//process.exit(1);
	});
});

var server = app.listen(8099,function(){
	 var host = server.address().address
	var port = server.address().port
 
  console.log("server start! http://%s:%s", host, port)
});