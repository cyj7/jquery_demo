function filePreview(self, opt){
	this.dom = $(self);
	this.classes = self.attr("class");
	this.imageFile = self.find(".image-file"),
	this.fileName = self.find("input.file-name");
	this.fileStyle = self.find("div.file-input-style");
	this.fileDone = self.find("div.done-box");
 
	this.cfg = this.getConfig(opt); 

	this.init();
	this.fileUploadFn();
	this.preview();
	this.closePreview();
	this.clear();
}
filePreview.prototype.getConfig = function(opt){
	var cfg = $.extend({
		'width': 0,
		'height': 0,
		'scale': "16:9", //视频比例，多个以逗号隔开
		'sepc': 'jpg,jpeg,png', //当格式是mp4时，才读取scale的值
		'maxSize': '100', //单位：kB
		'url': "", //上传url
		'close': false, //是否有可删除,默认没有删除按钮
		'files': '', //文件路径，多个文件以逗号分开，若div与files长度不同，则files显示不全
		'callback': null //回调函数
	}, opt || {});
	this.fileType = "images"; //上传文件的类型
	this.fileScale = ""; //文件显示尺寸
	this.fileSize = cfg.maxSize+"KB"; //文件大小
	this.filePath = ""; //文件路径
	return cfg;
}
filePreview.prototype.init = function(){ //如果有class=done-box的div 且其中的img为空，则隐藏
	this.dom.addClass("file-input-box");

	if(this.fileDone.length > 0 && this.fileDone.find("img").attr("src") == ""){
		this.fileDone.addClass("none");
	}
	this.isSepcFn(); //上传文件格式

	//判断是否存在节点
	this.addInputFile();
	this.addFileStyle(); 
	this.addInputHidden();

	//编辑
	if(this.cfg.files != ""){
		this.editFn();
		this.fileName.val(this.cfg.files);
	}

}
filePreview.prototype.isSepcFn = function(){ //判断文件格式
	if(this.cfg.sepc.indexOf("mp4") > -1){
		this.fileType = "video";
		this.fileScale = this.cfg.scale.replace(/,/g," 或 ");
		if(this.cfg.maxSize/1000 >= 1){
			this.fileSize = this.cfg.maxSize/1000 + "MB";
		}
	}else{
		this.fileScale = this.cfg.width + " x " + this.cfg.height;
	}
}
filePreview.prototype.addInputFile = function(){ //input file
	if(this.imageFile.length > 0) return;
	var spec = this.cfg.sepc,
		specArr = [],
		imgSpec = "png, gif, jpg, jpeg",
		videoSpec = "mp4";
	var acceptSpec = [];
	if(spec.indexOf(",") > -1){
		specArr = spec.split(",");
	}else{
		specArr = spec;
	}
	for(var i=0; i<specArr.length; i++){
		if(imgSpec.indexOf(specArr[i]) > -1 && specArr[i].indexOf("image/") < 0){
			acceptSpec.push("image/"+specArr[i]);
		}else if(videoSpec.indexOf(specArr[i]) > -1){
			acceptSpec.push("*."+specArr[i]);
		}
	}
	this.imageFile = $('<input type="file" class="image-file" name="imageFile" accept="'+acceptSpec.join(",")+'">');
	this.dom.append(this.imageFile);
}
filePreview.prototype.addFileStyle = function(){
	if(this.fileStyle.length > 0) return;
	var cfg = this.cfg;
	var html = '<div class="file-input-style">'+
					'<span class="default-prompt">'+
						'<i class="add-icon"></i><br />'+
						this.fileScale + '<br />'+
						cfg.sepc+'格式<br />'+
						'< '+ this.fileSize +
					'</span>'+
				'</div>';
	this.fileStyle = $(html);			
	this.dom.append(this.fileStyle);
}
filePreview.prototype.addInputHidden = function(){ //input hidden
	if(this.fileName.length > 0) return;
	this.fileName = $('<input type="hidden" class="file-name" name="ad-imgs-file-name" value="">');
	this.dom.append(this.fileName);
}
filePreview.prototype.getHtml = function(){
	var cfg = this.cfg;
	var previewTxt = "查看大图";
	if(this.fileType == "video"){
		previewTxt = "查看"
	}
	var html = '<div class="file-hover">'+
					'<span class="done-mask">'+
						'点击重新上传<br />'+
						this.fileScale +'<br />'+
						cfg.sepc+'格式<br />'+
						'< '+ this.fileSize +
					'</span>';
	if(cfg.close){
		html += '<span class="remove-fileupload close-dom" data-alt="删除"></span>';
	}
	html += '<a href="javascript:;" class="preview-fileupload"><i class="index-icon-box"></i> '+ previewTxt +'</a>'+
		'</div>';
	return html;
}
filePreview.prototype.doneFn = function(url){ //上传完成
	var img = '';
	var html = this.getHtml();
	if(this.fileType == "video"){
		img = '<video src="'+ url +'" controls="controls"></video>'
	}else{
		img = '<img src="'+ url +'" alt="">';
	}
	this.filePath = url;
	this.fileName.val(url);	
	if(this.fileDone.length > 0){
		this.fileDone.html('<div class="done-main-box">'+ img +'</div>' + html).removeClass("none");
	}else{
		this.fileDone = $('<div class="done-box"><div class="done-main-box">'+ img +'</div>' + html +'</div>');
	}
	this.fileStyle.addClass("none");
	this.dom.append(this.fileDone);
}
filePreview.prototype.fileUploadFn = function(){ //上传图片
	var self = this,
		cfg = self.cfg;
	self.imageFile.fileupload({
		url: cfg.url, //http://192.168.20.2:8887/frontadmanage/idea/saveIdeaImg?csrId=4
		maxFileSize: cfg.maxSize*1000, //单位：B
        autoUpload: true,//是否自动上传
        sequentialUploads : true,
        dataType: 'json',
		add: function(e, data){
			var files = data.files[0],
				size = files.size,
				type = files.type.split("/")[1];
			if(size > cfg.maxSize*1000){
				return alert("请上传"+ self.fileSize +"以内的文件");
			}
			if(cfg.sepc.indexOf(type) < 0){
				return alert("请上传"+cfg.sepc+"格式的文件");
			}

			//本地测试用 开始
			self.doneFn("./js/upload/images/close.png"); //
			//本地测试用 结束

			data.submit();
		},
		done: function(e, data){
			var json = data.result.data;
			var file_path = json.file_upload_path;

			self.doneFn(file_path); //显示已上传的文件

			cfg.callback && cfg.callback();

   //          if(json.ret_code == 200){
   //              var file_path = json.file_upload_path;
   //              var width_val = json.width_val;
   //              var height_val = json.height_val;
   //              fileName.val(file_path);
   //          }else{
   //              $("#stuff_url_file_name").val(null);
   //              layer.alert(json.ret_msg, {
   //                  icon:"5",
   //                  title:'温馨提示',
   //                  skin: 'layui-layer-skyBlue'
   //              });
   //          }
		}
	});
}
filePreview.prototype.editFn = function(){ //编辑
	if(this.cfg.files != ""){
		this.doneFn(this.cfg.files);
	}
}

