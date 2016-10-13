;(function(){
    function annularPencent(element, opt){
        this.self = $(element)
        this.conf = $.extend({
            width: 200,
            height: 200,
            borderWidth: 10,
            borderColor: '#a00',
            radius: 80, //半径
        }, opt || {});
        this.init();
    }
    annularPencent.prototype = {
        init: function(){
            this.self.append(this.creatCanvas());
        },
        creatCanvas: function(){
            return $('<canvas width="'+ this.conf.width +'" height="'+ this.conf.height +'" style="transform: rotate(-90deg); -webkit-transform: rotate(-90deg)"></canvas>');
        },
        drawing: function(deg){
            var perc = (deg/360)*2;
            var canvas = this.self.find('canvas')[0];
            canvas.width = this.conf.width;
            canvas.height = this.conf.height;
            if(canvas.getContext){
                var ctx = canvas.getContext('2d');
                var borderWidth = this.conf.borderWidth;
                var x = this.conf.width/2;
                var y = this.conf.height/2;
                //灰色
                ctx.beginPath();
                ctx.arc(x, y, this.conf.radius, 0, Math.PI*2);
                ctx.lineWidth = borderWidth
                ctx.strokeStyle = '#ccc';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y, this.conf.radius, 0, Math.PI*perc);
                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = this.conf.borderColor;
                ctx.stroke();
            }
        }
    }
    $.fn.annularPencent = function(opt){
        var thisLen = this.length;
        function newFn(element) {
            var annular = new annularPencent(element, opt);
            var setIntervalFn = null;
            var deg = 0;
            // var endDeg = opt.percent * 1;
            var endDeg = element.data('percent') * 1;
            endDeg = endDeg ? endDeg*360 : 360;
            setIntervalFn = setInterval(function(){
                deg += 2;
                if(deg >= endDeg){
                    clearInterval(setIntervalFn)
                }
                annular.drawing(deg);
            },1)
            annular.drawing(endDeg);
        }
        for(var i=0; i <thisLen; i++){
            newFn(this.eq(i));
        }
        return this
    }
}(jQuery));