
// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p>`);
  }

  const thresholds = [1, 3, 5, 7, 9, 100];
  const colors = ["#00ff00", "#aaff00", "#ffff00", "#ffaa00", "#ff0000"];

  function getColor(magnitude) {
    for (let i = 0; i < thresholds.length; i++) {
      if (magnitude <= thresholds[i]) {
        return colors[i];
      }
    }
    return colors[colors.length - 1];
  }

  function getMarkerOptions(feature) {
    return {
      radius: feature.properties.mag * 5,
      fillColor: getColor(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    };
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, getMarkerOptions(feature));
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": street
  };

  let overlayMaps = {
    Earthquakes: earthquakes
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create the legend object
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend"),
      grades = [-10, 10, 30, 50, 70, 90],
      labels = [];

    for (let i = 0; i < grades.length - 1; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor((grades[i] + grades[i + 1]) / 2) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
