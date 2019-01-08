function tableFn(dom){
	this.dom = $(dom);
	this.lftDom = null;
	this.setSkin();

}
tableFn.prototype.setSkin = function(){
	var table = this.dom,
		trHeader = table.find(".ads-table-header table tr"),
		thTxt = trHeader.find("th").eq(1).text(),
		$tableBody = table.find(".ads-table-body"),
		trList = $tableBody.find("tr");
	//width
	this.addWidthFn($tableBody);

	this.lftDom = $('<div class="ads-body-lft"></div>');
	var lftHeader = $('<div class="ads-table-header">'+
						'<table class="list-table">'+
							'<colgroup>'+
						        '<col style="width: 40px;">'+
						        '<col style="width: 240px;">'+
							'</colgroup>'+
							'<thead>'+
								'<tr style="height: '+ trHeader.height() +'px">'+
									'<th><div class="ads-table-cell"><input type="checkbox" class="chk-all"></div></th>'+
									'<th><div class="ads-table-cell ads-name">'+ thTxt +'</div></th>'+
								'</tr>'+
							'</thead>'+
						'</table>'+
					'</div>');
	var lftBodyHtml = '<div class="ads-table-body">'+
						'<table class="list-table">'+
							'<colgroup>'+
						        '<col style="width: 40px;">'+
						        '<col style="width: 240px;">'+
							'</colgroup>'+
							'<tbody>';
	var item = null;
	var inpTd = "";
	var inpVal = "";
	var noneClass = "";
	var tdHtml = "";
	for(var i=0; i<trList.length; i++){
		if(trList.eq(i).is(":hidden")){
			noneClass = "none";
		}else{
			noneClass = "";
		}
		item = trList.eq(i).find("td").eq(1).clone(true);
		inpVal = trList.eq(i).find("input[type=checkbox]").val();
		tdHtml = item.html();
		if(inpVal){
			inpTd = '<div class="ads-table-cell"><input type="checkbox" class="chk-item" value="'+ inpVal +'"></div>'
		}else{
			inpTd = '';
		}
		if(item.html() == undefined){
			tdHtml = "";
		}
		
		lftBodyHtml += '<tr style="height: '+ trList.eq(i).height() +'px" class="'+ noneClass +'">'+
							'<td>'+ inpTd +'</td>'+
					    	'<td>'+ tdHtml +'</td>'+
						'</tr>';
	}
	lftBodyHtml += '</tbody>'+
				'</table>'+
			'</div>'+
		'</div>';
	this.lftDom.append(lftHeader, $(lftBodyHtml));
	if(table.siblings(".ads-body-lft").length > 0){
		table.siblings(".ads-body-lft").remove();
	}
	table.after(this.lftDom);
	
	this.tableScroll(table, this.lftDom)

	//全选
	var $chkAll = this.lftDom.find(".ads-table-header"),
		$tChkAll = this.dom.find(".ads-table-header");

	this.chkAllFn($chkAll, $tChkAll);

}
tableFn.prototype.addWidthFn = function($tableBody){ //设置宽度
	var cols = $tableBody.find("colgroup col");
	var tw = 0;
	for(var i=0; i<cols.length; i++){
		tw += cols.eq(i).width();
	}
	this.dom.width(tw);
}
tableFn.prototype.tableScroll = function(table, $lftDom){ //左右滚动 左侧、头部显示
	// var $tHeader = $tableBody.siblings(".ads-table-header").find('table'),
	var $lftBody = $lftDom.find(".ads-table-body");
	console.log(this.dom.attr("class"))

	table.parent().on("scroll", function(){
		var lft = this.scrollLeft;
		var top = this.scrollTop;
		// $tHeader.css({'margin-left': '-'+lft+'px'});
		$lftDom.css("left", lft);
		if(lft > 0){
			$lftDom.addClass("lft-show");
		}else{
			$lftDom.removeClass("lft-show");
		}
		if(top > 0){
			$lftBody.find("table").css({'margin-top': '-'+top+'px'}); //上下滚动 左侧显示
		}
	});
}

tableFn.prototype.chkAllFn = function($header, $tChkAll){
	var $chkItem = $header.siblings(".ads-table-body").find("input[type=checkbox].chk-item");
	$header.on("change", "input.chk-all", function(){
		var self = $(this);
		var bol = self.prop("checked");
		$chkItem.prop("checked", bol);
		$tChkAll.find("input.chk-all").change();
	});

	$chkItem.on("change", function(){ //单选
		var self = $(this),
			sp = self.parents(".ads-table-body"),
			spSib = sp.siblings(".ads-table-header").find("input.chk-all");
		var allLen = sp.find("input.chk-item").length,
			chkLen = sp.find("input:checked").length;
		
		if(allLen == chkLen){
			spSib.prop("checked", true);
		}else{
			spSib.prop("checked", false);
		}
	});
}

$.fn.extend({
	tableFrozen: function(){
		new tableFn(this);
	}
})