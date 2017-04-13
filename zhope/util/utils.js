Date.prototype.dateAdd = function(interval,number) 
{ 
    var d = this; 
    var k={'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds'}; 
    var n={'q':3, 'w':7}; 
    eval('d.set'+k[interval]+'(d.get'+k[interval]+'()+'+((n[interval]||1)*number)+')'); 
    return d; 
} 

Date.prototype.dateDiff = function(interval,objDate2) 
{ 
    var d=this, i={}, t=d.getTime(), t2=objDate2.getTime(); 
    i['y']=objDate2.getFullYear()-d.getFullYear(); 
    i['q']=i['y']*4+Math.floor(objDate2.getMonth()/4)-Math.floor(d.getMonth()/4); 
    i['m']=i['y']*12+objDate2.getMonth()-d.getMonth(); 
    i['ms']=objDate2.getTime()-d.getTime(); 
    i['w']=Math.floor((t2+345600000)/(604800000))-Math.floor((t+345600000)/(604800000)); 
    i['d']=Math.floor(t2/86400000)-Math.floor(t/86400000); 
    i['h']=Math.floor(t2/3600000)-Math.floor(t/3600000); 
    i['n']=Math.floor(t2/60000)-Math.floor(t/60000); 
    i['s']=Math.floor(t2/1000)-Math.floor(t/1000); 
    return i[interval]; 
}

Date.prototype.format = function(format)
{
	var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(), //day
            "h+" : this.getHours(), //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter
            "S" : this.getMilliseconds() //millisecond
        }
    if(/(y+)/.test(format))
    format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
    if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

Array.prototype.max = function(){ 
	return Math.max.apply({},this) 
} 
Array.prototype.min = function(){ 
	return Math.min.apply({},this) 
}

Array.prototype.addAll = function(array){
	
	if(array==null || array.length ==0)
		return;
	
	for(var i=0;i<array.length;i++) {
		this.push(array[i]);
	}
}

const request = require('request');

