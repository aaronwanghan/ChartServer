const Map = require("./map");
const Utils = require("./utils");
const exporter = require('highcharts-export-server');

module.exports = function(){
	this.title= "Chart";
	this.yTitle = "values";
	this.lines= [];
	
	this.colors = new Map();
	
	this.datas= new Map();
	this.legendDiv= null;
	this.legend = false;
	this.legendMaxNum = 2;
	this.navigatorEnabled = true;
	
	this.min = null;
	this.max = null;
	
	this.showMAXMIN = false;
	this.chartMaxHeight = 0;

	this.addData= function(name,data) {
		//console.log("addData:"+name);
		//console.log(data.length);
		if(this.datas == null)
			this.datas = new Map();
		
		var datas = [];
		
		for(var i=0;i<data.length;i++) {
			var d = data[i];
			var time = d[0] + 8*60*60*1000;
			var value = parseFloat(d[1]);

			datas.push([time,value]);
			
			if(this.min==null || this.min > value)
				this.min = value;
			
			if(this.max==null || this.max < value)
				this.max = value;
		}
		
		this.datas.put(name,datas);
	};
		
	this.addColorData = function(name,data,color){
		this.addData(name,data);
		this.colors.put(name,color);
	};
	
	this.addLine= function(num,color,x,content)
	{
		var data = [];
		
		data.push(num);
		data.push(color);
					
		data.push((x==undefined? 0:x));
		
		if(content!=undefined)
			data.push(content);
		
		this.lines.push(data);
	};
	
	this.clearLines= function(){
		this.lines = [];
	};
	
	this.clearDatas= function(){
		this.datas = new Map();
		this.title = "";
		this.lines = [];
	};
	
	this.saveChart= function(filname,callback){
		var chart = this;
		var option = chart.createOption();
		//console.log(option);
		var exportSettings = {
			type: 'png',
			options: option,
			width: 600
		};
		exporter.initPool();
		exporter.export(exportSettings, function (err, expRes) {
		//res.send(expRes.filename);
		var fs = require('fs');
		var path = './public/'+ filname;
		//console.log(path);
		fs.writeFile(path,Buffer.from(expRes.data, 'base64'),function(err){
			if(err) {
				console.log("err:"+err)
				callback(null);
			} else {
				callback(filname);
			}
		});
	});
	};
	
	this.createOption= function(){
		
		var option = new Object();
		//var enabled = true;
		
		//if(Utils.isIE(8) || Utils.isIE(7) || Utils.isIE(6))
		//	enabled = false;
		
		option.chart = {
			width:1024,
			height:768
		};
		
		option.navigator = {
			enabled: false
		};
		
		option.lang = {
			weekdays:['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
			months:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
			shortMonths:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
		};
		
		option.plotOptions = {
			series: {
				marker: {
					enabled: false
					//lineWidth: 1
				}
			}
		};
		
		//option.exporting = {
		//	enabled: false
		//};
		
		//zoom
		/*option.rangeSelector = {
			//enabled:false,
			allButtonsEnabled: true,
			selected: 4,
			buttons: [
				{
					type: 'hour',
					count: 1,
					text: '1小时'
				},
				{
					type: 'hour',
					count: 3,
					text: '3小时'
				},
				{
					type: 'hour',
					count: 12,
					text: '12小时'
				},
				{
					type: 'all',
					text: '全部'
				}
			]
		};*/
		
		/*if(this.legendDiv==null || this.legend )
		{
			//Utils.divRemoveAllChild(this.legendDiv);
			//图例
			option.legend = {
				enabled: true,
				align: 'right',
				verticalAlign: 'top',
				borderColor: 'black',
				borderWidth: 2,
				layout: 'vertical',
				y : 60,
				shadow: true
			};
		}*/
		
		option.tooltip = {
			//enabled:enabled,
			shared: true,
			crosshairs: true,
			dateTimeLabelFormats:{
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%m月%e日',
				week: '%m月%e日',
				month: '%y年%m月',
				year: '%Y'
			}
		};
		
		option.xAxis = {
			type: 'datetime',
			dateTimeLabelFormats:
			{
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%m月%e日',
				week: '%m月%e日',
				month: '%y年%m月',
				year: '%Y'
			}
		};
		
		option.title = { text: this.title };
		
		//添加曲线
		var names = this.datas.keySet();
		option.series = [];
		if(names.length >0) 
		{
			//var tds = [];
			
			for(var i=0;i<names.length;i++)
			{
				var name = names[i];
				var datas = this.datas.get(name);
				var color = (this.colors.get(name)==undefined? Utils.getRandomColor():this.colors.get(name));
				//console.log(color);
				option.series.push({
					name: name,
					data: datas,
					color: color,
					lineWidth: 1,
					tooltip: {
						//enabled:enabled,
						valueDecimals: 2,
						shared: true,
						crosshairs: true,
						dateTimeLabelFormats:{
							second: '%H:%M:%S',
							minute: '%H:%M',
							hour: '%H:%M',
							day: '%m月%e日',
							day: '%m月%e日',
							month: '%y年%m月',
							year: '%Y'
						}
					}
				});
				
				//tds.push("<td>"+ "<div style='background-color:" + color +";width:5px;height:5px;margin:5px;left:-10px;float:left;'></div>" +
				//			name +"</td>");
			}
			
			//this.showLegenDiv(tds);
		}
		
		//添加辅助线
		option.yAxis = {
			title: {
				text: this.yTitle
			},
			labels: {
				x: 10
			},
			plotLines:[]
		};
		
		//if(this.showMAXMIN){
		if(this.max!=null)
			option.yAxis.max = parseFloat(this.max)+1;
	
		if(this.min!=null)
			option.yAxis.min = parseFloat(this.min)-1;
		//}
		
		
		//option.yAxis.plotLines = [];
		if(this.lines.length >0)
		{
			for(var i=0;i<this.lines.length;i++)
			{
				var l = this.lines[i];
				option.yAxis.plotLines.push({
					value: l[0],
					color: l[1],
					dashStyle: 'LongDash',
					width: 2,
					label: {
						text: (l[3]==undefined? l[0]:l[3]),
						x: l[2],
						y: -5
					}
				});
			}
		}
		
		return option;
	};
};