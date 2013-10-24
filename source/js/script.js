(function ($) {
	'use strict';

	function CategoryFilter($filter, $elements) {

		var self = this;

		self.$filter = $filter;
		self.$elements = $elements;

		$filter.find('a').click(function (e) {
			e.preventDefault();
			$filter.find('li').removeClass('selected');
			$(this).parent('li').addClass('selected');
			self.select($(this).attr('href').replace('#', ''));
		});

	}

	CategoryFilter.prototype.select = function (category) {

		var selected = this.$elements.filter(function () {
			if (!$(this).attr('data-category')) {
				return false;
			}
			return $(this).attr('data-category').split(' ').indexOf(category) != -1;
		});

		this.$elements.addClass('js-inactive');
		selected.removeClass('js-inactive');

	};


	$.fn.categoryFilter = function ($elements) {

		$(this).each(function () {
			new CategoryFilter($(this), $elements);
		});

		return $(this);

	};


})(jQuery);

(function ($) {
	'use strict';

	function Map($el, opts) {

		var center = new google.maps.LatLng(opts.latitude, opts.longitude);

		var map = new google.maps.Map($el, {
			zoom: opts.zoom,
			center: center,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			disableDefaultUI: false,
			styles: [
				{
					stylers: [
						{ saturation: -40 }
					]
				},
				{
					featureType: 'road',
					elementType: 'geometry',
					stylers: [
						{ lightness: 100 },
						{ visibility: 'simplified' }
					]
				},
				{
					featureType: 'road',
					elementType: 'labels',
					stylers: [
						{ visibility: 'off' }
					]
				}
			]
		});

		var marker = new google.maps.Marker({
			position: center,
			map: map,
			icon: {
				url: 'img/marker.png',
				scaledSize: new google.maps.Size(26, 33)
			}
		});

	}

	/* Google Maps plugin */
	$.fn.embedMap = function () {

		$(this).each(function () {
			new Map($(this)[0], {
				latitude: parseFloat($(this).data('latitude')),
				longitude: parseFloat($(this).data('longitude')),
				zoom: parseInt($(this).data('zoom'), 10)
			});
		});

		return $(this);

	};

})(jQuery);

(function ($) {
	'use strict';

	$.sendEmail = function (opts) {

		$.ajax({

			type: 'POST',
			url: opts.url,
			data: {
				name: opts.data.name,
				email: opts.data.email,
				text: opts.data.message
			}

		}).done(function (data, textStatus, jqXHR) {

			if ( data == 'sent' ) {
				opts.onSuccess.apply(undefined, arguments);
			} else if ( data == 'invalid' ) {
				opts.onInvalidInput.apply(undefined, arguments);
			} else {
				opts.onDataError.apply(undefined, arguments);
			}

		}).fail(function (jqXHR, textStatus, errorThrown) {

			opts.onError.apply(undefined, arguments);

		});

	};

})(jQuery);

