(function($){
	function checkedMove(dom, opt) {
		this.dom = dom;
		this.cfg = $.extend({
			max: '',
			data: [],
			selectedVal: [],
			callback: function(){}
		}, opt || {});

		this.lftDom = dom.find(".checked-move-lft"); //左边框dom
		this.rhtDom = dom.find("checked-move-rht"); //选中框（右侧）dom
		this.checkedVal = this.cfg.selectedVal; //已选择的元素

		this.init();
	}

	checkedMove.prototype.init = function() {
		this.setSkin();
		this.toRight(); //操作
		this.toLeft();
		this.callbackFn(this.cfg.selectedVal);
	}

	checkedMove.prototype.headerSkin = function(tit, num) {
		var header = '<div class="move-tit clearfix">'+
						'<label class="left"><input type="checkbox" value="all" class="check-all">' + tit + '</label>'+
						'<span class="right total-num">' + num + '</span>'+
					'</div>';
		return header;
	}

	checkedMove.prototype.searchSkin = function() {
		var search = '<div class="move-search">'+
						'<input type="text" placeholder="请输入商品名称" class="move-inp">'+
						'<span class="search-btn"></span>'+
					'</div>';
		return search;
	}

	checkedMove.prototype.setListSkin = function(dom, tit, data, hasDesc) { //设置左侧节点
		var chked = this.cfg.selectedVal,
			originData = this.cfg.data;
		var header = '';
		var search = this.searchSkin();
		var list = $('<div class="move-list"></div>');
		var listHtml = '';
		var curData = {};
		if(hasDesc) {
			header = this.headerSkin(tit, data.length - chked.length);
			for(var i=0; i<data.length; i++) {
				if(chked.indexOf(data[i].id) < 0){
					listHtml += '<div class="move-item clearfix">'+
								'<label class="left move-lft"><input type="checkbox" value="' +  data[i].id + '" class="check-item">' + data[i].title + '</label>'+
								'<span class="right move-rht">' + data[i].desc + '</span>'+
							'</div>';
				}
			}
		} else {
			header = this.headerSkin(tit, data.length);
			for(var m=0; m<data.length; m++) {
				for(var n = 0; n<originData.length; n++) {
					if(data[m] === originData[n].id){
						listHtml += '<div class="move-item clearfix">'+
								'<label class="left move-lft" data-desc="' + originData[n].desc + '"><input type="checkbox" value="' +  data[m] + '" class="check-item">' + originData[n].title + '</label>'+
							'</div>';
						break;
					}
				}
				
			}
		}
		
		list.append(listHtml);
		dom.append(header, search, list);
	}

	checkedMove.prototype.setLftSkin = function() { //设置左侧节点
		var data = this.cfg.data;
		var title = '厂商商品列表';
		this.lftDom = $('<div class="checked-move-item left checked-move-lft"></div>');
		this.setListSkin(this.lftDom, title, data, true);
	}

	checkedMove.prototype.setHandleSkin = function() {
		var handle = '<div class="move-handle left">'+
						'<div class="move-handke-box">'+
							'<div class="move-handle-arr move-handle-right"></div>'+
							'<div class="move-handle-arr move-handle-left"></div>'+
						'</div>'+
					'</div>';
		return $(handle);
	}

	checkedMove.prototype.setRhtSkin = function() {
		var data = this.cfg.selectedVal,
			title = '平台商品列表';

		this.rhtDom = $('<div class="checked-move-item left checked-move-rht"></div>');
		this.setListSkin(this.rhtDom, title, data);
	}

	checkedMove.prototype.setSkin = function() { //设置节点
		this.setLftSkin();
		this.setRhtSkin();
		var handle = this.setHandleSkin();
		this.dom.addClass("checked-move-box clearfix").append(this.lftDom, handle, this.rhtDom);
		this.checkFn(); //checkbox 事件
	}

	checkedMove.prototype.callbackFn = function(arr) {
		this.cfg.callback && this.cfg.callback(arr);
	}

	checkedMove.prototype.toRight = function() { //右移
		var self = this;
		this.dom.on('click', '.move-handle-right', function(e) {
			var chked = self.lftDom.find(".move-list input[type=checkbox]:checked"),
				lftHeader = self.lftDom.find(".move-tit"),
				lftNum = lftHeader.find(".total-num");
			var rhtNum = self.rhtDom.find(".total-num");
			var curDom = '',
				curVal = '';
			var len = parseInt(lftNum.text()) - chked.length;
			if(chked.length === 0) return alert("您还没有选择商品");
			lftNum.text(len);
			rhtNum.text(parseInt(rhtNum.text()) + chked.length);
			if(len <= 0){
				lftHeader.find("input[type=checkbox]").prop("checked", false);
			}
			for(var i=0; i<chked.length; i++) {
				curDom = chked.eq(i).parent();
				curVal = chked.eq(i).val();
				// chkArr.push({"id": chked.eq(i).val(), 'title': curDom.text(), 'desc': curDom.siblings("span").text()});
				self.checkedVal.push(curVal);
				self.rhtDom.find(".move-list").append('<div class="move-item clearfix"><label class="left move-lft" data-desc="' + curDom.siblings("span").text() + '"><input type="checkbox" value="' +  curVal + '" class="check-item">' + curDom.text() + '</label></div>')
				curDom.parent().remove();
			}
			self.callbackFn(self.checkedVal);
		});
	}
	checkedMove.prototype.toLeft = function() { //左移
		var self = this;
		this.dom.on('click', '.move-handle-left', function() {
			var chked = self.rhtDom.find(".move-list input[type=checkbox]:checked"),
				rhtHeader = self.rhtDom.find(".move-tit"),
				rhtNum = rhtHeader.find(".total-num"),
				lftNum = self.lftDom.find(".total-num");
			var curDom = '',
				curVal = '';
			var len = parseInt(rhtNum.text()) - chked.length;
			if(chked.length === 0) return alert("您还没有选择商品");
			rhtNum.text(len);
			lftNum.text(parseInt(lftNum.text()) + chked.length);
			if(len <= 0){
				rhtHeader.find("input[type=checkbox]").prop("checked", false);
			}
			for(var i=0; i<chked.length; i++) {
				curDom = chked.eq(i).parent();
				curVal = chked.eq(i).val();
				// chkArr.push({"id": chked.eq(i).val(), 'title': curDom.text(), 'desc': curDom.siblings("span").text()});
				self.checkedVal.splice(self.checkedVal.indexOf(curVal), 1);
				self.lftDom.find(".move-list").append('<div class="move-item clearfix"><label class="left move-lft"><input type="checkbox" value="' +  curVal + '" class="check-item">' + curDom.text() + '</label><span class="right move-rht">' + curDom.data("desc") + '</span></div>')
				curDom.parent().remove();
			}
			self.callbackFn(self.checkedVal);
		});
	}

	checkedMove.prototype.checkFn = function() {
		this.dom.on("change", "input.check-item", function() { //单选
			var $this = $(this),
				$list = $this.parents(".move-list"),
				$chk = $list.find("input.check-item"),
				$chked = $list.find("input.check-item:checked"),
				$chkAll = $list.siblings(".move-tit").find("input.check-all");
			if($this.is(":checked") && $chked.length === $chk.length){
				$chkAll.prop("checked", true);
			}else{
				if($chkAll.is(":checked")){
					$chkAll.prop("checked", false);
				}
			}
		});
		this.dom.on("change", 'input.check-all', function() {
			var $this = $(this),
				$tit = $this.parents(".move-tit"),
				$list = $tit.siblings(".move-list");
			if($this.is(":checked")) {
				$list.find("input.check-item").prop("checked", true);
			} else {
				$list.find("input.check-item").prop("checked", false);
			}
		});
	}

	$.fn.extend({
		moveToRht: function(options) {
			new checkedMove($(this), options);
			return this;
		}
	});
})(jQuery);














