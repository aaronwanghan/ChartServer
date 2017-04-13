
const dao = require("../dao/dao");
const Utils = require("../util/utils");
const Position = require('./position');
const Chart = require('../util/chart');
var className = "ProjectOperation";

exports.getClassName = function(){
	dao.test();
	return className;
};

module.exports = function(){
		this.id = 0;
		this.name = '';
		this.pid = 0;
		this.oStatus = 0;
		this.startTime = null;
		this.endTime = null;
		
		this.tmin = null;
		this.tmax = null;
		this.hmin = null;
		this.hmax = null;
		
		this.positions = [];

		this.setValue = function (data){
			this.id = data.id;
			this.name = data.name;
			this.pid = data.pid;
			this.oStatus = data.Status;
			this.startTime = Utils.stringToDate(data.starttime);
			this.endTime = Utils.stringToDate(data.endtime);
			this.tmin = data.tmin;
			this.tmax = data.tmax;
			this.hmin = data.hmin;
			this.hmax = data.hmax;
		};

		this.read = function (id,callback){
			var po = this;
			dao.findProjectOperation(id,function(data){
				console.log(data);
				po.setValue(data);
				
				if(callback!=undefined) {
					//console.log(name)
					callback(true);
				}
				
			},function(){
				if(callback!=undefined) {
					callback(false);
				}
			});
		};

		this.readPositions = function (callback){
			var po = this;
			po.positions = [];
			dao.findPositions(po.pid,function(data){
				//console.log(data);
				//console.log(data.length);
				if(data.length > 0 ){
					for(var i=0;i<data.length;i++){
						var p = new Position();
						p.setValue(data[i]);
						po.positions.push(p);
					}
				}
				
				callback(true);
			},function(){
				callback(false);
			});
		};

		this.readPositionDatas = function (callback){
			var po = this;
			if(po.positions.length>0 && po.startTime!=null && po.endTime!=null){
				var num =0;
				
				var findPositionDatas = function(i){
					
					if(i>=po.positions.length)
						return;
					
					setTimeout(function(){
						var p = po.positions[i];
						p.readDatas(po.startTime,po.endTime,function(ret){
							if(ret) {
								num++
								console.log(num);
							} else {
								callback(false);
								return;
							}
							
							findPositionDatas(i+1);
						});
						
						
					});
				};
				
				findPositionDatas(0);
				
				var interval = setInterval(function(){
					if(num == po.positions.length) {
						callback(true);
						clearInterval(interval);
					}
				});
			} else {
				callback(false);
			}
		};
		
		this.createTChart = function(filename,callback){
			var cp = this;
			var chart = new Chart();
			chart.title = cp.name;
			chart.yTitle = "温度";
			
			if(cp.tmin != null)
			{
				chart.min = cp.tmin;
				chart.addLine(cp.tmin,'blue',0,cp.tmin+"℃");
			}
			
			if(cp.tmax != null)
			{
				chart.max = cp.tmax
				chart.addLine(cp.tmax,'red',0,cp.tmax+"℃");
			}
			
			var num = 0;
			var addData = function(i){
				
				if(i>=cp.positions.length)
					return;
				
				setTimeout(function(){
					var p = cp.positions[i];
					//console.log(p.name+" "+p.datas.length);
					var d = Utils.jsonToTDatas(p.datas,cp.startTime,cp.endTime);
					if(d.length>0){
						var startdata = d[0];
						var enddata = d[d.length-1];
						
						if(cp.startTime.getTime()<startdata[0])
							d.splice(0,0,[
								cp.startTime.getTime(),
								startdata[1],
								startdata[2]
							]);
						
						if(cp.endTime.getTime()>enddata[0])
							d.push([
								cp.endTime.getTime(),
								enddata[1],
								enddata[2]
							]);
					}

					chart.addData(p.name,d);
					num++;
					addData(i+1);
				});
			}
			
			addData(0);
			
			var interval = setInterval(function(){
				if(num == cp.positions.length) {
					//console.log("chart saveChart");
					chart.saveChart(filename,callback);
					clearInterval(interval);
				}
			});
		};
		
		this.createHChart = function(callback){
			var chart = new Chart();
			
		};
};