(function ($) {
	'use strict';

	function Slideshow($container, options) {

		var self = this;

		self.$container = $container;
		self.$list = $container.find('.slideshow__data').remove().find('li');
		self.$slidesUl = $('<ul>').addClass('slideshow__slides').appendTo($container);
		self.$slides = [];
		self.$thumbsDiv = $('<div>').addClass('slideshow__thumbs').appendTo($container);
		self.$thumbsUl = $('<ul>').appendTo(self.$thumbsDiv);
		self.$thumbs = [];
		self.options = options;
		self.currentSlide = 0;

		// Add controls
		self.addControls();

		// Load images
		self.$list.each(function (i) {

			self.createSlide($(this), i);
			self.createThumb($(this), i);

		});

		// Initiate first slide
		self.changeSlide(0);

		// Start interval
		self.setupInterval();

	}

	Slideshow.prototype.createSlide = function ($slide, i) {

		var self = this;

		var $li = $slide.clone(true).appendTo(self.$slidesUl);

		self.$slides[i] = $li;

	};

	Slideshow.prototype.loadSlide = function(i) {

		var self = this;

		var $slide = self.$slides[i];

		if ($slide.data('loaded')) {
			return;
		}

		$slide.data('loaded', true);

		var $img = $('<img>').attr('src', $slide.data('src')).appendTo($slide);

		$img.addClass('is-loading')
			.load(function () {
				$(this).removeClass('is-loading');

				switch ($slide.data('cover')) {
					case 'cover':
						$(this).fillImageBackground({}, true);
						break;
					case 'spacing':
						var $slideshowThumbs = $('.slideshow__thumbs');
						$(this).fillImageBackground({
							top: function() { return parseInt($slideshowThumbs.css('padding-top'), 10); },
							right: function() { return parseInt($slideshowThumbs.css('padding-top'), 10); },
							left: function() { return parseInt($slideshowThumbs.css('padding-top'), 10); },
							bottom: function() { return $slideshowThumbs.outerHeight(); }
						});
				}

				self.loadSlide((i+1) % self.$slides.length);
			});

	};

	Slideshow.prototype.createThumb = function($slide, i) {

		var self = this;

		var $li = $('<li>'),
			$a = $('<a>').attr('href', '#').appendTo($li),
			$img = $('<img>').attr('src', $slide.data('thumb')).appendTo($a),
			$overlay = $('<div>').addClass('overlay').appendTo($a);

		$a.on('click', function (e) {
			e.preventDefault();
			self.changeSlide(i);
			self.setupInterval();
		});

		$li.appendTo(self.$thumbsUl);
		self.$thumbs[i] = $li;

	};

	Slideshow.prototype.changeSlide = function (i) {

		this.loadSlide(i % this.$slides.length);
		this.loadSlide((i+1) % this.$slides.length);

		$(this.$slides).each(function () { $(this).removeClass('is-active'); });
		this.$slides[i].addClass('is-active');

		this.$slides[i].removeClass('animation-trigger');
		this.$slides[i].width();
		this.$slides[i].addClass('animation-trigger');

		$(this.$thumbs).each(function () { $(this).removeClass('is-active'); });
		this.$thumbs[i].addClass('is-active');

		this.currentSlide = i;

	};

	Slideshow.prototype.setupInterval = (function () {

		var interval = null;

		return function () {

			var self = this;

			if (!self.options.interval) {
				return;
			}

			clearInterval(interval);

			interval = setInterval(function () {
				self.nextSlide();
			}, self.options.interval);

		};

	})();

	Slideshow.prototype.nextSlide = function () {

		var i = this.currentSlide,
			n = this.$list.length;

		this.changeSlide((((i + 1) % n) + n) % n);

	};

	Slideshow.prototype.previousSlide = function () {

		var i = this.currentSlide,
			n = this.$list.length;

		this.changeSlide((((i - 1) % n) + n) % n);

	};

	Slideshow.prototype.addControls = function () {

		var self = this;

		var $controls = $('<div>').addClass('slideshow__controls').appendTo(self.$container);

		$('<a>').attr('href', '#').click(function (e) {
			e.preventDefault();
			self.previousSlide();
			self.setupInterval();
		}).addClass('slideshow__controls__previous').appendTo($controls);
		$('<a>').attr('href', '#').click(function (e) {
			e.preventDefault();
			self.nextSlide();
			self.setupInterval();
		}).addClass('slideshow__controls__next').appendTo($controls);

	};


	$.fn.slideshow = function () {

		$(this).each(function () {
			new Slideshow($(this), {
				interval: parseInt($(this).data('interval'), 10)
			});
		});

		return $(this);

	};


})(jQuery);

jQuery(document).ready(function ($) {


	/* Cache */

	var _cache = {};

	var refreshCache = function () {
		_cache.headerHeight = $('.header').outerHeight();
		_cache.footerHeight = $('.footer').outerHeight();
		_cache.portfolioTitleHeight = $('.portfolio-title').outerHeight();
	};

	refreshCache();
	$(window).resize(refreshCache);



	/* All pages */

	$('.header').addMobileNav();

	$('.cover-screen').coverScreen(_cache);
	$('.cover-parent').coverParent();
	$('.background-image').makeBackground();

	$('.footer').positionFooter();



	/* Slideshow */

	$('.slideshow').slideshow();



	/* Portfolio and grid */

	$('.grid article .overlay').each(function() {
		if ($(this).data('background')) {
			$(this).css('background-image', 'url("' + $(this).data('background') + '")');
		}
	});

	$('.category-filter').categoryFilter($('.grid--portfolio').children());



	/* Contact page */

  // $('.map__embed').embedMap();

	$('.box--contact .show-hide').click(function (e) {
		e.preventDefault();
		$('.box--contact').toggleClass('is-hidden');
	});

	$('#contact_form').submit(function (e) {

		e.preventDefault();

		var $status = $(this).find('.form__status');

		$status.html('Sending...');

		$.sendEmail({
			url: 'contact.php',
			data: {
				name: $(this).find('input[name="name"]').val(),
				email: $(this).find('input[name="email"]').val(),
				message: $(this).find('textarea[name="message"]').val()
			},
			onSuccess: function () {
				$status.html('E-mail has been sent.');
			},
			onInvalidInput: function () {
				$status.html('Your name, email or message is invalid.');
			},
			onDataError: function () {
				if (console) console.log(arguments);
				$status.html('E-mail could not be sent.');
			},
			onError: function () {
				if (console) console.log(arguments);
				$status.html('E-mail could not be sent.');
			}
		});

	});



	/* Center boxes */

	$('.find-center').findCenter();



	/* Trigger resize events */

	$(window).resize();



});


