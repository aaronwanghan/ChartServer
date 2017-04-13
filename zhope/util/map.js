module.exports = function(){
		this.keys= new Array();
		this.data= new Object();
		
		this.put= function(key, value) { 
		
			if(this.data[key] == null){     
				this.keys.push(key);     
			}     
			this.data[key] = value;     
		};
		
		this.get= function(key) {     
			return this.data[key];     
		};
		
		this.remove= function(key) {     
			this.keys.remove(key);     
			this.data[key] = null;     
		};
		
		this.each= function(fn){     
			if(typeof fn != 'function'){     
				return;     
			}     
			var len = this.keys.length;     
			for(var i=0;i<len;i++){     
				var k = this.keys[i];     
				fn(k,this.data[k],i);     
			}     
		};
		
		this.entrys= function() {     
			var len = this.keys.length;     
			var entrys = new Array(len);     
			for (var i = 0; i < len; i++) {     
				entrys[i] = {     
					key : this.keys[i],     
					value : this.data[i]     
				};     
			}     
			return entrys;     
		};
		
		this.isEmpty= function() {     
			return this.keys.length == 0;     
		};
		
		this.size = function(){     
			return this.keys.length;     
		};
		
		this.toString= function(){     
			var s = "{";     
			for(var i=0;i<this.keys.length;i++,s+=','){     
				var k = this.keys[i];     
				s += k+"="+this.data[k];     
			}     
			s+="}";     
			return s;     
		};
		
		this.keySet= function(){
			return this.keys;
		};
};