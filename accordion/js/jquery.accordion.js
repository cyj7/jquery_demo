;(function($){
    $.fn.accordion = function(options){
        var cfg = {
            _event: 'mouseenter',
            chidClass: 'child-item',
            remianWidth: 30, //剩余width
            speed: 500, //animate time
            enterCallback: null, //返回函数
            leaveCallback: null
        }
        var opts = $.extend(cfg, options || {});
        var self = this;
        var childDom = this.find('.child-item');
        var boxWidth = self.width();
        var isAnimate = true; //is animate
        
        var setAnimate = function(dom, inx) {
            for(var i=0; i < dom.length; i++){
                if(i > inx){
                    dom.eq(i).stop(true).animate({'left': boxWidth-opts.remianWidth*(dom.length-i)}, opts.speed,function(){
                    opts.enterCallback && opts.enterCallback();
                })
                }else{
                    dom.eq(i).stop(true).animate({'left': opts.remianWidth*(i)}, opts.speed,function(){
                    opts.enterCallback && opts.enterCallback();
                })
                }
            }
        }
        var setStyle = function() { //init attr
            for(var i=0; i<childDom.length; i++){
                isAnimate = true
                childDom.eq(i).stop(true).attr('data-index', i).animate({'left': (boxWidth/childDom.length)*i}, opts.speed,function(){
                    opts.leaveCallback && opts.leaveCallback();
                });
            }
        }
        var init = function(){
            self.addClass('accordion-box');
            childDom.addClass('accordion-child').mouseenter(function(){
                var $this = $(this);
                var inx = $this.index();
                setAnimate(childDom, inx)
            });
            self.mouseleave(function(){
                setStyle();
            });
            setStyle();
        }
        init();
    }
})(jQuery);