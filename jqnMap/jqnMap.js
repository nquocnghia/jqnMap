/**
 * jqnMap v0.1.0 Plugin for jQuery
 *
 * Created by nquocnghia
 *
 * Released under the terms of the MIT license.
 */
;
(function ($, window, document, undefined) {
    //Instantiation
    if (!$.jqnMap) {
        $.jqnMap = {};
    }

    var pluginName = "jqnMap",
        /**
         * Default parameters of a map
         * @type {{mapFile: string, mapWidth: number, mapHeight: number, markers: Array, icons: {}, markerClick: Function, markerMouseIn: Function, popupShown: Function, markerMouseOut: Function}}
         */
        defaults = {
            mapFile: "map.png", //image file for the map
            mapWidth: 1181, //image's width
            mapHeight: 536, //image's height
            markers: [], //markers collection
            icons: {}, //icons for the markers
            /**
             * This event will be triggered when a marker is clicked
             * @param marker marker object
             */
            markerClick: function (marker) {
            },
            /**
             * This event will be triggered when a marker is hovered
             * @param marker marker object
             */
            markerMouseIn: function (marker) {
            },
            /**
             * This event will be triggered before showing the popup
             * @param marker
             * @returns HTML code of the content
             */
            popupShown: function (marker) {
                return null;
            },
            /**
             * This event will be triggered when a marker is no longer hovered
             * @param marker marker object
             */
            markerMouseOut: function (marker) {
            }
        },
        /**
         * Default parameters of a marker
         * @type {{id: string, iconId: number, ratio: number, x: number, y: number, disabled: boolean, clickable: boolean}}
         */
        markerDefault = {
            id: 'marker1',
            iconId: 0,
            ratio: 1,
            x: 0,
            y: 0,
            disabled: false, //add suffix "_disabled" to the icon file name
            clickable: true
        },
        /**
         * Default parameters of an icon
         * @type {{id: number, file: string, width: number, height: number}}
         */
        iconDefault = {
            id: 0,
            file: "marker.png",
            width: 100,
            height: 100
        };

    /**
     * Plugin's constructor
     * @param element
     * @param options
     * @constructor
     */
    $.jqnMap.Plugin = function (element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        init(this, element);
    };

    /**
     * Initiate the plugin itself
     * @param self
     * @param element
     */
    function init(self, element) {
        var $element = $(element);
        $element.addClass("jqnMap-container");

        var popupHtml = $("<div id='jqnMap-" + element.id + "-popup' class='jqnMap-popup'></div>");
        $("body").append(popupHtml);

        self.imgHtml = $("<img src='" + self.options.mapFile + "' class='jqnMap-map' />");
        self.imgHtml.appendTo($element);

        self.drawMarkers();

        $(window).resize(function () {
            self.redraw();
        });
    }

    /**
     * Remap object's attributes
     * @param objs
     * @param map
     * @example
     */
    function remapObj(objs, map) {
        for (var i = 0; i < objs.length; i++) {
            var obj = $.extend({}, objs[i]);

            $.map(map, function (v, k) {
                if (typeof v == "object") {
                    var keep = v.keep;
                    obj[k] = v.value.call(window, obj, obj[k]);
                    v = v.key;
                }
                obj[v] = obj[k];
                if (!keep) delete obj[k];
            });

            objs[i] = obj;
        }
    }

    /**
     * Plugin's prototypes
     * @type {{redraw: Function, drawMarkers: Function, removeAllMarkers: Function, loadIcons: Function, loadMarkers: Function}}
     */
    $.jqnMap.Plugin.prototype = {
        /**
         * Redraw all the markers
         */
        redraw: function () {
            this.removeAllMarkers();
            this.drawMarkers();
        },
        /**
         * Draw current markers
         */
        drawMarkers: function () {
            var options = this.options;

            var popupHtml = $("#jqnMap-" + this.element.id + "-popup");
            var scaleRatio = this.imgHtml.width() / options.mapWidth;

            for (var i = 0; i < options.markers.length; i++) {
                var marker = $.extend({}, markerDefault, options.markers[i]);
                marker.ratio *= scaleRatio;
                var icon = options.icons[marker.iconId];

                //filename.ext or filename.disabled.ext
                var fileName = marker.disabled ? icon.file.substring(0, icon.file.length - 4) + "_disabled" + icon.file.substring(icon.file.length - 4) : icon.file;

                var markerHtml = $("<div id='jqnMap-" + this.element.id + "-marker-" + marker.id + "' class='jqnMap-marker'><img src='" + fileName + "' /></div>");
                markerHtml.data("marker", marker);

                var width = icon.width * marker.ratio;
                var height = icon.height * marker.ratio;
                var y = marker.y * scaleRatio - height / 2;
                var x = marker.x * scaleRatio - width / 2;

                markerHtml.css({
                    top: y,
                    left: x,
                    "width": width,
                    "height": height
                });
                markerHtml.appendTo($(this.element));

                //Trigger hover event
                markerHtml.hover(function () {
                    options.markerMouseIn.call(this, $(this).data("marker"));
                    var html = options.popupShown.call(this, $(this).data("marker"));
                    popupHtml.html(html ? html : "");
                    popupHtml.fadeIn("fast");

                    $(document).on("mousemove", function (e) {
                        var pWidth = popupHtml.width();
                        var pHeight = popupHtml.height();
                        var sWidth = $(window).width();
                        var sHeight = $(window).height();
                        var x = e.pageX + 20;
                        var y = e.pageY - popupHtml.height() / 2;
                        if (x + pWidth > sWidth) x = x - pWidth - 40;
                        if (y < 0) {
                            y = 10;
                        }
                        else if (y + pHeight > sHeight) {
                            y = sHeight - pHeight - 10;
                        }
                        popupHtml.css({
                            left: x,
                            top: y
                        });
                    });
                }, function () {
                    popupHtml.hide();
                    popupHtml.html("");
                    $(document).off('mousemove');
                    options.markerMouseOut.call(this, $(this).data("marker"));
                });

                //Trigger click event
                markerHtml.click(function () {
                    if ($(this).data("marker").clickable)
                        options.markerClick.call(this, $(this).data("marker"));
                });
            }
        },
        /**
         * Remove all the markers
         */
        removeAllMarkers: function () {
            $(this.element).find(".jqnMap-marker").remove();
        },
        /**
         * Load a new set of icons
         * @param icons
         * @param remap
         */
        loadIcons: function (icons, remap) {
            //remapping attributes
            if (typeof remap != "undefined")
                remapObj(icons, remap);

            this.options.icons = {};
            for (var i = 0; i < icons.length; i++) {
                var newIcon = $.extend({}, iconDefault, icons[i]);
                this.options.icons[newIcon.id] = newIcon;
            }
        },
        /**
         * Load a new set of markers
         * @param markers
         * @param remap
         */
        loadMarkers: function (markers, remap) {
            //remapping attributes
            if (typeof remap != "undefined")
                remapObj(markers, remap);

            this.options.markers = markers;
        }
    };

    //add new plugin
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new $.jqnMap.Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);