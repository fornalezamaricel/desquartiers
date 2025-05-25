window.jQuery = window.$ = require('jquery');
import 'slick-carousel';
import CountUp from 'countup.js';
require('velocity-animate');
import 'imagesloaded';
import TimelineLite from "gsap";
var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
import directionsStyle from './directions-style.js';

(function () {

    var Site = {
        map: undefined,
        name: 'Desquartiers',

        vars: {
            isMobile: undefined,
            isTouch: undefined,
            page: undefined,
            slug: undefined,
            isHome: undefined,
            windowWidth: undefined,
            windowHeight: undefined
        },

        init: function () {
            // Site.kodohouse();
            Site.onResize();
            Site.setPageData();
            Site.maps.init();
            Site.checkBreakpoints();
            Site.introAnimation();
            Site.sections.init();
            Site.viewfinder();
            Site.metiers.init();
            Site.offers.init();
            Site.openPage(Site.vars.page, Site.vars.slug);
            Site.historyEvents();
            Site.loader.init();
            Site.cursor.init();

            $(window).on('resize', Site.onResize);
        },

        kodohouse: function () {
            console.log('Designed by feldman.studio http://feldman.studio/');
            console.log('Front End by kodo.house http://kodo.house/');
        },

        setPageData: function () {
            Site.vars.page = $('body').data('page');
            Site.vars.slug = $('body').data('slug');
            Site.vars.hash = window.location.hash;
        },

        openPage: function (page, slug) {
            var con;

            if (!Site.vars.isMobile) {
                con = '.js-map ';
            } else {
                con = '.js-nav-main ';
            }

            switch (page) {
                case 'home':
                    Site.loader.revealSite();
                    break;
                case 'nos-metiers':
                case 'agence':
                    Site.loader.revealSite();
                    setTimeout(function () {
                        $(`${con}[data-update-page="${page}"]`).trigger('click');
                    }, 4500);
                    break;
                case 'contact':
                    Site.loader.revealSite();
                    $('[data-update-page="${page}"]').trigger('click');
                    break;
                case 'offres-actuelles':
                case 'ventes-realisees':
                    $(`${con}[data-update-page="${page}"]`).trigger('click');
                    break;
                case 'ventes-realisees-liste':
                    $(`${con}[data-update-page="ventes-realisees"]`).trigger('click');
                    break;
                case 'offres-actuelles-liste':
                    $(`${con}[data-update-page="offres-actuelles"]`).trigger('click');
                    break;
                case 'realisation':
                    $(`${con}[data-update-url="realisation/${slug}"]`).trigger('click');
                    break;
                case '404':
                    break;
            }
        },

        updateTitle(title) {
            var prev = document.title.replace(Site.name + ' | ', '');
            $('body').attr('data-prev-title', prev);
            if (title != '' && title != Site.name) {
                document.title = Site.name + ' | ' + title;
            } else {
                document.title = Site.name;
            }
        },

        historyEvents: function () {
            $('[data-update-url]').on('click', function (e) {
                e.preventDefault();
                var url = $(this).attr('data-update-url');

                try {
                    history.pushState('pagechange', '', url);
                }
                catch (err) {
                    console.log(err);
                }
            });

            $('[data-update-page]').on('click', function () {
                Site.vars.page = $(this).attr('data-update-page');
                $('body').attr('data-page', Site.vars.page);
            });

            $('[data-update-title]').on('click', function () {
                Site.updateTitle($(this).attr('data-update-title'));
            });

            window.onpopstate = function (e) {
                if (e.state === null) {
                    e.preventDefault();
                    return false;
                }
                if ($('.section').hasClass('is-open')) {
                    $('.js-close-btn').trigger('click');
                }
            }

            if (Site.vars.page === 'nos-metiers' && Site.vars.hash) {
                window.location.hash = Site.vars.hash;
            }
        },

        loader: {
            options: {
                useEasing: true,
                easingFn: function (t, b, c, d) {
                    var ts = (t /= d) * t;
                    var tc = ts * t;
                    return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
                },
                useGrouping: true,
                separator: '',
                decimal: '.',
            },

            counters: {
                latAnim: undefined,
                lngAnim: undefined
            },

            init: function () {
                if (Site.vars.page == '404') {
                    this.startCounter404();
                } else {
                    this.startCounter();
                }
            },

            revealSite: function () {
                $('.offers').addClass('is-visible');
                Site.map.on('load', function () {
                    $('.js-map').removeClass('is-hidden');
                    setTimeout(function () {
                        $('body').addClass('is-loaded');
                    }, 1500);
                    setTimeout(function () {
                        $('.js-map').removeClass('is-locked');
                    }, 2000);
                });
            },

            revealSiteForOffer: function () {
                setTimeout(function () {
                    $('.offers').addClass('is-visible');
                }, 1500);
                $('body').addClass('is-opening-realisations');
                setTimeout(function () {
                    $('.covvver').addClass('is-hidden');
                    $('body').addClass('is-loaded');
                    $('.js-logo').addClass('is-force-hidden');
                    $('body').removeClass('is-opening-realisations');
                    if (Site.vars.page != 'realisation') {
                        setTimeout(function () {
                            Site.offers.openOffersList();
                        }, 1000);
                    }
                }, 3000);
                setTimeout(function () {
                    $('.js-map').removeClass('is-locked');
                    $('.js-map').removeClass('is-hidden');
                }, 3500);
            },

            startCounter: function () {
                var lat = document.getElementById('js-logo-lat');
                var lng = document.getElementById('js-logo-lng');

                this.counters.lngAnim = new CountUp(lng, 0, 2.378628, 6, 2.5, Site.loader.options);
                this.counters.latAnim = new CountUp(lat, 0, 48.853373, 6, 2.5, Site.loader.options);

                setTimeout(function () {
                    if (!Site.loader.counters.latAnim.error) {
                        Site.loader.counters.latAnim.start();
                    } else {
                        console.error(Site.loader.counters.latAnim.error);
                    }

                    if (!Site.loader.counters.lngAnim.error) {
                        Site.loader.counters.lngAnim.start();
                    } else {
                        console.error(Site.loader.counters.lngAnim.error);
                    }
                }, 1000);
            },

            startCounter404: function () {
                var lat = document.getElementById('js-logo-lat');
                var lng = document.getElementById('js-logo-lng');

                this.counters.lngAnim = new CountUp(lng, 0, 40.4, 6, 2.5, Site.loader.options);
                this.counters.latAnim = new CountUp(lat, 0, 40.4, 6, 2.5, Site.loader.options);

                setTimeout(function () {
                    if (!Site.loader.counters.latAnim.error) {
                        Site.loader.counters.latAnim.start();
                    } else {
                        console.error(Site.loader.counters.latAnim.error);
                    }

                    if (!Site.loader.counters.lngAnim.error) {
                        Site.loader.counters.lngAnim.start();
                    } else {
                        console.error(Site.loader.counters.lngAnim.error);
                    }
                }, 1000);

                setTimeout(function () {
                    document.location.href = '/';
                }, 5000);
            },
        },

        checkBreakpoints: function () {
            var breakpoint = window.matchMedia("(min-width: 992px)");

            function breakpointChecker() {
                if (breakpoint.matches === true) {
                    Site.vars.isMobile = false;
                } else if (breakpoint.matches === false) {
                    Site.vars.isMobile = true;
                }
            }

            breakpoint.addListener(breakpointChecker);
            breakpointChecker();
        },

        onResize: function () {
            Site.vars.windowWidth = $(window).width();
            Site.vars.windowHeight = $(window).height();
        },

        moveMapWithDevice: function () {

            var startPosW;
            var startPosH;
            var maxMovement = 50;
            var windowHalfW = Site.vars.windowWidth / 2;
            var windowHalfH = Site.vars.windowHeight / 2;
            var $map = $('.js-map');

            function moveMap(movementW, movementH) {
                if (movementW < -maxMovement) {
                    movementW = -maxMovement;
                }
                if (movementW > maxMovement) {
                    movementW = maxMovement;
                }
                if (movementH < -maxMovement) {
                    movementH = -maxMovement;
                }
                if (movementH > maxMovement) {
                    movementH = maxMovement;
                }

                $map.css('transform', 'translate3d(' + movementW + 'px, ' + movementH + 'px, 0)');
            }

            window.addEventListener('deviceorientation', function (event) {
                moveMap(event.gamma, event.beta);
            });
        },

        cursor: {
            $cursorEl: $('.js-cursor'),
            cursorTimeout: null,

            init: function () {
                this.detectTouch();
                $(window).on('mousemove', this.followCursor)
                this.dragEvents();
            },

            detectTouch: function () {
                Site.vars.isTouch = 'ontouchstart' in document.documentElement;

                if (!Site.vars.isTouch) {
                    $('.js-cursor').show();
                    Site.cursor.mouseEvents();
                    $('body').removeClass('is-touch');
                } else {
                    if (Site.vars.windowWidth < 992) {
                        Site.moveMapWithDevice();
                    }
                    $('body').addClass('is-touch');
                    $('.js-cursor').hide();
                }
            },

            followCursor: function (e) {
                var posX = e.clientX;
                var posY = e.clientY;

                TweenLite.to(Site.cursor.$cursorEl, 0, {
                    x: posX,
                    y: posY,
                });
            },

            mouseEvents: function () {

                $('.js-follow-link').on('mouseenter', function (e) {
                    Site.cursor.$cursorEl.addClass('cursor--disappear');
                });

                $('body').on('mouseenter', '.js-cursor-hover, .content a', function (e) {
                    Site.cursor.$cursorEl.addClass('cursor--on-link');
                });

                $('body').on('mouseenter', '.js-cursor-hover-medium', function (e) {
                    Site.cursor.$cursorEl.addClass('cursor--on-link-medium');
                });

                $('.js-reveal-slider .js-follow-link-text').on('mouseenter', function (e) {
                    $(this).closest('.js-nav-link').addClass('is-hovered');
                    var $image = $(this).siblings('.js-image-to-load');
                    TweenMax.to($image, 1.33, {
                        ease: Power4.easeOut,
                        webkitClipPath: "circle(75px at 50% 50%)"
                    });
                });

                $('.js-reveal-slider .js-follow-link-text, .js-reveal-slider .js-image-to-load').on('mouseleave', function (e) {
                    $(this).closest('.js-nav-link').removeClass('is-hovered');
                    var $image = $(this).siblings('.js-image-to-load');
                    TweenMax.to($image, 1.33, {
                        ease: Power4.easeOut,
                        webkitClipPath: "circle(0 at 50% 50%)"
                    });

                });

                $('.js-reveal-slider').on('mouseleave', function (e) {
                    $(this).removeClass('is-hovered');
                });

                $('.js-offer-link .js-nav-link-hover').on('mouseenter', function (e) {
                    $(this).closest('.js-nav-link').addClass('is-hovered');
                });

                $('.js-offer-link .js-follow-link-text').on('mouseleave', function (e) {
                    $(this).closest('.js-nav-link').removeClass('is-hovered');
                });

                $('.js-egg-link .js-nav-link-hover').on('mouseenter', function (e) {
                    $(this).closest('.js-egg-link').addClass('is-hovered');
                });

                $('.js-egg-link .js-follow-link-text').on('mouseleave', function (e) {
                    $(this).closest('.js-egg-link').removeClass('is-hovered');
                });

                var mouse = {
                    x: 0,
                    y: 0,
                    sx: 0,
                    sy: 0,
                    scx: 0,
                    scy: 0
                }

                $(document).on('mousemove', function (e) {
                    var x = e.pageX;
                    var y = e.pageY;
                    var cx = (x - Site.vars.windowWidth / 2) / Site.vars.windowWidth / 2;
                    var cy = (y - Site.vars.windowHeight / 2) / Site.vars.windowHeight / 2;
                    var fx = x / Site.vars.windowWidth;
                    var fy = y / Site.vars.windowHeight;
                    mouse.sx = x;
                    mouse.sy = y;
                    mouse.scx = cx;
                    mouse.scy = cy;
                })

                $('.js-follow-link-text').on('mousemove', function (e) {
                    var it = this;
                    var w = this.clientWidth;
                    var h = this.clientHeight;
                    var rect = this.getBoundingClientRect();
                    var x = rect.left;
                    var y = rect.top;
                    var dx = (mouse.sx - x) / w - 0.5;
                    var dy = (mouse.sy - y) / h - 0.5;

                    TweenLite.to(it, 0.33, {
                        x: dx * w * 0.5,
                        y: dy * h * 0.75,
                    });
                });

                $('.js-slider-container').on('mouseleave', '.js-follow-arrow', function (e) {
                    var it = this;
                    TweenLite.to(it, 0.4, {
                        x: 0,
                        y: 0,
                    });
                });

                $('.js-slider-container').on('mousemove', '.js-follow-arrow', function (e) {
                    var it = this;
                    var w = this.clientWidth;
                    var h = this.clientHeight;
                    var rect = this.getBoundingClientRect();
                    var x = rect.left;
                    var y = rect.top;
                    var dx = (mouse.sx - x) / w - 0.5;
                    var dy = (mouse.sy - y) / h - 0.5;

                    TweenLite.to(it, 0.33, {
                        x: dx * w * 0.5,
                        y: dy * h * 0.75,
                    });
                });

                $('.js-follow-link-text').on('mouseleave', function (e) {
                    var it = this;
                    TweenLite.to(it, 0.4, {
                        x: 0,
                        y: 0,
                    });
                });

                $('body').on('mouseleave', '.js-cursor-hover, .js-cursor-hover-medium, .content a', function (e) {
                    Site.cursor.$cursorEl.removeClass('cursor--on-link cursor--on-link-medium');
                });

                $('.js-follow-link').on('mouseleave', function (e) {
                    var $this = $(this);
                    Site.cursor.$cursorEl.removeClass('cursor--disappear');
                });
            },

            dragEvents: function () {
                Site.map.on('dragstart', function () {
                    $('.js-cursor').addClass('cursor--dragging');
                });

                Site.map.on('dragend', function () {
                    $('.js-cursor').removeClass('cursor--dragging');
                });
            }
        },

        introAnimation: function () {
            $('body').addClass('is-released');
        },

        metiers: {
            init: function () {
                this.switchSections();
                this.setFirstOnLoad();
            },

            setFirstOnLoad: function () {
                if (Site.vars.page === 'nos-metiers') {
                    var hash = Site.vars.hash;
                    if (hash) {
                        $(`.js-apropos-nav a[href*="${hash}"]`).click();
                        if ($(`.js-apropos-nav a[href*="${hash}"]`).length === 0) {
                            $('.js-apropos-nav li:first a').click();
                        }
                    } else {
                        $('.js-apropos-nav li:first a').click();
                    }
                }
            },

            setFirstOnClick: function () {
                var $first = $('.js-apropos-nav li:first a');
                setTimeout(function () {
                    $('.js-apropos-nav li:first a').click();
                }, 250);
            },

            switchSections: function () {
                $('.js-apropos-nav a').on('click', function () {
                    $(this).closest('.js-apropos-nav').find('.is-active').removeClass('is-active');
                    $('.js-apropos-section.is-active').removeClass('is-active');
                    var index = $(this).closest('li').addClass('is-active').index();

                    $('.js-apropos-section').eq(index).addClass('is-active');
                    var movement = (Site.vars.windowWidth >= 1200) ? 1.5 : 2;
                    $(this).closest('.js-apropos-nav').css('transform', `translateY(-${index * movement}em)`);
                });
            }
        },

        sections: {
            init: function () {
                this.addEvents();
            },

            addEvents: function () {
                $('.js-nav-link').on('click', this.openSection);
                $('.js-close-btn').on('click', this.closeSection);
            },

            openSection: function (e) {
                e.preventDefault();
                $('.js-close-btn').addClass('is-active');
                $('.js-map-info').addClass('is-hidden');


                var section = $(this).data('section');
                $('.js-close-btn').attr('data-open-section', section);

                if (Site.vars.isMobile) {
                    $(this).addClass('is-hidden');
                    Site.sections.openMobileSection($(this), section);
                } else {
                    Site.sections.openDesktopSection($(this), section);
                }

                if (section === 'nos-metiers' && !Site.vars.hash) {
                    Site.metiers.setFirstOnClick();
                }
            },

            openMobileSection: function ($navEl, section) {
                $('.js-nav-link').addClass('is-hidden');
                $('.js-' + section).show().scrollTop(0);
                setTimeout(function () {
                    $('.js-' + section).addClass('is-open');
                }, 100)
                if (section === 'nos-metiers' || section === 'apropos') {
                    $('.js-logo').addClass('is-hidden');
                }
                if (!$('body').hasClass('is-loaded')) {
                    Site.loader.revealSite();
                }
            },

            openDesktopSection: function ($navEl, section) {
                $('.js-contact-link').addClass('is-hidden');

                if ($navEl.hasClass('js-reveal-slider')) {
                    Site.offers.openOfferDesktop.call($navEl);
                    return;
                }

                $('.js-' + section).show().scrollTop(0);

                if ($navEl.hasClass('js-hide-markers')) {
                    $('.js-logo, .mapboxgl-marker').addClass('is-hidden');
                }
                if ($('.js-' + section).hasClass('js-contact') || $('.js-' + section).hasClass('js-apropos') || $('.js-' + section).hasClass('js-nos-metiers')) {
                    $('.js-nav-top').addClass('is-not-extended');
                }
                setTimeout(function () {
                    $('.js-' + section).addClass('is-open');
                }, 100)

                if (section === 'apropos' || section === 'nos-metiers') {
                    setTimeout(function () {
                        $('.js-viewfinder').addClass('is-active');
                        setTimeout(function () {
                            $('.js-viewfinder').addClass('is-released');
                        }, 1500);
                    }, 500);
                }
            },

            closeSection: function (e) {
                e.preventDefault();
                $('.js-map-info').removeClass('is-hidden');
                $('.js-nav-link').css('pointer-events', 'none');
                setTimeout(function () {
                    $('.js-nav-link').css('pointer-events', 'auto');
                }, 1000);

                if ($('.js-close-btn').hasClass('js-close-offer') || $('.js-close-btn').hasClass('js-close-lightbox')) {
                    return;
                }

                $('.js-nav-link.is-hidden').removeClass('is-hidden');
                $('.js-close-btn').removeClass('is-active').attr('data-open-section', 'none');

                var $section = $('.js-section.is-open');
                if ($section.hasClass('js-contact') || $section.hasClass('js-apropos') || $section.hasClass('js-nos-metiers')) {
                    setTimeout(function () {
                        $('.js-nav-top').removeClass('is-not-extended');
                    }, 1500);
                }

                if (!Site.vars.isMobile && $section.hasClass('js-slider-container')) {
                    Site.offers.closeOfferDesktop($section);
                    return;
                }

                $section.removeClass('is-open');

                setTimeout(function () {
                    $section.hide();
                }, 700);

                if ($(this).attr('data-open-section') === 'nos-metiers') {
                    $('.js-apropos-section').removeClass('is-active');
                    location.hash = '';
                }

                if (!Site.vars.isMobile) {
                    $('.js-viewfinder').removeClass('is-released');
                    $('.js-viewfinder').removeClass('is-active');
                    $('.js-logo, .mapboxgl-marker').removeClass('is-hidden');
                } else {
                    $('.js-logo').removeClass('is-hidden');
                }
            },
        },

        offers: {
            elements: {
                swiperRealisationsList: undefined,
                swiperRealisations: undefined
            },

            vars: {
                slickSlider: undefined,
                openedOffersInit: undefined,
                openedFromTopNav: undefined
            },

            init: function () {
                this.addEvents();
            },

            addEvents: function () {

                // open offer mobile
                $('.js-open-offer').on('click', function () {
                    if (Site.vars.isMobile) {
                        var offerId = $(this).data('offer-id');
                        var $html = $(`.js-offer[data-offer-id="${offerId}"]`);
                        Site.offers.openOfferMobile($html);
                    }
                });

                $('body').on('click', '.js-swiper-button', function () {
                    var slider = $(this).siblings('.js-offer-gallery')[0].swiper;
                    if ($(this).hasClass('offer__gallery__button--prev')) {
                        slider.slidePrev();
                    } else {
                        slider.slideNext();
                    }
                }); //

                // close mobile offer
                $('body').on('click', '.js-close-offer', this.closeOfferMobile);
                $('body').on('click', '.js-close-lightbox', function () {
                    $('.js-offer-lightbox').removeClass('is-open');
                    $(this).removeClass('js-close-lightbox');
                });

                // show offer info
                $('.js-toggle-offer-info').on('mouseenter', function () {
                    $(this).closest('.js-offer-info').addClass('is-hovered');
                    $(this).closest('.js-offers-slider').find('.js-offer-gallery').addClass('hovering-text');
                });

                // hide offer info
                $('.js-offer-info').on('mouseleave', function () {
                    $(this).removeClass('is-hovered');
                    $(this).closest('.js-offers-slider').find('.js-offer-gallery').removeClass('hovering-text');
                });
                //
                // // show offers list
                $('.js-open-offers-list').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $this = $(this);
                    $this.css('pointer-events', 'none');
                    setTimeout(function () {
                        $this.css('pointer-events', 'auto');
                    }, 2000);
                    Site.offers.openOffersList();
                    setTimeout(function () {
                        $('.js-close-btn').addClass('is-active');
                    }, 300);

                    var url = $this.attr('data-url');
                    try {
                        history.pushState('pagechange', '', url);
                    }
                    catch (err) {
                        console.log(err);
                    }
                });
                //
                // close offers list
                $('.js-offers-list-nav').on('click', function (e) {
                    e.preventDefault();
                    Site.offers.closeOffersList();
                    $('.js-close-btn').removeClass('is-active');
                });
                //
                // var offerHoverTimer;
                // var $targetSlide;
                //

                $('.js-offers-list').on({
                    'mouseout': function () {
                        var $slider = $(this).closest('.js-section').find('.js-offers-slider.is-active');
                        var activeIndex = $(this).find('.is-active').index();
                        if ($slider.find('.js-preview-swiper')[0]) {
                            $slider.find('.js-preview-swiper')[0].swiper.slideTo(activeIndex, 500, false);
                        }
                    },
                });

                $('.js-offers-list li').on('mouseover').on('mousemove', function () {
                    var $this = $(this);
                    $this.addClass('is-hovered');
                    var offerId = $this.data('offer-id');
                    var $slider = $this.closest('.js-section').find('.js-offers-slider.is-active');


                    var index = $(this).index();
                    if ($slider.find('.js-preview-swiper')[0]) {
                        $slider.find('.js-preview-swiper')[0].swiper.slideTo(index, 500, false);
                    }

                    var $gallery = $(this).closest('.js-section').find('.js-offers-slider.is-active .js-offer-gallery');
                    var slideToGo = $gallery.find(`.swiper-slide[data-offer-id=${offerId}]`).eq(0).index();
                    if ($gallery[0]) {
                        $gallery[0].swiper.lazy.loadInSlide(slideToGo);
                    }
                });

                $('.js-offers-list li').on({
                    'mouseout': function () {
                        $(this).removeClass('is-hovered');
                    },
                    'click': function () {
                        if (Site.vars.isMobile) {
                            return;
                        }
                        var $this = $(this);

                        var offerId = $this.data('offer-id');

                        var $gallery = $(this).closest('.js-section').find('.js-offers-slider.is-active .js-offer-gallery');
                        $('.js-offers-list li.is-active').removeClass('is-active');
                        $this.addClass('is-active');

                        var $slideToGo = $gallery.find(`.swiper-slide[data-offer-id=${offerId}]`).eq(0);
                        var slideToGoIndex = $slideToGo.index();

                        if ($(this).attr('data-real-active')) {
                            slideToGoIndex = $(this).attr('data-real-active');
                        }

                        if ($gallery[0]) {
                            $gallery[0].swiper.slideTo(slideToGoIndex, 0);
                        }

                        $('.js-section.is-active').find('.js-preview-swiper').fadeOut();
                        setTimeout(function () {
                            $('.js-offers-list-nav.is-open').trigger('click');
                        }, 400);
                        $('.js-offers-list li').css('pointer-events', 'none');
                        setTimeout(function () {
                            $('.js-offers-list li').css('pointer-events', 'auto');
                        }, 3000);

                        if ($(this).index() === 0 && $gallery[0].swiper.activeIndex === 0) {
                            var url = $gallery.find('.swiper-slide-active').attr('data-slide-url');
                            try {
                                history.pushState('pagechange', '', url);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                    }
                });

                $('.js-offers-list').on('mouseleave', function () {
                    $(this).closest('.js-section').find('.js-offers-preview').velocity('fadeOut', { duration: 500 });
                });

                $('.js-nav-top .js-reveal-slider').on('click', function () {
                    Site.offers.vars.openedFromTopNav = true;
                });

                $('.js-nav-link[data-update-page="offres-actuelles"], .js-nav-link[data-update-page="ventes-realisees"]').on('click', function () {
                    Site.offers.vars.openedOffersInit = true;
                });

            },

            closeOfferMobile: function () {
                if ($(this).hasClass('js-close-lightbox')) {
                    return;
                }
                $('.js-offer').addClass('is-closed');
                $('.js-close-btn').removeClass('js-close-offer');
                setTimeout(function () {
                    $('.js-offer').hide();
                    $('.js-offer').find('.slick-slider')
                    $('.js-offer').removeClass('is-closed is-open');
                }, 700);
            },

            openOfferMobile: function ($html) {
                var $imagesLoader = $html.siblings('.js-mobile-images-loader');
                var imagesLoaded = 0;
                $html.show();
                $html.scrollTop(0);

                var $lightbox;

                if ($html.data('images-loaded')) {
                    $('.js-close-btn').addClass('js-close-offer');
                    setTimeout(function () {
                        $html.addClass('is-open');
                    }, 100)
                    return;
                }

                var $gallery = $html.find('.js-offer-gallery').slick({
                    lazyLoad: 'progressive',
                    infinite: true,
                    rows: 0,
                    swipe: true,
                    nextArrow: '<button class="slick-next slick-arrow" aria-label="Next" type="button"></button>',
                    prevArrow: '<button class="slick-prev slick-arrow" aria-label="Previous" type="button"></button>'
                })
                    .on('lazyLoaded', function (e, slick, image, imageSource) {
                        image.attr('src', '');
                        $(image).parent().css('background-image', 'url("' + imageSource + '")');
                        image.hide();
                        var index = image.parent().index();
                        $html.find('.js-offer-lightbox-image').eq(index).find('img').attr('src', imageSource);
                        ++imagesLoaded;
                        var imagesCount = $html.find('.js-offer-gallery-image').length;
                        // $imagesLoader.css('transform', `translate3d(${imagesLoaded / imagesCount * 100}%, 0, 0)`);
                        $imagesLoader.css('transform', `translate3d(100%, 0, 0)`);

                        if (imagesLoaded === 1) {
                            $('.js-close-btn').addClass('js-close-offer');

                            $lightbox = $html.find('.js-offer-lightbox').slick({
                                infinite: true,
                                rows: 0,
                                nextArrow: '<button class="slick-next slick-arrow js-cursor-hover" aria-label="Next" type="button"></button>',
                                prevArrow: '<button class="slick-prev slick-arrow js-cursor-hover" aria-label="Previous" type="button"></button>'
                            })
                                .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                                    $gallery.slick('slickGoTo', nextSlide, true);
                                });

                            $html.find('.js-open-lightbox').on('click', function () {
                                $html.find('.js-offer-lightbox').addClass('is-open');
                                $('.js-close-btn').addClass('js-close-lightbox');
                            });

                            $html.data('images-loaded', '1');
                            $imagesLoader.addClass('is-loaded');
                            setTimeout(function () {
                                $imagesLoader
                                    .css('transition-duration', '0s')
                                    .css('transform', 'translate3d(0, 0, 0)')
                                    .css('transition-duration', '2s')
                                    .removeClass('is-loaded');
                            }, 1200);
                            setTimeout(function () {
                                $html.addClass('is-open');
                            }, 100)
                        }
                    })
                    .on('lazyLoadError', function (event, slick, currentSlide, nextSlide) {
                        console.log('error');
                    })
                    .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                        $lightbox.slick('slickGoTo', nextSlide, true);
                    });
            },

            openOfferDesktop: function () {
                var $this = $(this);
                var $section = $('.js-' + $this.attr('data-section'));

                $this.find('.js-follow-link-text').trigger('mouseout');

                var sliderId = $this.attr('data-slider-id');
                var $slider = $section.find(`.js-offers-slider[data-slider-id="${sliderId}"]`);

                $section.show().scrollTop(0);


                $slider.show();
                setTimeout(function () {
                    if (!$slider.find('.js-preview-swiper').hasClass('swiper-container-initialized')) {
                        Site.offers.initOffersPreviewSlider($slider);
                    }
                    if (!$slider.find('.js-offer-gallery').hasClass('swiper-container-initialized')) {
                        Site.offers.initOffersSlider($slider);
                    } else {
                        Site.offers.revealSliderDesktop($slider);
                    }
                }, 500);

                $('.js-close-btn').attr('data-jump-to-lng', Site.map.getCenter().lng);
                $('.js-close-btn').attr('data-jump-to-lat', Site.map.getCenter().lat);
            },

            initOffersPreviewSlider: function ($slider) {
                new Swiper($slider.find('.js-preview-swiper'), {
                    observer: true,
                    observeParents: true,
                    effect: 'fade',
                    preloadImages: true,
                    fadeEffect: {
                        crossFade: true
                    },
                    loop: false,
                });
            },

            initOffersSlider: function ($slider) {

                var $gallery = $slider.find('.js-offer-gallery');
                this.mouseMoveEffect($gallery);

                var $imagesLoader = $slider.siblings('.js-images-loader');

                if (!$('body').hasClass('is-loaded')) {
                    $imagesLoader = $('.js-images-loader-main');
                }

                var imagesLoaded = 0;

                var $infosSlider = $gallery.siblings('.js-offer-info-slider');

                var initialSlideNumber = window.location.hash ? (window.location.hash.substring(1) - 1) : 0;

                if (window.location.hash) {
                    var offerImageSlug = Site.vars.slug + '-' + window.location.hash.substring(1);
                    var $activeOfferImage = $gallery.find(`[data-offer-image-slug="${offerImageSlug}"]`)
                    initialSlideNumber = $activeOfferImage.index();
                    if ($activeOfferImage.length == 0) {
                        window.location = '/404';
                    }
                } else {
                    initialSlideNumber = 0;
                }

                $('.js-offer-description').each(function () {
                    var p = $(this).find('p:first');
                    if (p.height() < 20) {
                        $(this).closest('.js-toggle-offer-info').css({
                            'transform': 'translateY(calc(100% - 3em))',
                            '-ms-transform': 'translateY(calc(100% - 3em))'
                        });
                    }
                });

                new Swiper($gallery, {
                    speed: 1000,
                    initialSlide: initialSlideNumber,
                    lazy: {
                        loadPrevNext: true,
                        loadPrevNextAmount: 2,
                        loadOnTransitionStart: true
                    },
                    navigation: false,
                    on: {
                        init: function () {
                            Site.offers.revealSliderDesktop($slider);
                            $gallery.siblings('.js-offer-gallery-count').find('.js-offer-gallery-active').text(initialSlideNumber + 1);

                            var offerId = $gallery.find('.swiper-slide').eq(this.activeIndex).data('offer-id');
                            $gallery.closest('.js-section').find(`.js-offers-list-container li[data-offer-id="${offerId}"]`).addClass('is-active');
                            if ($infosSlider.length) {
                                if (initialSlideNumber === 0) {
                                    $infosSlider.find('.js-offer-info').eq(this.activeIndex).addClass('is-active');
                                } else {
                                    $infosSlider.find(`.js-offer-info[data-offer-id="${offerId}"]`).addClass('is-active');
                                }
                                $infosSlider.find('.js-offer-info-text').each(function () {
                                    if ($(this).height() < 61) {
                                        $(this).addClass('is-short');
                                    }
                                });
                            } else {
                                if ($gallery.siblings('.js-offer-info').find('.js-offer-info-text').height() < 61) {
                                    $gallery.siblings('.js-offer-info').find('.js-offer-info-text').addClass('is-short');
                                }
                            }

                            var $activeSlide = $gallery.find(`.swiper-slide`).eq(this.activeIndex);
                            var activeCount = $activeSlide.attr('data-offer-image-id');
                            var totalCount = $gallery.find('.swiper-slide[data-offer-id="' + offerId + '"]').length;

                            if (activeCount == 1) {
                                $gallery.siblings('.swiper-button-prev').addClass('is-disabled');
                            } else {
                                $gallery.siblings('.swiper-button-prev').removeClass('is-disabled');
                            }

                            if (activeCount == totalCount) {
                                $gallery.siblings('.swiper-button-next').addClass('is-disabled')
                            } else {
                                $gallery.siblings('.swiper-button-next').removeClass('is-disabled');
                            }

                            $gallery.siblings('.js-offer-gallery-count').find('.js-offer-gallery-active').text(activeCount);
                            $gallery.siblings('.js-offer-gallery-count').find('.js-offer-gallery-total').text(totalCount);

                            if (!$slider.hasClass('offers__slider--single')) {
                                var previewToGo = $gallery.siblings('.js-preview-swiper').find(`.swiper-slide[data-slider-id="${offerId}"]`).index();
                                if ($gallery.siblings('.js-preview-swiper')[0]) {
                                    $gallery.siblings('.js-preview-swiper')[0].swiper.slideTo(previewToGo, 0);
                                }

                                var $preview = $gallery.siblings('.js-preview-swiper').find(`.swiper-slide[data-slider-id="${offerId}"]`);
                                $preview.css('background-image', `url(${$activeSlide.data('image-uri')})`);
                                if ($activeSlide.hasClass('offer__gallery__image--vertical')) {
                                    $preview.addClass('offers__preview--vertical');
                                } else {
                                    $preview.removeClass('offers__preview--vertical');
                                }
                            }

                        },
                        slideChange: function () {
                            var $activeSlide = $gallery.find('.swiper-slide').eq(this.activeIndex);
                            var offerId = $activeSlide.data('offer-id');

                            var activeCount = $activeSlide.attr('data-offer-image-id');
                            var totalCount = $gallery.find('.swiper-slide[data-offer-id="' + offerId + '"]').length;

                            if (activeCount == 1) {
                                $gallery.siblings('.swiper-button-prev').addClass('is-disabled');
                            } else {
                                $gallery.siblings('.swiper-button-prev').removeClass('is-disabled');
                            }

                            if (activeCount == totalCount) {
                                $gallery.siblings('.swiper-button-next').addClass('is-disabled')
                            } else {
                                $gallery.siblings('.swiper-button-next').removeClass('is-disabled');
                            }

                            $gallery.siblings('.js-offer-gallery-count').find('.js-offer-gallery-active').text(activeCount);
                            $gallery.siblings('.js-offer-gallery-count').find('.js-offer-gallery-total').text(totalCount);


                            var url = $activeSlide.attr('data-slide-url');
                            try {
                                history.pushState('pagechange', '', url);
                            }
                            catch (err) {
                                console.log(err);
                            }

                            if (!$infosSlider.find(`[data-offer-id=${offerId}]`).hasClass('is-active')) {
                                $infosSlider.find('.is-active').removeClass('is-active');
                                $infosSlider.find(`[data-offer-id=${offerId}]`).addClass('is-active');
                            }

                            var lng = $activeSlide.data('lng');
                            var lat = $activeSlide.data('lat');
                            Site.map.flyTo({
                                center: [lng, lat],
                                speed: 2,
                                curve: 1,
                                easing(t) {
                                    return t * (2 - t);
                                }
                            });
                        },
                        slideChangeTransitionStart: function () {
                            var $activeSlide = $gallery.find('.swiper-slide').eq(this.activeIndex);
                            var offerId = $activeSlide.data('offer-id');

                            var $preview = $gallery.siblings('.js-preview-swiper').find(`.swiper-slide[data-slider-id="${offerId}"]`);
                            $preview.css('background-image', $activeSlide.css('background-image'))
                            if ($activeSlide.hasClass('offer__gallery__image--vertical')) {
                                $preview.addClass('offers__preview--vertical');
                            } else {
                                $preview.removeClass('offers__preview--vertical');
                            }
                        },
                        slideChangeTransitionEnd: function () {
                            var $activeSlide = $gallery.find('.swiper-slide').eq(this.activeIndex);
                            var offerId = $activeSlide.data('offer-id');

                            var $preview = $gallery.siblings('.js-preview-swiper').find('.swiper-slide-active');
                            $preview.closest('.js-section').find('.js-offers-list').find('.js-open-offer[data-offer-id="' + offerId + '"]').attr('data-real-active', this.activeIndex);

                        }
                    },
                });

            },

            revealSliderDesktop: function ($slider) {
                var top = $slider.attr('data-pos-top');
                var left = $slider.attr('data-pos-left');

                if (!$('body').hasClass('is-loaded')) {
                    top = Site.vars.windowWidth / 2;
                    left = Site.vars.windowHeight / 2;
                }

                var lng = $slider.find('.slick-active').data('lng') || $slider.find('.swiper-slide-active').data('lng');
                var lat = $slider.find('.slick-active').data('lat') || $slider.find('.swiper-slide-active').data('lat');

                setTimeout(function () {
                    $slider.closest('.section').addClass('is-open');
                    if ($slider.hasClass('offers__slider--single')) {
                        $slider.closest('.section').addClass('is-open-single');
                    }
                    $slider.addClass('is-active');
                    $slider.css({
                        'clip-path': `circle(110vw at ${left}px ${top}px)`,
                        'webkit-clip-path': `circle(110vw at ${left}px ${top}px)`
                    });

                    if (!$('body').hasClass('is-loaded')) {
                        Site.loader.revealSiteForOffer();
                    }
                }, 200);

                setTimeout(function () {
                    Site.loader.counters.lngAnim.pauseResume();
                    Site.loader.counters.latAnim.pauseResume();

                    Site.map.flyTo({
                        center: [lng, lat],
                        speed: 2,
                        curve: 1,
                        easing(t) {
                            return t * (2 - t);
                        }
                    });
                }, 1200);

                if (Site.offers.vars.openedOffersInit && !window.location.hash) {
                    $('.js-hide-on-open-offers-list').addClass('is-hidden');
                    setTimeout(function () {
                        if (!$('body').hasClass('is-loaded')) {
                            Site.loader.revealSiteForOffer();
                        } else {
                            Site.offers.openOffersList();
                        }
                        Site.offers.vars.openedOffersInit = false;
                    }, 960);
                } else {
                    $('.js-preview-swiper').fadeOut();
                    if ($('body').attr('data-page') != 'realisation') {
                        $('.js-close-btn').removeClass('is-active');
                    }
                }

            },

            openOffersList: function () {
                if (Site.vars.isMobile) {
                    return;
                }
                var $gallery = $('.js-offers-slider.is-active').find('.js-offer-gallery');
                var currentTransform = $gallery.css('transform');
                TweenMax.killTweensOf($gallery);
                $gallery.siblings('.js-preview-swiper').css('transform', currentTransform);

                var $listContainer = $('.js-section.is-open').find('.js-offers-list-container').show();
                $('.js-open-offers-list').fadeOut();
                $('.js-hide-on-open-offers-list').addClass('is-hidden');
                $('.js-section.is-open').find('.js-preview-swiper').fadeIn();

                setTimeout(function () {
                    $listContainer.addClass('is-open').prev('.js-offers-list-nav').addClass('is-open');
                }, 100);
                setTimeout(function () {
                    $('.js-close-offers-list').fadeIn();
                }, 400);
            },

            closeOffersList: function () {
                if (Site.vars.isMobile || !$('.js-offers-list-nav').hasClass('is-open')) {
                    return;
                }
                var $listContainer = $('.js-offers-list-nav.is-open').closest('.js-section').find('.js-offers-list-container');
                $('.js-close-offers-list').fadeOut();
                $listContainer.removeClass('is-open').prev('.js-offers-list-nav').removeClass('is-open');;
                setTimeout(function () {
                    $('.js-open-offers-list').fadeIn();
                }, 400);
                setTimeout(function () {
                    $listContainer.hide();
                    $('.js-hide-on-open-offers-list').removeClass('is-hidden');
                    $('.js-preview-swiper').fadeOut();
                }, 1500);

                var url = $('.js-offers-slider.is-active').find('.slick-active').attr('data-slide-url');
                try {
                    history.pushState('pagechange', '', url);
                }
                catch (err) {
                    console.log(err);
                }
            },


            closeOfferDesktop: function ($section) {
                var $slider = $section.find('.js-offers-slider.is-active');
                var lng = $('.js-close-btn').attr('data-jump-to-lng');
                var lat = $('.js-close-btn').attr('data-jump-to-lat');
                Site.offers.vars.openedFromTopNav = false;

                var delay = 1;

                if ($('.js-offers-list-nav').hasClass('is-open')) {
                    delay = 500;
                    $('.js-offers-list-nav').trigger('click');
                }

                setTimeout(function () {
                    Site.map.jumpTo({
                        center: [lng, lat]
                    });

                    $slider.css({
                        'clip-path': `circle(0 at ${Site.vars.windowWidth - 40}px 38px)`,
                        'webkit-clip-path': `circle(0 at ${Site.vars.windowWidth - 40}px 38px)`
                    });

                    var bgImage = $slider.find('.swiper-slide-active').css('background-image');
                    var sliderId = $slider.attr('data-slider-id');
                    $(`.js-reveal-slider[data-slider-id="${sliderId}"]`).find('.js-image-to-load').css('background-image', bgImage);

                    $slider.removeClass('is-active');
                    $section.removeClass('is-open is-open-single');
                    setTimeout(function () {
                        $section.css('transition-duration', '0s');
                        Site.maps.updateOffersPositions();
                        setTimeout(function () {
                            $section.css('transition-duration', '1s');
                        }, 100);
                        $section.hide();
                        $slider.hide();
                        $('.js-offer-info').removeClass('is-active');
                    }, 1000);
                }, delay);
            },





            mouseMoveEffect: function ($slider) {
                var startPos;
                var maxMovement = 50;

                function moveElement(movement) {
                    TweenMax.to($slider, 3, {
                        scale: 1.07,
                        x: movement,
                        ease: Power3.easeOut
                    });
                }

                function resetMovement() {
                    startPos = null;
                    $slider.find('.swiper-slide-active').css('transform', 'translate3d(0, 0, 0)');
                }

                $slider.on('mousemove', function (e) {
                    startPos = startPos || Site.vars.windowWidth / 2;
                    var movement = (startPos - e.clientX) / 15;
                    if (movement < -maxMovement) {
                        movement = -maxMovement;
                    }
                    if (movement > maxMovement) {
                        movement = maxMovement;
                    }
                    moveElement(movement);
                });
            }

        },

        viewfinder: function () {

            var $map = $('.js-map');
            var $viewfinderMap = $('.js-viewfinder-map');
            var $viewfinderLogo = $('.js-viewfinder-logo');

            $('.js-viewfinder').on('mousemove', function (e) {
                var $this = $(this);
                var offset = $this.offset();

                var width = $this.outerWidth();
                var height = $this.outerHeight();

                var moveX = (e.pageX - offset.left);
                var moveY = (e.pageY - offset.top);


                moveX = (width / 2 - moveX) / 3;
                moveY = (height / 2 - moveY) / 3;

                $viewfinderMap.css('transform', `translate3d(${moveX}px, ${moveY}px, 0)`)
                $viewfinderLogo.css('transform', `translate3d(${moveX}px, ${moveY}px, 0)`)
                $map.find('.mapboxgl-canvas-container').css('transform', `translate3d(${moveX * 1.5}px, ${moveY * 1.5}px, 0)`)
            });

            $('.js-viewfinder').on('mouseleave', function (e) {
                $viewfinderMap.css('transform', 'translate3d(0,0,0)');
                $viewfinderLogo.css('transform', 'translate3d(0,0,0)');
                $map.find('.mapboxgl-canvas-container').css('transform', 'translate3d(0,0,0)');
            });
        },

        maps: {
            settings: {
                initZoom: 13.9,
                token: 'pk.eyJ1IjoiYm9yaXNmZWxkbWFuIiwiYSI6ImNqcmpjYTgwaTBhOTY0NG8wdDBrdWJkZDIifQ.ITalaEmeLce7Ip-iKfcJIQ'
            },

            vars: {
                hasInteracted: false
            },

            markers: {
                all: new Array,
                nav: new Array(),
                offers: new Array()
            },

            init: function () {
                this.setup();
                this.addNavElements();
                this.addEvents();
                this.showDirections();
                this.updateOffersPositions();
                this.toggleMarkers()
            },

            setup: function () {
                var initLng = $('.js-logo').data('fly-to-lng');
                var initLat = $('.js-logo').data('fly-to-lat');

                mapboxgl.accessToken = Site.maps.settings.token;
                Site.map = new mapboxgl.Map({
                    container: 'mapbox',
                    style: 'mapbox://styles/borisfeldman/cjrz2u90h2dc91fp8kh1o4un4?optimize=true',
                    center: [initLng, initLat],
                    zoom: Site.maps.settings.initZoom,
                    minZoom: 5,
                    maxZoom: 18,
                    dragRotate: false,
                    keyboard: false
                });
            },

            addEvents: function () {
                Site.map.on('move', function () {
                    Site.maps.updateCenter(Site.map.getCenter().lng, Site.map.getCenter().lat)
                    Site.maps.updateOffersPositions();
                    Site.maps.toggleMarkers()
                    if (!Site.maps.vars.hasInteracted) {
                        Site.maps.onFirstMove();
                    }
                });

                Site.map.on('moveend', function () {
                    if ($('.map [data-update-page="ventes-realisees"]').hasClass('is-out-of-bounds')) {
                        $('.nav--top [data-update-page="ventes-realisees"]').addClass('is-visible');
                    } else {
                        $('.nav--top [data-update-page="ventes-realisees"]').removeClass('is-visible');
                    }
                });

                $('.js-fly-to').on('click', function () {
                    var lng = $(this).data('fly-to-lng');
                    var lat = $(this).data('fly-to-lat');
                    Site.map.flyTo({
                        center: [lng, lat],
                        zoom: Site.maps.settings.initZoom,
                        speed: 0.75,
                        curve: 1,
                        easing(t) {
                            return t * (2 - t);
                        }
                    });
                });

                $('.js-zoom-to').on('click', function () {
                    var lng = $(this).data('lng');
                    var lat = $(this).data('lat');

                    $('.js-map').addClass('is-zoomed-in');

                    $('.js-close-btn')
                        .addClass('js-zoom-back')
                        .attr('data-prev-zoom', Site.map.getZoom())
                        .attr('data-prev-lng', Site.map.getCenter().lng)
                        .attr('data-prev-lat', Site.map.getCenter().lat);

                    Site.map.flyTo({
                        center: [lng - 0.002, lat - 0.0005],
                        zoom: 17,
                        speed: 2.33,
                        curve: 1,
                        easing(t) {
                            return t;
                        }
                    });
                });

                $('body').on('click', '.js-zoom-back', function () {
                    $('.js-map').removeClass('is-zoomed-in');
                    $('.js-close-btn').removeClass('js-zoom-back');

                    var zoom = $(this).attr('data-prev-zoom');
                    var lng = $(this).attr('data-prev-lng');
                    var lat = $(this).attr('data-prev-lat');

                    Site.map.flyTo({
                        center: [lng, lat],
                        zoom: zoom,
                        speed: 2,
                        curve: 1,
                        easing(t) {
                            return t;
                        }
                    });
                });

            },

            onFirstMove: function () {
                $('.js-map-info').addClass('seen');
                $('.is-home-hidden').removeClass('is-home-hidden');
                Site.maps.vars.hasInteracted = true;
            },

            toggleMarkers: function () {
                var isHome = true;

                Site.maps.markers.all.forEach(checkIfInBounds);
                Site.maps.markers.nav.forEach(checkIfHome);
                checkIfOffersOutOfBounds();

                if (!isHome) {
                    $('.js-retour-link').addClass('is-visible');
                } else {
                    if (Site.map.getZoom() >= 12) {
                        $('.js-retour-link').removeClass('is-visible');
                    }
                }

                if (Site.map.getZoom() < 12) {
                    $('.js-map .mapboxgl-marker').addClass('is-too-small');
                    $('.js-retour-link').addClass('is-visible');
                } else {
                    $('.js-map .mapboxgl-marker').removeClass('is-too-small');
                    if (isHome) {
                        $('.js-retour-link').removeClass('is-visible');
                    }
                }

                function checkIfInBounds(element, index, array) {
                    if (!inBounds(element._lngLat, Site.map.getBounds())) {
                        $(element._element).addClass('is-out-of-bounds');
                    } else {
                        $(element._element).removeClass('is-out-of-bounds');
                    }
                }

                function checkIfHome(element, index, array) {
                    if (!inBounds(element._lngLat, Site.map.getBounds())) {
                        isHome = false;
                    }
                }

                function inBounds(point, bounds) {
                    var lng = (point.lng - bounds._ne.lng) * (point.lng - bounds._sw.lng) < 0;
                    var lat = (point.lat - bounds._ne.lat) * (point.lat - bounds._sw.lat) < 0;
                    return lng && lat;
                }

                function checkIfOffersOutOfBounds() {
                    if ($('.js-list-link.is-out-of-bounds').length === 2) {
                        Site.maps.displayExtendedMenu();
                    } else {
                        Site.maps.hideExtendedMenu();
                    }
                }
            },

            displayExtendedMenu: function () {
                $('.js-nav-top').addClass('is-extended');
            },

            hideExtendedMenu: function () {
                $('.js-nav-top').removeClass('is-extended');
            },

            updateCenter: function (lng, lat) {
                $('.js-center-lng').text(parseFloat(lng).toFixed(6));
                $('.js-center-lat').text(parseFloat(lat).toFixed(6));
            },

            updateOffersPositions: function () {

                $('.map .js-reveal-slider').each(function () {
                    var $this = $(this);
                    var $section = $('.js-' + $this.attr('data-section'));

                    var top = parseInt($this.offset().top);
                    var left = parseInt($this.offset().left);

                    var sliderId = $this.attr('data-slider-id');
                    var $slider = $section.find(`.js-offers-slider[data-slider-id="${sliderId}"]`);

                    $slider.attr('data-pos-top', top);
                    $slider.attr('data-pos-left', left);

                    $section.attr('data-clip-x', left);
                    $section.attr('data-clip-y', top);

                    if (!$section.hasClass('is-open')) {
                        $slider.css({
                            'clip-path': `circle(0 at ${left}px ${top}px)`,
                            'webkit-clip-path': `circle(0 at ${left}px ${top}px)`
                        });
                    }

                });

                if ($('.js-nav-top').hasClass('is-extended') && !$('.js-slider-container').hasClass('is-open')) {
                    var offersTop = 80;
                    var offersLeft = $(window).width() - 41;
                    var realisationsTop = 125;
                    var realisationsLeft = $(window).width() - 41;

                    $('.js-offers-slider[data-slider-id="offers"]').css({
                        'clip-path': `circle(0 at ${offersLeft}px ${offersTop}px)`,
                        'webkit-clip-path': `circle(0 at ${offersLeft}px ${offersTop}px)`
                    }).attr('data-pos-top', offersTop).attr('data-pos-left', offersLeft);

                    $('.js-offers-slider[data-slider-id="ventes-realisees"]').css({
                        'clip-path': `circle(0 at ${realisationsLeft}px ${realisationsTop}px)`,
                        'webkit-clip-path': `circle(0 at ${realisationsLeft}px ${realisationsTop}px)`
                    }).attr('data-pos-top', realisationsTop).attr('data-pos-left', realisationsLeft);
                }
            },

            createMarker: function () {
                var el = $(this).clone()[0];
                var lng = parseFloat($(this).data('lng'));
                var lat = parseFloat($(this).data('lat'));

                var marker = new mapboxgl.Marker(el)
                    .setLngLat([lng, lat])
                    .addTo(Site.map);

                Site.maps.markers.all.push(marker);
                if ($(this).closest('.js-nav-main').length) {
                    Site.maps.markers.nav.push(marker);
                }
                if ($(this).closest('.js-offer-link').length) {
                    Site.maps.markers.offers.push(marker);
                }
            },

            addNavElements: function () {
                $('.js-nav-main a').each(this.createMarker);
                $('.js-nav-realisations a').each(this.createMarker);
            },

            showDirections: function () {

                var directions = new MapboxDirections({
                    styles: directionsStyle,
                    accessToken: mapboxgl.accessToken,
                    interactive: false,
                    alternatives: false,
                    controls: false
                });

                Site.map.addControl(directions);

                $('.js-directions').on('click', function () {
                    var tween = TweenLite.to('.js-directions-loader', 15, { ease: Power2.easeOut, width: '100%' });
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(setRoute);
                    } else {
                        console.log('Geolocation is not supported by this browser.');
                    }

                    $('.js-close-btn').one('click', function () {
                        TweenLite.to('.js-directions-loader', 0.5, { width: '100%' });
                        $('.js-directions-loader').addClass('is-loaded');
                    });

                    function setRoute(position) {
                        $('.js-close-btn')
                            .trigger('click')
                            .addClass('js-zoom-back is-active')
                            .attr('data-prev-zoom', Site.map.getZoom())
                            .attr('data-prev-lng', Site.map.getCenter().lng)
                            .attr('data-prev-lat', Site.map.getCenter().lat)
                            .one('click', function () {
                                directions.removeRoutes();
                                $('.mapboxgl-marker, .js-map-info').removeClass('is-hidden');
                            });

                        $('.js-contact-link').addClass('is-hidden');
                        setTimeout(function () {
                            $('.mapboxgl-marker').addClass('is-hidden');
                        }, 100);

                        directions.on('destination', function (e) {
                            TweenLite.to('.js-directions-loader', 1, { width: '100%' });
                            $('.js-directions-loader').addClass('is-loaded');
                        })
                        directions.setOrigin([position.coords.longitude, position.coords.latitude]);
                        directions.setDestination([$('.js-logo').data('office-lng'), $('.js-logo').data('office-lat')]);
                        $('.js-map-info').addClass('is-hidden');
                    }
                });
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        Site.init();
    });
}());
