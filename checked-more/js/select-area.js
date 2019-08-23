//地域 选择
function selectArea(dom, opt, callback){
	this.dom = dom;
	if(opt.selectArr.indexOf("999") > -1 && opt.selectArr.length == 1){
		opt.selectArr = [];
	}
	this.cfg = $.extend({
		data:[],
		max: 500, //最多可选
//		selectNum: [], //已选择
		selectArr: [], //已选择
	}, opt || {});
	this.callback = callback;
	this.setSkin(); //皮肤
	// this.selectArr = {}; //已选 项
	this.dom.off("click", '.option-txt');
	this.dom.on('click', '.option-txt', function(){ //添加class
		var $this = $(this),
			tp = $this.closest(".option-child-item");
		
		if(tp.length == 0){
			tp = $this.closest(".option-list-item");
		}
		if(tp.hasClass("option-down")){
			tp.removeClass("option-down");
		}else{
			tp.addClass("option-down");
		}
	});
	this.searchFn(); // 搜索
}

selectArea.prototype.setSkinChildLft = function(item){ //左侧 添加数据
	var listItemDom = '<li class="option-child-item">';
	var itemChild = item.children; //子菜单data
	if(itemChild && itemChild.length > 0){
		listItemDom += '<p class="option-item"><input type="checkbox" value="'+ item.id +'" class="parent-chk"><span class="option-txt"><i class="arr-right"></i>'+ item.title +'</span></p><ul class="option-child">';
		for(var j=0; j<itemChild.length; j++){
			listItemDom += this.setSkinChildLft(itemChild[j]);
		}
		listItemDom += '</ul>';
	}else{
		listItemDom += '<label><input type="checkbox" value="'+ item.id +'"><span>'+ item.title +'</span></label>';
	}
	listItemDom += '</li>';
	return listItemDom;
}

selectArea.prototype.setSkinLft = function(data, searchVal){ //绑定数据 左侧
	this.dom.addClass("option-select-main"); //添加class
	var lftDom = $('<div class="option-select-lft option-select-data">'+
						'<div class="option-search"><input type="text" placeholder="搜索" class="input" value="'+ (searchVal || '') +'"><a href="javascript:;" class="index-icon-box icon-search search-btn"></a></div>'+
					'</div>');
	var lftListDom = $('<ul class="option-list"></ul>');
	var listItemDom = '';
	var itemChild = ''; //子菜单data
	for(var i=0; i<data.length; i++){
		listItemDom += this.setSkinChildLft(data[i]);
	}
	lftListDom.append(listItemDom);
	lftDom.append(lftListDom);
	this.dom.prepend(lftDom);
}
selectArea.prototype.setSkinRht = function(chk){ //绑定数据 右侧
	var maxTxt = "";
	if(this.cfg.max != "" || this.cfg.max > 0){
		maxTxt = '可选'+ this.cfg.max +'个,';
	}
	var rhtDom = $('<div class="option-select-lft option-selected">'+
					'<div class="option-search clearfix">'+ maxTxt +'已选择<span id="selectNum">'+ this.cfg.selectArr.length +'</span>个<a href="javascript:;" class="clear-dom f-r">清空</a></div>'+
				'</div>');
	var rhtUl = $('<ul class="option-selected-arr"></ul>');
	rhtDom.append(rhtUl);
	this.dom.append(rhtDom);
}
selectArea.prototype.initFn = function(){ //编辑 初始化 右侧添加数据，左侧添加是否选中
	var chk = this.dom.find(".option-child-item input[type=checkbox]"),
		chkp = this.dom.find(".option-item input[type=checkbox]");
	var selectArr = this.cfg.selectArr;
	for(var i=0; i<chk.length; i++){
		if(selectArr.indexOf(chk.eq(i).val()) > -1){
			chk.eq(i).attr("checked", true);
			// chk.eq(i).trigger("change");
			this.dom.find(".option-selected-arr").append('<li data-id="'+ chk.eq(i).val() +'"><span class="f-l">'+ chk.eq(i).siblings('span').text() +'</span><a href="javascript:;" class="close f-r">X</a></li>');
			this.setParentChk(chk.eq(i));
		}
	}
	
	for(var j=0; j<chkp.length; j++){
		if(selectArr.indexOf(chkp.eq(j).val()) > -1){
			chkp.eq(j).attr("checked", true);
			// chkp.eq(j).trigger("change");
			this.dom.find(".option-selected-arr").append('<li data-id="'+ chk.eq(j).val() +'"><span class="f-l">'+ chk.eq(j).siblings('span').text() +'</span><a href="javascript:;" class="close f-r">X</a></li>');
		}
	}
	this.callbackFn();
}

