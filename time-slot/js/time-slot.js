//投放时段
function timeSlotFn(obj, opt, callback){
	this.dom = obj;

	this.cfg = $.extend({
		'activeClass': "active",
		'selectId': '{}' //已选
	}, opt || {});


	this.mouseOn = false;
	this.mouseOnFn = null;
	this.callback = callback;

	this.startX = 0;
	this.startY = 0;

	this.domX = obj.offset().left;
	this.domY = obj.offset().top;

	this.selectTime = [{'week': 0, 'time':[]}, {'week': 1, 'time':[]},{'week': 2, 'time':[]},{'week': 3, 'time':[]},{'week': 4, 'time':[]},{'week': 5, 'time':[]},{'week': 6, 'time':[]}]; //[{'week': 1, 'time':[]}]

	this.$mask = null;

	this.addHtml(obj);
}
timeSlotFn.prototype.addHtml = function(obj){
	var weekArr = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
	var $headerTr = $('<tr></tr>');
	var headerTd = "";
	var bodyTd = "";
	var html = '<table class="time-slot-box" onselectstart="return false">'+
					'<tr onselectstart="return false">'+
						'<td rowspan="2" class="td_week">星期\\时间</td>'+
						'<td colspan="24">00:00-12:00</td>'+
						'<td colspan="24">12:00-24:00</td>'+
					'</tr>'+
				'</table>';
	var $table = $(html);
	var $foot = $('<tr><td colspan="49" class="footer"><a href="javascript:;" class="clear-all">清除所有</a></td></tr>')
	//数字
	for(var i=0; i<24; i++){
		headerTd += '<td colspan="2" onselectstart="return false">'+i+'</td>';
	}
	$headerTr.append($(headerTd)); //头部

	//星期
	for(var m=0; m<weekArr.length; m++){
		bodyTd += '<tr data-day="'+ m +'"><td onselectstart="return false">'+weekArr[m]+'</td>';
		for(var n=0;n<48;n++){
			bodyTd += '<td data-day="'+m+'" data-idx="'+n+'" class="hour-td"></td>';
		}
		bodyTd += '</tr>';
	}

	$table.append($headerTr, $(bodyTd), $foot);
	obj.append($table);

	this.initData($table);
	this._event(obj);
}
timeSlotFn.prototype.formatData = function(data){
	var tmp = [];
	var obj = JSON.parse(data);
	// for(var i=0; i<data.length; i++){
	// 	tmp.push({
	// 		'week': Object.keys(data[i]),
	// 		'time': data[i][Object.keys(data[i])]
	// 	});
	// }
	for(var key in obj){
		tmp.push({
			'week': parseInt(key)-1,
			'time': obj[key].split(",")
		})
	}
	return tmp;
}

timeSlotFn.prototype.initData = function($table){ //数据 初始化
	var selects = this.cfg.selectId;
	if(selects != {}){
		selects = this.formatData(selects);
	}
	if(selects.length <= 0) return;
	for(var i=0; i<selects.length; i++){
		var times = selects[i].time;
		var week = parseInt(selects[i].week);
		if(times.length <= 0) continue;
		for(var j=0; j<times.length; j++){
			// $table.find("tr").eq(week).find("td").eq(parseInt(times[j])+1).addClass("active");
			this.selectFn($table.find("tr").eq(week+2).find("td").eq(parseInt(times[j])+1));
		}
	}

	// this.callback && this.callback(this.selectTime, this.dom);

	if(this.callback){
		var data = this.setBackData(this.selectTime);
		this.callback(data, this.dom);
	}
}	

timeSlotFn.prototype.clearAll = function(){
	this.dom.find("."+this.cfg.activeClass).removeClass(this.cfg.activeClass);
	this.selectTime = [{'week': 0, 'time':[]}, {'week': 1, 'time':[]},{'week': 2, 'time':[]},{'week': 3, 'time':[]},{'week': 4, 'time':[]},{'week': 5, 'time':[]},{'week': 6, 'time':[]}];
}

