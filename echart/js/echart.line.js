function echartSet($dom, opts){
	this.dom = $dom;
	this.cfg = this.setConfig(opts);

	this.series = [];
	this.category = [];

	this.echartInit();
}
echartSet.prototype.setConfig = function(opt){ //更新配置
	var cfg = $.extend({
		'xAxis': ['周一','周二','周三','周四','周五','周六','周日'],
		'areaColor': '#fbf6fb',
		'yAxis': [
			{'name': '邮件营销', 'lineStyle': '#c6d8fd', 'data': [120, 132, 101, 134, 90, 230, 210]},
			{'name': '联盟广告', 'lineStyle': '#ffadd7', 'data': [220, 182, 191, 234, 290, 330, 310]}
		]
	}, opt || {});
	return cfg;
}
echartSet.prototype.getCategory = function(){
	var yAxis = this.cfg.yAxis;
	var category = [],
		series = [];
	for(var i=0; i<yAxis.length; i++){
		category.push = yAxis[i].name;
		series.push({
	        name: yAxis[i].name,
	        type:'line',
	        areaStyle: {},
	        data: yAxis[i].data, 
            itemStyle : {  
                normal : {  
                	color: yAxis[i].lineStyle,
                    lineStyle:{  
                        color: yAxis[i].lineStyle 
                    },
                    areaStyle: {
                    	color: this.cfg.areaColor
                    }
                }  
            }
	    });
	}
	this.category = category;
	this.series = series;
}
echartSet.prototype.echartInit = function(){ //echarts
	var option = {
			tooltip : {
			    trigger: 'axis'
			},
			legend: {
			    data: this.getCategory()
			},
			toolbox: {
			    feature: {
			        saveAsImage: {}
			    }
			},
			grid: {
			    left: '3%',
			    right: '4%',
			    bottom: '3%',
			    containLabel: true
			},
			xAxis : [
			    {
			        type : 'category',
			        boundaryGap : false,
			        data : this.cfg.xAxis
			    }
			],
			yAxis : [
			    {
			        type : 'value',
			        scale: false
			    }
			],
			series :  this.series
		};
        var echartsDom = this.dom[0];
        if(echartsDom){
            var myChart = echarts.init(echartsDom);
            myChart.setOption(option);
        }
}

$.fn.extend({
	echart: function(options){
		this.each(function(i, dom){
			return new echartSet($(dom), options);
		});
	}
});