selectArea.prototype.setParentChk = function(chk){ //设置父级 状态
	var chkUl = chk.parents(".option-child"),
		chkP = null;
	var liLen = 0,
		liChkLen = 0;
	if( chkUl.length > 0 ){
		chkP = chkUl.parent();
		liLen = chkUl.find("li").length;
		liChkLen = chkUl.find("li > label > input[type=checkbox]:checked").length;
		if(!chkP.hasClass("option-down")){
			chkP.addClass("option-down");
		}
		if(liLen === liChkLen){
			chkUl.siblings("p").find("input[type=checkbox]").attr("checked", true);
		}
	}
}

selectArea.prototype.setSkin = function(){
	var selectDom = this.dom.find(".option-select-lft");
	if(selectDom.length > 0){
		selectDom.remove();
	}
	
	this.setSkinLft(this.cfg.data);
	this.setSkinRht();

	this.checkFn();
	this.deleteItem(); //删除
	this.clearAll(); //清空
	if(this.cfg.selectArr.length > 0){
		this.initFn();
	}
}

selectArea.prototype.checkFn = function(){ //checkbox 
	var _this = this;
	this.dom.off("change", "input[type=checkbox].parent-chk");
	this.dom.on("change", "input[type=checkbox].parent-chk", function(){ //全选 反选
		var self = $(this),
			sp = self.parents(".option-item"),
			sib = sp.siblings(".option-child"),
			sibCheckbox = sib.find("input[type=checkbox]");
		
		if(sib.length > 0){
			if(self.is(":checked")){
				for(var i=0; i<sibCheckbox.length; i++){
					sibCheckbox.eq(i).prop("checked", true);
					if(_this.setSelect(sibCheckbox.eq(i)) == 'continue'){
						self.prop("checked", false);
						if(sibCheckbox.eq(i).closest(".option-child").siblings("p.option-item").length > 0){ //如果有第三级
							sibCheckbox.eq(i).closest(".option-child").siblings("p.option-item").find("input[type=checkbox]").prop("checked", false);
						}
						break;
					}
				}

			}else{
				sibCheckbox.prop("checked", false);
				for(var i=0; i<sibCheckbox.length; i++){
					_this.setSelect(sibCheckbox.eq(i));
				}
			}
		}else{
			_this.setSelect(self);
		}

		_this.callbackFn(); //回调
	});
	this.dom.off("change", ".option-child-item > label > input[type=checkbox]");
	this.dom.on("change", ".option-child-item > label > input[type=checkbox]", function(){ //子 选择
		var self = $(this),
			sp = self.closest(".option-child"),
			sibLi = sp.find("li.option-child-item"),
			spInp = sp.siblings(".option-item").find("input[type=checkbox]");
		// sp.css("background", "#ccc");
		_this.setSelect(self);
		if(sibLi.length === sibLi.find("input:checked").length){
			spInp.prop("checked", true);
		}else{
			spInp.prop("checked", false);
		}

		_this.callbackFn(); //回调
	});
}
selectArea.prototype.setSelect = function(chk){ //右侧列表 设置
	var $sp = chk.parent();
	if(chk.is(":checked")){
		if(this.cfg.selectArr.indexOf(chk.val()) > -1){
			return false;
		}
		if($sp[0].tagName == "P") return;
		if(!this.setNumFn(this.cfg.selectArr.length+1)){ //是否还可以继续选择
			chk.prop("checked", false);
			return 'continue';
		}
		this.cfg.selectArr.push(chk.val());
		this.dom.find(".option-selected-arr").append('<li data-id="'+ chk.val() +'"><span class="f-l">'+ chk.siblings('span').text() +'</span><a href="javascript:;" class="close f-r">X</a></li>');
	}else{
		this.cancelChked(chk); //右侧删除
		// this.cfg.selectNum.splice(this.cfg.selectNum.indexOf(chk.val()), 1);
		this.setNumFn();
	}
	// this.setNumFn();
	// this.callbackFn(); //回调
}
selectArea.prototype.deleteItem = function(){ //删除
	var _this = this;
	this.dom.off("click", ".option-selected-arr .close");
	this.dom.on("click", ".option-selected-arr .close", function(){
		var $li = $(this).parents("li"),
			id = $li.data("id").toString();
		var chks = $(this).parents("div.option-select-lft").siblings("div.option-select-lft").find("input:checked");
		var chkId = 0;
		$li.remove();
		_this.cfg.selectArr.splice(_this.cfg.selectArr.indexOf(id), 1);
		for(var i=0; i<chks.length; i++){
			chkId = chks.eq(i).val();
			if(chkId == id){
				chks.eq(i).prop("checked", false);
				if(chks.eq(i).parents(".option-child").siblings(".option-item").length > 0){
					chks.eq(i).parents(".option-child").siblings(".option-item").find("input[type=checkbox]").prop("checked", false);
				}
				break;
			}
		}
		_this.setNumFn();
		_this.callbackFn(); //回调
	});
}
selectArea.prototype.cancelChked = function(dom){ //取消
	var id = dom.val();
	var selectedList = dom.parents("div.option-select-lft").siblings("div.option-select-lft").find(".option-selected-arr li"),
		liId = 0;
	if(!dom.is(":checked")){
		for(var i=0; i<selectedList.length; i++){
			liId = selectedList.eq(i).data("id");
			if(liId == id){
				selectedList.eq(i).remove();
				this.cfg.selectArr.splice(this.cfg.selectArr.indexOf(id), 1);
				break;
			}
		}
	}
}
selectArea.prototype.searchFn = function(){ //搜索
	var _this = this;
	var data = _this.cfg.data;
	_this.dom.off("click", ".search-btn");
	_this.dom.on("click", ".search-btn", function(){
		var searchData = [];
		var searchChild = [];
		var self = $(this);
		var inpVal = self.siblings("input[type=text]").val();
		for(var i=0; i<data.length; i++){
			if(data[i].title.indexOf(inpVal) > -1){
				searchData.push(data[i]);
			}else if(data[i].children){
				searchChild = [];
				for(var j=0; j<data[i].children.length; j++){
					if(data[i].children[j].title.indexOf(inpVal) > -1){
						searchChild.push(data[i].children[j]);
					}
				}
				if(searchChild.length > 0){
					searchData.push({'id': data[i].id, 'title': data[i].title, 'children': searchChild});
				}
			}
		}
		_this.dom.find(".option-select-lft").eq(0).remove();
		// console.log(searchData, '---searchData-----', inpVal);
		_this.setSkinLft(searchData, inpVal);
	});
}

selectArea.prototype.clearAll = function(){ //清空
	var _this = this;
	this.dom.off("click", ".clear-dom");
	this.dom.on("click", ".clear-dom", function(){
		_this.cfg.selectArr = [];
		_this.dom.find("input:checked").prop("checked", false);
		_this.dom.find(".option-selected-arr li").remove();

		_this.setNumFn();
		_this.callbackFn(); //回调
	});
}
selectArea.prototype.setNumFn = function(num){ //已选 数字
	num = num || this.cfg.selectArr.length;
	if(num > parseInt(this.cfg.max) && (this.cfg.max != 0 || this.cfg.max != "")){
		layer.msg("最多可选"+this.cfg.max+"个");
		return false;
	}
	this.dom.find("#selectNum").html(num);
	return true;
}
selectArea.prototype.callbackFn = function(){
	this.callback && this.callback(this.cfg.selectArr, this.dom); //回调
	// console.log(this.cfg.selectNum,'=this.cfg.selectNum======')
}


function create(dom, opt, callback){
	new selectArea(dom, opt, callback);
}

$.fn.extend({
	selectArea: function(opt, callback){
		this.each(function(i,dom){
            create($(dom), opt, callback);
            return this;
        });
	}
});