timeSlotFn.prototype.clearEventBubble = function(e){ //去掉冒泡事件
    e.stopPropagation();
    e.preventDefault();
}

timeSlotFn.prototype.getXY = function(x, y){ //获取相对dom的left,top值
	var screenX = $(document).scrollLeft(),
	    screenY = $(document).scrollTop();

	var left = x + screenX - this.domX,
		top = y + screenY - this.domY;
	return {'x': left, "y": top};
}

timeSlotFn.prototype.addMask = function(x, y){ //添加遮罩层
	var xyNum = this.getXY(x,y);
	var left = xyNum.x,
		top = xyNum.y;
	var $mask = $('<div style="position: absolute; left: '+ left +'px; top: '+ top +'px; width:0; height: 0; border: 1px dashed #000; background: #3385ff; opacity: .2;"></div>');
	this.dom.append($mask);
	return $mask;
}

timeSlotFn.prototype.setMask = function(endX, endY){ //设置遮罩层
	var w = endX - this.startX,
		h = endY - this.startY;

	var xyNum = this.getXY(endX,endY);
	var left = xyNum.x,
		top = xyNum.y;

	if( w < 0){
		this.$mask.css({'left': left+"px"});
	}
	if(h < 0){
		this.$mask.css({'top': top+"px"});
	}
	this.$mask.css({'width': Math.abs(w)+"px", 'height': Math.abs(h)+"px"});
}
timeSlotFn.prototype.addSelectVal = function(obj){ //添加 选择项
	var day = obj.data("day"); //星期
	var idx = obj.data("idx"); //时段
	if(day == undefined){
		return false;
	}
	if(this.selectTime[day].time.indexOf(idx) > -1){
		return;
	}
	obj.addClass(this.cfg.activeClass);
	this.selectTime[day].week = day;
	this.selectTime[day].time.push(idx);
	// this.callback && this.callback(this.selectTime, this.dom);
}
timeSlotFn.prototype.deleteSelectVal = function(obj){ //删除 选择项
	var day = obj.data("day"); //星期
	var idx = obj.data("idx"); //时段
	var inx = this.selectTime[day].time.indexOf(idx);
	if(inx < 0) return;
	obj.removeClass(this.cfg.activeClass);
	this.selectTime[day].time.splice(inx, 1);
	// this.callback && this.callback(this.selectTime, this.dom);
}
timeSlotFn.prototype.selectFn = function(obj){ //设置值
	if(obj.hasClass(this.cfg.activeClass)){
		this.deleteSelectVal(obj);
	}else{
		this.addSelectVal(obj);
	}
}
timeSlotFn.prototype.allSelectFn = function(arr, bol){ //arr:dom数组， bol:是否是全部选择了
	for(var i=0; i<arr.length; i++){
		if(bol){
			this.deleteSelectVal(arr[i]);
		}else{
			this.addSelectVal(arr[i]);
		}
	}
}
timeSlotFn.prototype.isAllSelect = function(arr){ //dom数组，是否数组中的dom都已选中
	var selectTime = this.selectTime;
	var curDay = 0,
		curTime = 0;
	var times = [];
	var areadyNum = 0; //因存在的数目
	for(var i=0; i<arr.length; i++){
		curDay = arr[i].data("day");
		curTime = arr[i].data("idx");
		for(var m=0; m<selectTime.length; m++){
			if(curDay == selectTime[m].week && selectTime[m].time.indexOf(curTime)>-1){
				areadyNum ++;
			}
		}
	}
	if(areadyNum == arr.length){ //全选
		return true;
	}else{
		return false;
	}
}
timeSlotFn.prototype.setBackData = function(data){ //更改格式为[{0:[1,2]},{1:[2,4]}]
	var tmp = {};
	for(var i=0; i<data.length; i++){
		tmp[i+1]= data[i].time.join(",");
	}
	return JSON.stringify(tmp);
}

