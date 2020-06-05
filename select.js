//创建节点
function selectFun(dom,opt){
    var $dom = $(dom);
    var dtw = this.dtw = $dom.outerWidth();//宽度
    this.box = $('<div class="js-select-box"></div>');
    this.tit = $('<div class="js-select-tit" style="width:'+dtw+'px"><i class="js-arr"></i></div>');
    this.menu = $('<div class="js-select-menu"></div>');
    this.titSpan = $('<span style="width:'+(dtw-7)+'px"></span>');
    this.box.append(this.tit.append(this.titSpan)).append(this.menu);

    this.dom = dom;
    this.cfg = this.getConfig(opt);
     
    //追加节点
    if($dom.attr("data-skin") === "true"){
        $dom.next("div.js-select-box").remove();
    }else{
        $dom.attr("data-skin","true");
    }
    $dom.after(this.box);
    $dom.hide();

    //是否添加icon
    if($dom.attr("has-icon") == 'true'){
        this.titSpan.before("<i class='icon-box'></i>")
        this.titSpan.width((dtw - 30)+"px");
    }
    
     
    //设置样式
    this.box.css({"margin-top":$dom.css("marginTop"),"margin-right":$dom.css("marginRight"),"margin-bottom":$dom.css("marginBottom"),"margin-left":$dom.css("marginLeft"),"width":dtw});
    this.tit.addClass($dom.prop("className"));
    $dom.prop("id") ? this.tit.prop("id",$dom.prop("id")) : "";
    this.addMenu(dom);

    //事件
    this.bindEvent(dom);
}
var selectDom = null;
selectFun.create = function(dom,opt){
    return new selectFun(dom,opt);
}
selectFun.prototype.getConfig = function(opt){
    var cfg = $.extend({
        val: "",//默认值
        clsName: "active",//当前class
        inx: 0,//已选择的索引
        callback: null //返回函数
    },opt || {});
    return cfg;
}
selectFun.prototype.setPosition = function(sibMenu){//设置下拉位置
    var wth = $(window).height();
    var ty = sibMenu.offset().top;
    var domth = sibMenu.outerHeight(true);
    var titTh = sibMenu.siblings("div.js-select-tit").outerHeight(true);
     
    if((ty+domth) > wth){
        sibMenu.css({"top":"auto","bottom":(titTh+1)+"px"});
    }else{
        sibMenu.css({"top":(titTh+1)+"px","bottom":"auto"});
    }
}
selectFun.prototype.addMenu = function(dom){//添加下拉
    var optDoms = $(dom).find("option");
    var ulDom = $("<ul></ul>");
    var liDom = "";
    var val = this.cfg.val || $(dom).find("option:selected").val();//已选择的value
    for(var i=0; i<optDoms.length; i++){//创建li
        if(val === ""){
            this.titSpan.text(optDoms.eq(0).text());
            this.cfg.inx = 0;
        }else if(optDoms[i].value == val){
            this.titSpan.text(optDoms.eq(i).text());
            this.cfg.inx = i;
            this.cfg.callback && this.cfg.callback(val, optDoms.eq(i).text());
        }
        liDom += '<li class="js-select-items" data-val="'+optDoms[i].value+'"><a href="javascript:;">'+optDoms.eq(i).text()+'</a></li>'
    }
    ulDom.html(liDom);
    this.menu.append(ulDom).width(this.dtw-2);//添加下拉

    ulDom.find("li").eq(this.cfg.inx).addClass(this.cfg.clsName);//添加class
}
selectFun.prototype.hideEvent = function(sibMenu,selectBox){//隐藏（下拉，select框）
    if(selectBox){
        selectBox = sibMenu.parent("div.js-select-box");
    }
    sibMenu.hide().css({"top":(sibMenu.siblings("div.js-select-tit").outerHeight(true)+1)+"px","bottom":"auto"});;
    selectBox.css("z-index",1);
}
selectFun.prototype.bindEvent = function(dom){
    var self = this;
    self.tit.click(function(){
        var $tTit = $(this);
        var $tp = $tTit.parent("div.js-select-box");
        var sib = $tTit.siblings("div.js-select-menu");
        var tpSib = $("div.js-select-box");
        if(sib.is(":hidden")){
            //隐藏已展开的select
            var sibMenu = tpSib.find("div.js-select-menu").not(":hidden");
             
            self.hideEvent(sibMenu,sibMenu.parents("div.js-select-box"));//隐藏

            sib.show();
            $tp.css("z-index",999);

            self.setPosition(sib);//位置
            selectDom = self;
        }else{
            self.hideEvent(sib,$tp);//隐藏
            selectDom = null;
        }
    });
    self.menu.on("click","li",function(){
        self.setVal($(this),self.dom);
    });
    $(document).click(function(e){
        var tag = $(e.target || window.event.srcElement);
        var boxDom = $("div.js-select-box").not(":hidden");
        if(tag.hasClass("js-select-box") || tag.parents("div.js-select-box").length > 0){
            return;
        }else{
            self.hideEvent(boxDom.find("div.js-select-menu"),boxDom);//隐藏
        }
    });
}
selectFun.keyDownFun = function(e){
    var self = selectDom;
    var sib = $("div.js-select-menu").not(":hidden");
    var sibTp = sib.parents("div.js-select-box");
    var dom = sibTp.prev("select")[0];
    var lis = sib.find("li.active");
    var code = e.keyCode;
    var nextOrPrev,clsName;
    if(!self){
        return;
    }
    clsName = self.cfg.clsName;
    switch(code){
      case 40:
        nextOrPrev = self.nextOrPrevDom(lis,true);//添加class
        nextOrPrev.addClass(clsName).siblings("li").removeClass(clsName);
        self._scrollToItem(nextOrPrev);
        break;
      case 38:
        nextOrPrev = self.nextOrPrevDom(lis,false);//添加class
        nextOrPrev.addClass(clsName).siblings("li").removeClass(clsName);
        self._scrollToItem(nextOrPrev);
        break;
      case 13:
        self.setVal(lis,dom);
        break;
      case 27:
        self.hideEvent(sib,sibTp);//隐藏
        break;
      default:break;
    }
}
selectFun.prototype.nextOrPrevDom = function(curDom,isNext){
    var obj = null;
    if(isNext){
        obj = curDom.next();
        if(obj.length <= 0){
            obj = curDom.parents("div.js-select-menu").find("li").eq(0);
        }
    }else{
        obj = curDom.prev();
        if(obj.length <= 0){
            obj = curDom.parents("div.js-select-menu").find("li:last");
        }
    }
    return obj;
}
selectFun.prototype._scrollToItem = function(item){
    var menuDom = item.parents(".js-select-menu");
    menuDom.scrollTop((menuDom.find("li").height()*item.index())/2);
};
selectFun.prototype.setVal = function(t,dom){//设置内容
    var inx = t.index();
    var txt = t.text();
    var dataVal = t.data("val");
    var tp = t.parents("div.js-select-menu");
    var fn = new Function();
    tp.siblings("div.js-select-tit").find("span").text(txt);
    this.hideEvent(tp,tp.parent("div.js-select-box"));//隐藏
    t.addClass(this.cfg.clsName).siblings("li").removeClass(this.cfg.clsName);//添加class
    $(dom).find("option").eq(inx).prop("selected",true);//select赋值
    if((typeof this.cfg.callback).toLowerCase() === "function"){
        this.cfg.callback(dataVal,txt,inx);//已选择的：val，text，索引  
    }
    $(dom).trigger("change");
}

$.fn.extend({
    selecter : function(options){
        this.each(function(i,dom){
            selectFun.create(dom,options);
        });
    }
});
$(document).on("keydown",selectFun.keyDownFun);
$("select").selecter();