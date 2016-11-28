//Canvas & Map variables
var road_map = {};
var road_map_canvas = document.getElementById("road_map");
var poster_canvas = document.createElement('canvas');
var poster_preview_canvas = document.getElementById('poster_preview_canvas');
var is_save_image = false;
var init_lat = 19.535150062652995;
var init_lng = -99.03838422592776;
var init_zoom = 14;
var generated_size = 384;
var resolved_location_name = 'Mexico City';
var poster_title = 'MEXICO CITY';
var stroke_weight = 1;
var url;
var copyrights;

//Modal
var infoModal = document.getElementById('infoModal');
var body = document.getElementsByTagName('body');
var container = document.getElementById('container');


//Url
var urlSettings = parseQueryString();
if (Object.keys(urlSettings).length === 4) {
    init_lat = parseFloat(urlSettings.lat);
    init_lng = parseFloat(urlSettings.lng);
    init_zoom = parseInt(urlSettings.zoom);
    resolved_location_name = decodeURIComponent(urlSettings.name);
    poster_title = '';
    for (var i = 0, len = resolved_location_name.length; i < len; i++) {
        poster_title = poster_title + resolved_location_name[i].toUpperCase() + '  ';
    }
    poster_title = poster_title.substring(0, poster_title.length - 2);
    document.title = 'Poster Map Generator: ' + resolved_location_name;
}

/**
 * change the Map size  and create it
 * @param {int} width width of the map
 */
function changeCanvasSize(width) {
    road_map = {};
    stroke_weight = 1;
    if (width != 384) {
        //Open the modal
        openModal();
        document.getElementById("mapContainer").style.opacity = 0;
        displayStatus("Generating the map, be patient...");
        stroke_weight = 3;
    }

    //update zoom with the new size
    var delta = Math.log2(width / generated_size);
    if (delta >= 0) {
        delta = Math.floor(delta);
    } else {
        delta = Math.ceil(delta);
    }
    init_zoom = init_zoom + delta;
    generated_size = width;
    height = width;
    document.getElementById('road_map').style.width = width + "px";
    document.getElementById('road_map').style.height = height + "px";
    initMap();
}


//from http://stackoverflow.com/questions/10521978/html5-canvas-image-contrast
function contrastImage(imageData, contrast) {
    var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (var i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
    return imageData;
}


/**
 * Generate the picture
 */
function generatePicture() {
    displayStatus("Fixing the layout...");

    //Google requires clear, visible attribution to both Google and their data providers when the content is shown
    //https://www.google.com/permissions/geoguidelines.html
    //this info will be too small when generated...
    //Thus we will insert this info as text in the poster

    nodes2hide = document.getElementsByClassName("gmnoprint");
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }
    nodes2hide = document.getElementsByClassName("gm-style-cc");
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }
    nodes2hide = document.querySelectorAll('[src^="http://maps.gstatic.com/mapfiles/api-3/images/google"]');
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }

    html2canvas(road_map_canvas, {
        useCORS: true
    }).then(function (canvas) {

        var Pr = 297 / 210;
        var PWf = generated_size / 0.8;
        var PW = Math.floor(PWf);
        var PH = Math.floor(Pr * PWf);
        var Pm = Math.floor(PWf * 0.1);
        var PtitleY = Math.floor(PH * 0.75);
        var PcopyY = Math.floor(PH * 0.85);
        var Ptitle_fontsize = Math.floor(generated_size / 20);
        var Pcopy_fontsize = Math.floor(generated_size / 80);

        var d = new Date();
        var render_date = d.toISOString().substring(0, 10);
        var poster_title = '';
        for (var i = 0, len = resolved_location_name.length; i < len; i++) {
            poster_title = poster_title + resolved_location_name[i].toUpperCase() + '  ';
        }
        poster_title = poster_title.substring(0, poster_title.length - 2);

        //boost the contrast to hide some few artefacts
        canvas_ctx = canvas.getContext("2d");
        var imageData = canvas_ctx.getImageData(0, 0, generated_size, generated_size);
        imageData = contrastImage(imageData, 70);
        canvas_ctx.putImageData(imageData, 0, 0);

        //Create the poster
        poster_canvas.width = PW;
        poster_canvas.height = PH;
        poster_canvas_ctx = poster_canvas.getContext("2d");
        poster_canvas_ctx.fillStyle = "#fff";
        poster_canvas_ctx.fillRect(0, 0, PW, PH);

        //copy the map
        //... too much artefacts with putImageData, use drawImage instead
        //poster_canvas_ctx.putImageData(imageData, Pm, Pm, 0, 0, generated_size, generated_size);
        poster_canvas_ctx.drawImage(canvas, Pm, Pm);

        //insert the texts
        poster_canvas_ctx.fillStyle = "#444";
        poster_canvas_ctx.font = Ptitle_fontsize + "px Asimov";
        poster_canvas_ctx.textAlign = 'center';
        poster_canvas_ctx.fillText(poster_title, PW / 2, PtitleY);
        poster_canvas_ctx.fillStyle = "#888";
        poster_canvas_ctx.font = Pcopy_fontsize + "px Asimov";
        poster_canvas_ctx.textAlign = 'center';
        poster_canvas_ctx.fillText(copyrights + " | " + render_date, PW / 2, PcopyY);

        image_name = resolved_location_name + '_' + generated_size + '_' + init_lat + '_' + init_lng + '_' + init_zoom;
        poster_canvas.toBlob(function (blob) {
            saveAs(blob, image_name + '.jpg');
        }, "image/jpeg", 1.0);
        //END
        is_save_image = false;
        changeCanvasSize(384);
        document.getElementById("mapContainer").style.opacity = 1;
        displayStatus('');
        closeModal();
    });
}