timeSlotFn.prototype._event = function(obj){
	var self = this;
	obj.on("click", ".hour-td", function(e){
		// self.clearEventBubble(e);
		var $this = $(this);
		self.selectFn($this);
		if(self.callback){
			var data = self.setBackData(self.selectTime);
			self.callback(data, self.dom);
		}
	});
	obj.on("mousedown", function(e){
		// var $this = $(this);
		self.clearEventBubble(e);
		var startX, startY;

		self.domX = obj.offset().left;
		self.domY = obj.offset().top;
		
		self.mouseOnFn = setTimeout(function(){
			self.mouseOn = true;
			self.startX = e.clientX;
			self.startY = e.clientY;
			self.$mask = self.addMask(self.startX, self.startY);
		}, 300);
		
	});
	obj.on("mouseover", function(e){
		self.clearEventBubble(e);
		if(!self.mouseOn) return;
		var $this = $(this);
		// self.selectFn($this, true);
		// var x = e.clientX;
		self.setMask(e.clientX, e.clientY);
	});
	obj.on("mouseup", function(e){
		self.clearEventBubble(e);
		// var $this = $(this);
		clearTimeout(self.mouseOnFn);
		self.mouseOn = false;
		if(!self.$mask) return;
		var maskLeft = self.$mask.offset().left, //遮罩层
			maskTop = self.$mask.offset().top,
			maskWidth = self.$mask.innerWidth(),
			maskHeight = self.$mask.innerHeight(),
			maskBtmLeft = maskLeft + maskWidth,
			maskBtmTop = maskTop + maskHeight;

		var $tds = $(this).find("td.hour-td");
		var $nowTd = null,
			nowLeft = 0,
			nowTop = 0,
			tdWidth = 0,
			tdHeight = 0;
		var selectObj = [];

		for(var i=0; i<$tds.length; i++){
			$nowTd = $tds.eq(i);
			tdWidth = $nowTd.innerWidth();
			tdHeight = $nowTd.innerHeight();
			nowLeft = $nowTd.offset().left;
			nowTop = $nowTd.offset().top,
			nowRht = nowLeft+tdWidth,
			nowBtm = nowTop+tdHeight;
			
			// if((maskLeft <= nowLeft && nowLeft<= maskBtmLeft && nowTop >= maskTop && nowTop <= maskBtmTop) || (nowRht >= maskLeft && nowRht <= maskBtmLeft && nowTop >= maskTop && nowTop <= maskBtmTop) || (nowLeft >= maskLeft && nowLeft <= maskBtmLeft && nowBtm >= maskTop && nowBtm<= maskBtmTop) || (nowRht >= maskLeft && nowRht <= maskBtmLeft && nowBtm >= maskTop && nowBtm <= maskBtmTop) || ()){ //td 四个角在区域内
			// 	// $nowTd.addClass("active");
			// 	// self.selectFn($nowTd);
			// 	selectObj.push($nowTd);
			// }
			if(nowRht > maskLeft && nowBtm > maskTop && nowLeft < maskBtmLeft && nowTop < maskBtmTop){
				selectObj.push($nowTd);
			}
		}
		var isAllBol = self.isAllSelect(selectObj);
		self.allSelectFn(selectObj, isAllBol);
		// self.callback && self.callback(self.selectTime, self.dom);
		if(self.callback){
			var data = self.setBackData(self.selectTime);
			self.callback(data, self.dom);
		}
		self.$mask.remove();
	});
	obj.on("click", ".clear-all", function(){
		self.clearAll();
		// self.callback && self.callback(self.selectTime, self.dom);
		if(self.callback){
			var data = self.setBackData(self.selectTime);
			self.callback(data, self.dom);
		}
	});
}

$.fn.extend({
	timeSlot: function(opt, callback){
		new timeSlotFn(this, opt, callback);
	}
});