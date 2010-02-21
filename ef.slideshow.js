//
Function.prototype.bindTo = function(scope, fn) {
    fn = fn || this;
    var wrapped = function() {
        fn.apply(scope, arguments)
    };
    wrapped.original = fn;
    return wrapped;
};
//
var slideshow = function(options) {
    
    if (!options) {
        return false;
    }
    
    if (!('feed' in options)) {
        return false;
    }
    
    this.flickrFeed = options.feed;
    
    this.itemList = [];
    this.currentItem = 0;
    
    this.movementOffset = 1;
    
    this.filmstripWidth = 12;
    this.slideHeight = 80;
    this.slidePaddingWidth = 7;
    this.filmstripBorderHeight = 14;
    
    this.openFilmstripTimeout = 500;
    this.animationTimer = 10;
    
    this.paused = false;
    
    this.baseId = options.baseId || 'slideshow';
    
    this.slideshow = null;
    this.container = null;
    this.clipper   = null;
    
    this.looper = null;
    
    jQuery(this.init.bindTo(this));
    
};
//
slideshow.prototype = {
    
    /**
    */
    randomize: function(list) {
        for (var i = list.length - 1; i > 0; --i) {
            var j = Math.floor(Math.random() * (i + 1));
            var swap = list[i];
            list[i] = list[j];
            list[j] = swap;
        }
        this.itemList = list;
    },
    
    /**
    */
    init: function() {
        // 
        this.slideshow = jQuery('#' + this.baseId);
        this.container = jQuery('#' + this.baseId + '-container');
        this.clipper   = jQuery('#' + this.baseId + '-clipper');
        
        // 
        this.slideshow[0].style.position = 'relative';
        this.slideshow[0].style.height = (this.slideHeight + (this.filmstripBorderHeight * 2)) + 'px';
        this.slideshow[0].style.overflow = 'hidden';
        this.slideshow[0].addEventListener('mouseover', (function() { this.paused = true; }).bindTo(this), false);
        this.slideshow[0].addEventListener('mouseout', (function() { this.paused = false; }).bindTo(this), false);
        
        //
        this.container[0].style.position = 'relative';
        this.container[0].style.height = (this.slideHeight + (this.filmstripBorderHeight * 2)) + 'px';
        
        // 
        this.clipper[0].style.position = 'relative';
        this.clipper[0].style.left = '0px';
        this.clipper[0].style.height = (this.slideHeight + (this.filmstripBorderHeight * 2)) + 'px';
        this.clipper[0].style.width = '1000%';
        this.clipper[0].style.backgroundImage = 'url(http://github.com/oxchronxo/Slideshow/raw/master/images/filmstrip.png)';
        
        // 
        jQuery.getJSON(this.flickrFeed + "&jsoncallback=?", (function(data) {
            this.handler(data);
        }).bindTo(this));
    },
    
    /**
    */
    animate: function() {
        if (this.paused) {
            return;
        }
        var currentFrame = jQuery(this.clipper[0].childNodes[0]);
        if ((parseInt(currentFrame.offset()['left']) + currentFrame.outerWidth()) < parseInt(this.slideshow.offset()['left'])) {
            this.shiftItem(currentFrame[0]);
            this.clipper[0].style.left = '-' + this.movementOffset + 'px';
            
        } else {
            this.clipper[0].style.left = (parseInt(this.clipper.position()['left']) - this.movementOffset) + 'px';
        }
    },
    
    /**
    */
    shiftItem: function (frame) {
        //console.log(frame.firstChild.src);
        this.clipper[0].appendChild(this.clipper[0].removeChild(frame));
        this.currentItem++;
        this.updateItem(frame, this.currentItem);
    },
    
    /**
    */
    updateItem: function(frame, index) {
        this.currentItem = (index >= this.itemList.length) ? 0 : index;
        //console.log(this.currentItem, this.itemList[this.currentItem], this.itemList[this.currentItem].media.m);
        frame.href = this.itemList[this.currentItem].link;
        //frame.addEventListener('click', this.clicker.bindTo(this), false);
        frame.firstChild.src = this.itemList[this.currentItem].media.m;
    },
    
    /**
    */
    aspect: function() {
        var height = this.height;
        var ratio = this.slideHeight / height;
        if (height > this.slideHeight) {
            this.width = this.width * ratio;
            this.height = height * ratio;
        }
        this.style.paddingLeft = ((this.width + 5) % this.filmstripWidth) + 'px';
        this.style.visibility = 'visible';
    },
    
    /**
    */
    buildSlides: function() {
        for (this.currentItem = 0; this.currentItem < (this.container.width() / (this.slideHeight / 2)); this.currentItem++) {
            var anchor = jQuery('<a />');
            anchor[0].target = '_blank';
            anchor[0].style.margin = this.filmstripBorderHeight + 'px 0px';
            anchor[0].style.display = 'block';
            anchor[0].style.position = 'relative';
            anchor[0].style.textDecoration = 'none';
            if ('cssFloat' in anchor[0].style) {
                anchor[0].style.cssFloat = 'left';
            } else {
                anchor[0].style.styleFloat = 'left';
            }
            this.clipper[0].appendChild(anchor[0]);
            var image = jQuery('<img />');
            image[0].style.visibility = 'hidden';
            image[0].addEventListener('load', this.aspect.bindTo(image[0]), false);
            image[0].slideHeight = this.slideHeight;
            image[0].filmstripWidth = this.filmstripWidth;
            anchor[0].appendChild(image[0]);
            this.updateItem(anchor[0], this.currentItem);
        }
    },
    
    /**
    */
    handler: function(data) {
        // randomize pictures
        this.randomize(data.items);
        
        // build slides
        this.buildSlides();
        
        // 
        this.container.animate({
            height: (this.slideHeight + (this.filmstripBorderHeight * 2)) + 'px'
        }, this.openFilmstripTimeout);
        
        // 
        
        this.looper = setInterval((function () {
            this.animate();
        }).bindTo(this), this.animationTimer);
        
    }
    
};