filePreview.prototype.preview = function(){//查看大图
	var $this = this;
	this.dom.on("click", ".preview-fileupload", function(e){
		var _self = $(this);
		e.stopPropagation(); //阻止冒泡事件
		e.preventDefault(); //阻止默认事件
		var img = "";
		if($this.fileType == "video"){
			img = '<div class="preview-fileupload-box"><video src="'+ $this.filePath +'" controls="controls" /></video></div>';
		}else{
			img = '<div class="preview-fileupload-box"><img src="'+ $this.filePath +'" /></div>';
		}
		$('body').append($(img));
	});
}
filePreview.prototype.closePreview = function(){//预览 关闭
	$("body").on("click", ".preview-fileupload-box", function(){
		$(this).remove();
	});
}
filePreview.prototype.clear = function(){ //删除
	var _this = this;
	var pclass = this.classes.split(" ")[0];
	_this.dom.on("click", ".remove-fileupload", function(e){
		var $this = $(this),
			$selfP = $this.parents(".done-box"),
			$p = $selfP.parents("."+pclass);
		// console.log(pclass,'=====pclass');
		e.stopPropagation(); //阻止冒泡事件
		e.preventDefault(); //阻止默认事件
		var len = $p.siblings(".file-input-box").length;
		// if(len == 0){
		$selfP.siblings(".file-input-style").removeClass("none");
		$selfP.remove();
		// }else{
		// 	$p.remove();
		// }
		$selfP.siblings("input.file-name").val("");
	});
}

$.fn.extend({
	filePreview: function(options){
		var files = options.files;
		var fileArr = [];
		if(files){
			if(files.indexOf(",") > -1){
				fileArr = files.split(",");
			}else{
				fileArr.push(files);
			}
		}
		
		// console.log(this.length,'====+++++')
		this.each(function(i,dom){
			options.files = fileArr[i];
            return new filePreview($(dom), options);
        });
	}
});