(function ($) {

	/* Ensure that footer is on the bottom of the page */
	$.fn.positionFooter = function () {

		$(this).each(function () {

			if ($('body').outerHeight() < window.innerHeight) {
				$(this).addClass('js-absolute');
			}

		});

		return $(this);

	};

	/* Convert data-src into <img> */
	$.fn.makeBackground = function () {

		$(this).each(function () {

			var $img = $('<img>').attr('src', $(this).data('src')).addClass('js-inactive');
			$img.appendTo($(this));
			$img.load(function () {
				$(this).fillImageBackground({}, true).removeClass('js-inactive');
			});

		});

		return $(this);

	};


	/* Resize image to cover parent with spacing */
	$.fn.fillImageBackground = function(spacing, fill) {

		spacing = $.extend({
			top: function() { return 0; },
			right: function() { return 0; },
			left: function() { return 0; },
			bottom: function() { return 0; }
		}, spacing);

		$(this).each(function () {

			var $img = $(this),
				$parent = $img.parent();

			var resizeImage = function () {

				var imgWidth = $img.outerWidth(),
					imgHeight = $img.outerHeight(),
					imgRatio = imgWidth / imgHeight,
					parentWidth = $parent.outerWidth() - spacing.left() - spacing.right(),
					parentHeight = $parent.outerHeight() - spacing.top() - spacing.bottom(),
					parentRatio = parentWidth / parentHeight;

				var ratioCondition = imgRatio < parentRatio;
				if (fill) {
					ratioCondition = !ratioCondition;
				}

				if (ratioCondition) {
					$img.css({ width: 'auto', height: parentHeight });
				} else {
					$img.css({ width: parentWidth, height: 'auto' });
				}

				$img.css({
					left: (parentWidth - $img.outerWidth()) / 2 + spacing.top(),
					top: (parentHeight - $img.outerHeight()) / 2 + spacing.left()
				});

			};

			$(window).resize(resizeImage);
			resizeImage();

		});

		return $(this);

	};


	/* Display fullscreen */
	$.fn.coverScreen = function (cache) {

		$(this).each(function () {

			var $el = $(this);

			$(window).resize(function () {
				$el.css({
					width: window.innerWidth,
					height: window.innerHeight - cache.headerHeight - cache.footerHeight - cache.portfolioTitleHeight,
					top: cache.headerHeight + cache.portfolioTitleHeight
				});
			});

		});

		return $(this);
	};


	/* Display fullscreen */
	$.fn.coverParent = function () {

		$(this).each(function () {

			var $el = $(this),
				$parent = $el.parent();

			$(window).resize(function () {
				$el.css({
					width: $parent.outerWidth(),
					height: $parent.outerHeight()
				});
			});

		});

		return $(this);
	};

	/* Position box to the center */
	$.fn.findCenter = function() {

		$(this).each(function () {

			var $el = $(this),
				$parent = $el.parent();

			$(window).resize(function () {
				$el.css({
					position: 'relative',
					top: Math.max(($parent.outerHeight() - $el.outerHeight()) / 2, 0),
					left: Math.max(($parent.outerWidth() - $el.outerWidth()) / 2, 0)
				});
			});

		});

		return $(this);

	};

	/* Position box to the center */
	$.fn.addMobileNav = function() {

		$(this).each(function () {

			var currentMenuItem = $('.nav .selected > a').last().text(),
				$wrapper = $('<div>').addClass('mobile-nav'),
				$link = $('<a>').attr('href', '#').text(currentMenuItem);

			$link.click(function () {
				$('.header nav').toggleClass('is-active');
			});

			$(this).append($wrapper.append($link));

		});

		return $(this);

	};

  $('.frontpage').on('click', '.slideshow__slides li', function(e) {
    e.preventDefault();
    var clickedLi = $(this);
    ownOpacity = clickedLi.css('opacity');

    if (ownOpacity < 0.5) {
      $('.slideshow__slides li').each(function() {
        var li = $(this);
        clickedLi = clickedLi.css('opacity') < li.css('opacity') ? li : clickedLi;
      });
    }

    window.location.href = clickedLi.attr('href');
  });
})(jQuery);