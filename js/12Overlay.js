/**
 * Plugin Name:     l2Overlay
 * Plugin Author:   LOO2K
 * Plugin Address:  http://loo2k.com/blog/l2overlay-a-javascript-based-hoverpop-plugin/
 * Plugin Edition:  0.1
 * Last updated:    2012.05.19
 */
function l2Overlay() {
    this.initialize.apply(this, arguments);
}
 
l2Overlay.prototype = {
    /*
     * object   要应用 l2Overlay 的元素 对象或者数组
     * content  显示内容 'function|html|string|target'
     * option   选项
     * option   = {
     *      'title'     =   'string',                       // defalut undefied
     *      'pos'       =   'auto|lt|lb|rt|tb',             // default auto
     *      'cache'     =   'true|false'                    // default false
     * }
     */
    initialize: function(object, content, option) {
        this.id         = (new Date()).getTime();
        this.createElement();
        var _this       = this;
        this.object     = object;
        this.content    = content;
        this.option     = {
            'title' : option.title || undefined,
            'pos'   : option.pos   || 'auto',
            'cache' : option.cache || false
        };
        this.hidel2Overlay;
        
        this.l2Overlay.onmouseover = function() {
            _this.cancleHide();
        }
        this.l2Overlay.onmouseout = function() {
            _this.hideOverlay();
        }
        
        if( typeof this.object === 'object' && typeof this.object.length === 'number') {
            for( var i = 0; i < this.object.length; i++ ) {
                this.addEvent(this.object[i]);
            }
        } else if( typeof this.object == 'object' && !( this.object instanceof Array)) {
            this.addEvent(this.object);
        } else {
            alert('传入对象错误');
        }
    },
    createElement: function() {
        // 生成基本模版
        if( !document.getElementById('l2Overlay_' + this.id) ) {
            var overlay             = document.createElement('div');
            overlay.id              = 'l2Overlay_' + this.id;
            overlay.style.position  = 'absolute';
            overlay.style.zIndex    = '9999';
            overlay.style.display   = 'none';
            
            var wrapper = document.createElement('div');
            wrapper.className       = 'l2OverlayWrapper';
            
            var arrow   = document.createElement('div');
            arrow.className         = 'l2OverlayArrow';
 
            var content = document.createElement('div');
            content.className       = 'l2OverlayContent';
            
            wrapper.appendChild(arrow);
            wrapper.appendChild(content);
            overlay.appendChild(wrapper);
            document.getElementsByTagName('body')[0].appendChild(overlay);
        }
        this.l2Overlay  = document.getElementById('l2Overlay_' + this.id);
        var wrapper     = this.l2Overlay.getElementsByTagName('div')[0].getElementsByTagName('div');
        this.l2Content  = wrapper[1];
        this.l2Arrow    = wrapper[0];
    },
    getPos: function(el) {
        var ua      = navigator.userAgent.toLowerCase();
        var isOpera = (ua.indexOf('opera') != -1);
        var isIE    = (ua.indexOf('msie') != -1 && !isOpera);
        if( el.parentNode === null || el.style.display == 'none') {
            return false;
        }
        var parent  = null;
        var pos     = [];
        var box;
 
        if( el.getBoundingClientRect ) {
            // For IE
            box = el.getBoundingClientRect();
            var scrollTop   = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            var scrollLeft  = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            return {
                x:  box.left + scrollLeft,
                y:  box.top + scrollTop
            };
        } else if( document.getBoxObjectFor ) {
            // For FF
            box             = document.getBoxObjectFor(el);
            var borderLeft  = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
            var borderTop   = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
            pos             = [box.x - borderLeft, box.y - borderTop];
        } else {
            // For Safari & Opera
            pos     = [el.offsetLeft, el.offsetTop];
            parent  = el.offsetParent;
            if( parent != el ) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
            if( ua.indexOf('opera') != -1 || (ua.indexOf('safari') != -1 && el.style.position == 'absolute') ) { 
                pos[0] -= document.body.offsetLeft;
                pos[1] -= document.body.offsetTop;
            }   
        }
        
        if( el.parentNode ) { 
            parent = el.parentNode;
        } else {
            parent = null;
        }
        // account for any scrolled ancestors
        while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;
            if (parent.parentNode) {
                parent = parent.parentNode;
            } else {
                parent = null;
            }
        }
        return {
            x:  pos[0],
            y:  pos[1]
        };
    },
    getSize: function(element) {
        if(element.offsetWidth !== 0){
            /* 元素不是display:none的情况，这个时候是能得到尺寸的 */
            return {
                'width':    element.offsetWidth,
                'height':   element.offsetHeight
            };
        }
        var old = {};
        /* 将display:none元素设成visibility:hidden */
        var options = { 
            position:   "absolute", 
            visibility: "hidden", 
            display:    "block"
        }
        
        for ( var name in options ) {
            old[ name ] = element.style[ name ];
            element.style[ name ] = options[ name ];
        }
        var temp = {
            'width':    element.offsetWidth,
            'height':   element.offsetHeight
        };
        for ( var name in options ) {
            element.style[ name ] = old[ name ];
        }
        return temp;
    },
    hideOverlay: function() {
        var _this = this;
        this.hidel2Overlay = setTimeout(function() {
            _this.l2Overlay.style.display   = 'none';
        }, 100);
    },
    cancleHide: function() {
        if( this.hidel2Overlay ) {
            clearTimeout(this.hidel2Overlay);
        }
    },
    getBrowser: function() {
        var offset = {
            'top':      document.documentElement.scrollTop   || document.body.scrollTop,
            'left':     document.documentElement.scrollLeft  || document.body.scrollLeft
        }
        return offset;
    },
    addEvent: function (object) {
        var _this   = this;
        //var _object = this.object;
        var _object = object;
        
        _object.onmouseover = function() {
            _this.cancleHide();
            
            // 缓存模块
            if( _this.option.cache && this.l2cache ) {
                _this.l2Content.innerHTML = this.l2cache;
            } else if( typeof _this.content === 'function' ) {
                _this.l2Content.innerHTML = _this.content.apply(this, arguments);;
                //console.log(_this.content());
            } else {
                _this.l2Content.innerHTML = _this.content;
            }
            
            if( _this.option.cache && !this.l2cache ) {
                this.l2cache = _this.l2Content.innerHTML;
            }
            
            // 定位模块
            var position = _this.getPos(this);
            var curTop   = position.y;
            var curLeft  = position.x;
            var offset   = _this.getSize(_this.l2Overlay);
            var self     = _this.getSize(this);
            var browser  = _this.getBrowser();
            
            var pos = '';
            if( _this.option.pos === 'auto' ) {
                if( (curLeft - browser.left - offset.width) > 0 ) {
                    pos += 'r';
                } else {
                    pos += 'l';
                }
                
                if( (curTop - browser.top - offset.height) > 0 ) {
                    pos += 'b';
                } else {
                    pos += 't';
                }
            } else {
                pos = _this.option.pos;
            }
            switch(pos) {
                case 'lt':
                    _this.l2Overlay.className = 'arrow-lt';
                    oTop    = curTop + self.height;
                    oLeft   = curLeft;
                    break;
                case 'rt':
                    _this.l2Overlay.className = 'arrow-rt';
                    oTop    = curTop + self.height;
                    oLeft   = curLeft - offset.width + self.width;
                    break;
                case 'rb':
                    _this.l2Overlay.className = 'arrow-rb';
                    oTop    = curTop - offset.height;
                    oLeft   = curLeft - offset.width + self.width;
                    break;
                case 'lb':
                default:
                    _this.l2Overlay.className = 'arrow-lb';
                    oTop    = curTop - offset.height;
                    oLeft   = curLeft;
                    break;
            }
            
            _this.l2Overlay.style.top       = oTop + 'px';
            _this.l2Overlay.style.left      = oLeft + 'px';
            _this.l2Overlay.style.display   = '';
            
        }
        
        _object.onmouseout = function() {
            _this.hideOverlay();
        }
    }
}