module.exports = {
		getRandomColor: function(){
			return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
		},

		stateToImg: function(state){
			switch(state)
			{
				case 0:
					return "platform_files/yellow.jpg";
				case 1:
					return "platform_files/red.jpg";
				case -1:
					return "platform_files/green.jpg";
				default:
					return "platform_files/green.jpg";
			}
		},
		
		stateToString: function(state){
			switch(state)
			{
				case 0:
					return "预警";
				case 1:
					return "报警";
				case -1:
					return "正常";
				default:
					return "正常";
			}
		},
		
		timeToDate: function(time){
			var date = new Date();
			date.setTime(time);
			
			return date;
		},
		
		timeToString: function(time){
			return this.timeToDate(time).format("yyyy-MM-dd hh:mm:ss");
		},
		
		stringToDate: function(str) {
			if(str && String(str).length > 0)
				return new Date(String(str).split('-').join('/'));
		},
		
		stringToTime: function(str){
			return this.stringToDate(str).getTime();
		},
		
		//in [time:xxx,t:xxx,t_type:xxx]
		//out [time,t,t_type]
		jsonToMonitorDatas: function(data,startTime,endTime){
			return this.jsonToTDatas(data,startTime,endTime);
		},
		
		jsonToDatas: function(data){
			//console.log("jsonToDatas:"+data.length);
			var findDataInsertNum = function(newdata,datas)
			{
				for(var j=datas.length;j>0;j--) {
					var odata = datas[j-1];
					
					var ntime = newdata.time;
					var otime = odata.time;
					
					if(otime < ntime)
						return j;
					
					if(otime == ntime)
						return null;
				}
				
				return 0;
			};
			
			var ret = [];
			if(data==null || data==undefined || data.length==undefined)
				return ret;
			
			for(var i=0;i<data.length;i++){
				var d = data[i];
				var newdata = {
					time: this.stringToTime(d.time),
					t: d.t,
					h: d.h
				};
				
				var num = findDataInsertNum(newdata,ret);
				//console.log(num);
				if(num !=null)
					ret.splice(num,0,newdata);
			}
			
			return ret;
		},
		
		jsonToTDatas: function(data,startTime,endTime){
			//console.log("jsonToDatas:"+data);
			console.log("jsonToTDatas start:"+(new Date()).format("yyyy-MM-dd hh:mm:ss"));
			
			var ret = [];
			var sdata = null;
			
			if(data==null || data==undefined || data.length==undefined)
				return ret;
	
			for(var i=0;i<data.length;i++)
			{
				var d = data[i];
				
				//console.log(d);
				
				if(!d.hasOwnProperty('t'))
					continue;
				
				var type = '-1';
				
				if(d.hasOwnProperty("t_type"))
					type = d.t_type
				
				if(startTime!=null && startTime.getTime() > this.stringToTime(d.time))
				{
					sdata=[
						startTime.getTime(),
						d.t,
						type
					];
					continue;
				}
				
				if(endTime!=null && endTime.getTime() < this.stringToTime(d.time))
					continue;

				var newdata = [this.stringToTime(d.time), d.t,type];
				
				var num = this.findInsertNum(newdata,ret);
				
				if(num!=null)
					ret.splice(num,0,newdata);	

			}

			if(ret.length>0){
				var startdata = ret[0];
				var enddata = ret[ret.length-1];
				
				if(startTime.getTime()<startdata[0])
					ret.splice(0,0,[
						startTime.getTime(),
						(sdata==null? startdata[1]:sdata[1]),
						(sdata==null? startdata[2]:sdata[2])
					]);
				
				if(endTime.getTime()>enddata[0])
					ret.push([
						endTime.getTime(),
						enddata[1],
						enddata[2]
					]);
			}
			
			if(ret.length==0 && sdata!=null)
				return [sdata];
			console.log("jsonToTDatas end:"+(new Date()).format("yyyy-MM-dd hh:mm:ss"));
			return ret;
		},
		
		jsonToHDatas: function(data,startTime,endTime){
			
			var ret = [];
			var sdata = null;
			
			if(data==null || data==undefined || data.length==undefined)
				return ret;
			
			for(var i=0;i<data.length;i++)
			{
				var d = data[i];
				
				if(!d.hasOwnProperty('h'))
					continue;
				
				var type = '-1';
				
				if(d.hasOwnProperty("h_type"))
					type = d.h_type
				
				if(startTime!=null && startTime.getTime() > this.stringToTime(d.time))
				{
					sdata=[
						startTime.getTime(),
						d.h,
						type
					];
					continue;
				}
				
				if(endTime!=null && endTime.getTime() < this.stringToTime(d.time))
					continue;

				var newdata = [this.stringToTime(d.time), d.h,type];
				
				var num = this.findInsertNum(newdata,ret);
				
				if(num!=null)
					ret.splice(num,0,newdata);	

				
				//if(type>=0)
				//	console.log(newdata);
			}
			
			if(ret.length>0){
				var startdata = ret[0];
				var enddata = ret[ret.length-1];
				
				if(startTime.getTime()<startdata[0])
					ret.splice(0,0,[
						startTime.getTime(),
						(sdata==null? startdata[1]:sdata[1]),
						(sdata==null? startdata[2]:sdata[2])
					]);
				
				if(endTime.getTime()>enddata[0])
					ret.push([
						endTime.getTime(),
						enddata[1],
						enddata[2]
					]);
			}
			
			if(ret.length==0 && sdata!=null)
				return [sdata];
			
			return ret;
		},
		
		findInsertNum: function(newdata,datas)
		{
			for(var j=datas.length;j>0;j--) {
				var odata = datas[j-1];
				
				var ntime = newdata[0];
				var otime = odata[0];
				
				if(otime < ntime)
					return j;
				
				if(otime == ntime)
					return null;
			}
			
			return 0;
		},
		
		readData: function(url,callback,errors){
			//console.log("readData start:"+(new Date()).format("yyyy-MM-dd hh:mm:ss"));
			/*$.ajax({
				type: 'get',
				url: url,
				async:	false,
				dataType:	'json',
				cache:	false,
				success: function(data){
					callback(data);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					errors();
				}
			});*/
			
			request(url,function(err,res,body){
				if(!err){
					//console.log("end:"+url);
					//console.log("body:"+body);
					if(body==null || String(body).length==0)
						callback([]);
					else 
						callback(JSON.parse(body));
				} else {
					errors();
				}
				
				//console.log("readData end:"+(new Date()).format("yyyy-MM-dd hh:mm:ss"));
			});
		},
		
		getFilename: function(d)
		{
			var yyyy = d.getFullYear();
			var date1 = new Date(yyyy, 0, 1);
			
			var date2 = new Date(yyyy-1, 0, 1);

			var ww;
			if(d.dateDiff("d",date1)<7 && d.dateDiff("d",date1)>-7 && d.getDay()>d.getDate())
			{
				d = date1.dateAdd("d",-1);;
				ww = Math.ceil((date2.dateDiff("d", d)+date1.getDay())/7);
				yyyy--;
			}
			else
			{
				ww = Math.ceil((date1.dateDiff("d", d)+date1.getDay())/7);
			}
			yyyy = "0000" + yyyy;
			ww = "00" + ww;
			return yyyy.substr(yyyy.length-4, 4) + ww.substr(ww.length-2, 2) + ".Log"
		},
		
		getQueryString: function(name){
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
				sURLVariables = sPageURL.split('&'),
				sParameterName,
				i;

			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=');

				if (sParameterName[0] === name) {
					return sParameterName[1] === undefined ? true : sParameterName[1];
				}
			}
			
			return '';
		},
		
		isIE: function(ver) {
			var b = document.createElement('b');
			b.innerHTML = '<!--[if IE ' + ver + ']><i></i><![endif]-->'
			return b.getElementsByTagName('i').length === 1;
		}
		
		/*,
		
		positionsSort: function(positions)
		{
			if(positions == null || positions.length<2)
				return postions;
			var ret = [];
			var grays =[];
			var reds = [];
			var yellows = [];
			var blues = [];
			var greens = [];
			
			for(var i=0;i<positions.length;i++) {
				var position = positions[i];
				
				if(postion.isDisabled==-1)
					grays.push(position);
				else if(position.tType==1 || position.hType==1)
					reds.push(position);
				else if(position.tType==0 || position.hType==0)
					yellows.push(position);
				else if(position.tType==2 || position.hType==2)
					grays.push(position);
				else if(position.tType==3 || position.hType==3)
					blues.push(position);
				else
					greens.push(position);
			}
			
			ret.addAll(reds);
			ret.addAll(yellows);
			ret.addAll(blues);
			ret.addAll(greens);
			ret.addAll(grays);
			
			return ret;
		}*/
		
};