function initScript() {
    //The Search Box
    var input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    changeCanvasSize(generated_size);
}

/**
 * Create the map
 */
function initMap() {

    var myLatlng = new google.maps.LatLng(init_lat, init_lng);

    //road_map
    var mapOptions = {
        center: myLatlng,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },

        keyboardShortcuts: true,
        zoom: init_zoom,
        styles: [{
            "featureType": "all",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#FFFFFF"
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "weight": stroke_weight
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000F"
            }, {
                "weight": stroke_weight
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "weight": stroke_weight
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "weight": stroke_weight
            }]
        }]
    };

    road_map = new google.maps.Map(document.getElementById('road_map'), mapOptions);

    road_map.addListener('idle', function () {
        document.title = "Map Poster Generator: " + resolved_location_name;
        copyrights = document.getElementsByClassName("gmnoscreen")[0].firstChild.firstChild.textContent;
        var d = new Date();
        var render_date = d.toISOString().substring(0, 10);

        var ctx = poster_preview_canvas.getContext('2d');
        ctx.clearRect(0, 0, poster_preview_canvas.width, poster_preview_canvas.height);

        //insert the texts
        ctx.fillStyle = "#444";
        ctx.font = "20px Asimov";
        ctx.textAlign = 'center';
        ctx.fillText(poster_title, 240, 29);
        ctx.fillStyle = "#888";
        ctx.font = "7px Asimov";
        ctx.textAlign = 'center';
        ctx.fillText(copyrights + " | " + render_date, 240, 97);

        // update the url
        url = '?zoom=' + init_zoom + '&lat=' + init_lat + '&lng=' + init_lng + '&name=' + resolved_location_name;
        window.history.replaceState("", "", url);
    });

    road_map.addListener('tilesloaded', function () {
        if (is_save_image === true) {
            setTimeout(function () {
                generatePicture();
            }, 100);
        }
    });

    road_map.addListener('bounds_changed', function () {
        init_zoom = road_map.zoom;
        init_lat = road_map.center.lat();
        init_lng = road_map.center.lng();
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length === 0) {
            return;
        }
        resolved_location_name = places[0].name;
        poster_title = '';
        for (var i = 0, len = resolved_location_name.length; i < len; i++) {
            poster_title = poster_title + resolved_location_name[i].toUpperCase() + '  ';
        }
        poster_title = poster_title.substring(0, poster_title.length - 2);

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        road_map.fitBounds(bounds);
    });

}