# jqnMap
Simple responsive jQuery map with markers.

## Setup
```
var $el = $("#map").jqnMap({
  mapFile: "images/map.png", //image's file name
  mapWidth: 1181, //image's width
  mapHeight: 536, //image's height
  icons: { //icons
      0: {
          id: 0, //icon's id
          file: "images/markers/marker.png", //icon's file name
          width: 100, //icon's width
          height: 100 //icon's height
      }
  },
  markers: [ //markers
      {
          id: 'marker1', //marker's id
          iconId: 0, //icon's id
          ratio: 0.5, //icon scale ratio
          x: 280, //marker's coordinate (in map)
          y: 290 //marker's coordinate (in map)
      }
  ],
  markerClick: function (marker) {
      //this event will be triggered when a marker is clicked
  },
  markerMouseIn: function (marker) {
      //this event will be triggered when a marker is hovered
  },
  popupShown: function (marker) {
      //use this to manipulate popup's content
      //e.g. return $("#popup-demo").html();
  },
  markerMouseOut: function (marker) {
      //this event will be triggered when a marker is no longer hovered
  }
});
```
## Functions
```
//Get the object instance
var map = $el.data("jqnMap");

//Redraw all the markers
map.redraw();

//Draw all the current markers
map.drawMarkers();

//Remove all the markers
map.removeAllMarkers();

//Load a new set of icons: this will call removeAllMarkers(); in order to avoid conflicts
map.loadIcons(icons, remap);

//Load a new set of markers
map.loadMarkers(markers, remap);

//Remapping attributes example
map.loadMarkers(data, {
    oldKey1: "newKey1", //map only attribute's name
    oldKey2: { //map attribute's name and change its value
        key: "newKey2",
        value: function (obj, currentValue) {
            return newValue;
        },
        keep: true //false to delete old attribute
    }
});
```
