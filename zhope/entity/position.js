
const dao = require("../dao/dao");

module.exports = function(){
		this.id = 0;
		this.name = '';
		this.card = '';
		this.path = '';
		this.types = [];

		this.datas = [];

		this.setValue = function(data){
			this.id = data.id;
			this.name = data.name;
			this.card = data.card;
			this.path = data.path;
			this.types = String(data.types).split(',');
		};

		this.readDatas = function(starttime,endtime,callback){
			var p = this;
			dao.findPositionDatas(this.path,starttime,endtime,function(data){
				p.datas = data;
				console.log("readDatas:"+p.datas.length);
				callback(true);
			},function(){
				callback(false);
			});
		};
};



