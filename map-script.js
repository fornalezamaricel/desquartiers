
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
            Site.onResize();
            Site.setPageData();
            Site.maps.init();
            Site.checkBreakpoints();
            Site.loader.init();
            Site.loadOffers();
            window.addEventListener('resize', Site.onResize);
        },
        setPageData: function () {
            const body = document.body;
            Site.vars.page = body.getAttribute('data-page');
            Site.vars.slug = body.getAttribute('data-slug');
            Site.vars.hash = window.location.hash;
        },

        loader: {
            options: {
                useEasing: true,
                useGrouping: false,
                separator: '',
                decimal: '.',
                decimalPlaces: 6,
                duration: 1.5,
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
                    this.enableScroll();
                }
            },

            enableScroll: function () {
                document.getElementById('map-overlay').addEventListener('click', function () {
                    this.style.display = 'none'; // Hide the overlay
                    Site.map.scrollZoom.enable(); // Enable map scroll zoom 
                })
            },

            startCounter: function () {
                const CountUp = countUp.CountUp;
                if (!CountUp) {
                    console.error('CountUp is not loaded');
                    return;
                }

                this.counters.lngAnim = new CountUp('longitude', 2.378628, Site.loader.options);
                this.counters.latAnim = new CountUp('latitude', 48.853373, Site.loader.options);

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
                }, 500);


            },
            startCounter404: function () {
                const CountUp = countUp.CountUp;
                if (!CountUp) {
                    console.error('CountUp is not loaded');
                    return;
                }


                this.counters.lngAnim = new CountUp('longitude', 40.4, Site.loader.options);
                this.counters.latAnim = new CountUp('latitude', 40.4, Site.loader.options);

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
                } else {
                    Site.vars.isMobile = true;
                }
            }

            breakpoint.addListener(breakpointChecker);
            breakpointChecker();

        },

        onResize: function () {
            Site.vars.windowWidth = window.innerWidth;
            Site.vars.windowHeight = window.innerHeight;

        },



        loadOffers: function () {
            fetch('/src/offer.json')
                .then(res => res.json())
                .then(offers => {
                    const offerListContainer = document.getElementById('offer-list');

                    offers.forEach(offer => {
                        // Create list item
                        // const offerItem = document.createElement('div');
                        // offerItem.className = 'offer-item';
                        // offerItem.innerHTML = `<strong>${offer.name}</strong><br>${offer.type} - ${offer.area}`;
                        // offerListContainer.appendChild(offerItem);

                        // Create custom HTML element for the marker
                        const el = document.createElement('div');
                        el.className = 'custom-mapbox-marker';
                        // Conditionally add class for featured offers
                        if (offer.isFeatured) {
                            el.classList.add('is-featured');
                        }
                        el.style.setProperty('--marker-bg-image', `url(${offer.image})`);
                        el.innerHTML = `
  <div class="inner-circle"></div>
  <div class="marker-subtitle">${offer.name} - ${offer.type} ${offer.area}</div>
`;

                        new mapboxgl.Marker({
                            element: el,
                            anchor: 'center',// Ensure the anchor is the center
                            offset: [0, 0]
                        })
                            .setLngLat([offer.lng, offer.lat])
                            .addTo(Site.map);


                        // Fly to marker on click from list
                        // offerItem.addEventListener('click', () => {
                        //     Site.map.flyTo({ center: [offer.lng, offer.lat], zoom: 15 });
                        //     marker.togglePopup();
                        // });
                    });
                })
                .catch(err => console.error('Failed to load offers:', err));
        },

        viewfinder: function () {

        },

        maps: {
            settings: {
                initZoom: 13.9,
                token: 'pk.eyJ1IjoiYm9yaXNmZWxkbWFuIiwiYSI6ImNqcmpjYTgwaTBhOTY0NG8wdDBrdWJkZDIifQ.ITalaEmeLce7Ip-iKfcJIQ'
            },

            vars: {
                hasInteracted: false
            },


            init: function () {
                this.setup();
                this.addEvents();
                this.showDirections();
                // this.updateOffersPositions();
                // this.toggleMarkers()

            },

            setup: function () {
                mapboxgl.accessToken = Site.maps.settings.token;
                Site.map = new mapboxgl.Map({
                    container: 'mapbox',
                    style: 'mapbox://styles/borisfeldman/cjrz2u90h2dc91fp8kh1o4un4?optimize=true',
                    center: [2.378628, 48.855376],
                    zoom: Site.maps.settings.initZoom,
                    minZoom: 5,
                    maxZoom: 18,
                    dragRotate: false,
                    keyboard: false
                });
            },

            addEvents: function () {
                Site.map.on('move', function () {
                    const center = Site.map.getCenter();
                    // Fallback if CountUp hasn't initialized yet
                    if (!Site.loader.latAnim || !Site.loader.lngAnim) {
                        document.getElementById('latitude').textContent = center.lat.toFixed(6);
                        document.getElementById('longitude').textContent = center.lng.toFixed(6);
                        return;
                    }
                    Site.maps.updateCenter(center.lng, center.lat)
                    Site.maps.updateOffersPositions();
                    Site.maps.toggleMarkers()
                    if (!Site.maps.vars.hasInteracted) {
                        Site.maps.onFirstMove();
                    }
                });


            },

            onFirstMove: function () {
            },
            toggleMarkers: function () {

            },
            updateCenter: function (lng, lat) {
                // Update CountUp values — animate to new coordinates
                Site.loader.counters.latAnim.update(lat);
                Site.loader.counters.lngAnim.update(lng);
            },
            showDirections: function () {
                // Create MapboxDirections control with your style and options
                var directions = new MapboxDirections({

                    accessToken: mapboxgl.accessToken,
                    interactive: false,
                    alternatives: false,
                    controls: false
                });

                // Add directions control to your map instance
                Site.map.addControl(directions);

            },




        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        Site.init();
    });
}());
