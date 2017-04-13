const http = require('http');
const request = require('request');
const iconv = require('iconv-lite');

const Utils = require("../util/utils");

var SERVER_PATH = "http://zkwl.admin.duqingwei.com:83";

var DATAS_SERVER_PATH = "http://www.z-hope.cn";
//var DATAS_SERVER_PATH = "http://10.168.165.202";
/*var GetData = function(res,callback){
	var data = '';
		
	res.on('data',function(chunk){
		data +=chunk;
	});
	
	res.on('end',function(){
		console.log('utf-8:' + iconv.decode(data, 'utf-8'));
		console.log('gb2313:' + iconv.decode(data, 'gb2312'));
		console.log('us-ascii:' + iconv.decode(data, 'us-ascii'));
		console.log('ascii:' + iconv.decode(data, 'ascii'));
		callback(JSON.parse(iconv.decode(data, 'gb2312')));
	})
};*/

exports.test = function(){
	console.log("test");
};

exports.findProjectOperation = function(oid,callback,errors){
	//http.get(SERVER_PATH+'/findProjectOperation.asp?oid='+oid,function(res){
	//	return GetData(res,callback);
	//});
	request(SERVER_PATH+'/findProjectOperation.asp?oid='+oid,function(err,res,body){
		if(!err){
			callback(JSON.parse(body));
		} else {
			errors();
		}
	});
};

exports.findPositions = function(pid,callback,errors){
	//http.get(SERVER_PATH+'/findPositions.asp?pid='+pid,function(res){
	//	return GetData(res,callback);
	//});
	
	request(SERVER_PATH+'/findPositions.asp?pid='+pid,function(err,res,body){
		if(!err){
			callback(JSON.parse(body));
		} else {
			errors();
		}
	});
};

exports.findPositionDatas = function(path,starttime,endtime,callback,errors) {

	var now = new Date();
	var datas = [];
	var num = 0;
	
	var read = function(date,readCallback){
		//console.log(date);
		if(date.getTime() > endtime.getTime() + 56*24*60*60*1000) {
			readCallback(true);
			return;
		}

		var url = "/mod/df.asp?fn="+escape("/NewLogs"+path+"/" + Utils.getFilename(date))+'&t='+(new Date()).valueOf();
console.log(url);
		Utils.readData(DATAS_SERVER_PATH+url,function(data){
			if(data.length>0){
				for(var i=0;i<data.length;i++) {
					
					var time = Utils.stringToDate(data[i].time);
					
					if(time.getTime()<endtime.getTime() + 60*60*1000){
						datas.push(data[i]);
					}	
					else 
					{
						readCallback(true);
						return;
					}
				}
			}
			
			readCallback(false);
			
		},function(){
			readCallback(false);
		});
	};
	
	var readCallback = function(ret){
		
		if(ret) {
			callback(datas);
			return;
		} else {
			num++;
			//console.log(num);
			var nextdate = Utils.timeToDate(starttime.getTime() + num*7*24*60*60*1000);
			//console.log("next:"+nextdate);
			if(nextdate.getTime() > now.getTime()+7*24*60*60*1000) {
				callback(datas);
				return;
			}
				
			read(nextdate,readCallback);
		}
	};

	read(starttime,readCallback);
};
