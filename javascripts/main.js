//Canvas & Map variables
var map = {};
var gmno_print;
var canvas_bounds = {};
var map_canvas = document.getElementById("map");
var preview_canvas = document.getElementById('posterPreviewCanvas');
var poster_canvas = document.createElement('canvas');
var is_preview = false;
var is_edit = true;
var init_lat = 19.412999928811075;
var init_lng = -99.0078285008301;
var init_zoom = 14;
var stroke_weight = 0.05;
var bold = 0;
var generated_size = 384;
var resolved_location_name = 'Mexico';

//Modal
var previewModal = document.getElementById('previewModal');
var shareModal = document.getElementById('shareModal');
var body = document.getElementsByTagName('body');
var container = document.getElementById('container');

var urlSettings = parseQueryString();
if (Object.keys(urlSettings).length === 5) {
    var init_lat = parseFloat(urlSettings.lat);
    var init_lng = parseFloat(urlSettings.lng);
    var init_zoom = parseInt(urlSettings.zoom);
    var resolved_location_name = decodeURIComponent(urlSettings.name);
    document.title = 'Poster Map Generator: ' + resolved_location_name;
    var bold = parseInt(urlSettings.bold);
}

/**
 * Set the  weight of the road stroke
 * @param {int} width width of the map
 */
function setStrokeWeight(width) {

    if (width == 384) {
        if (bold === 0) {
            stroke_weight = 0.3;
        } else {
            stroke_weight = 2.25;
        }
    }
    if (width == 768) {
        if (bold === 0) {
            stroke_weight = 0.5;
        } else {
            stroke_weight = 3.25;
        }
    }

    if (width == 3072) {
        if (bold === 0) {
            stroke_weight = 1.6;
        } else {
            stroke_weight = 6.4;
        }
    }
    if (width == 6144) {
        if (bold === 0) {
            stroke_weight = 8;
        } else {
            stroke_weight = 10;
        }
    }

}

/**
 * change the Map size  and create it
 * @param {int} width width of the map
 */
function changeCanvasSize(width) {
    map = {};
    setStrokeWeight(width);

    if (width == 3072) {
        document.getElementById("mapContainer").style.opacity = 0;
        displayStatus("Generating the map, be patient");
    }
    if (width == 6144) {
        document.getElementById("mapContainer").style.opacity = 0;
        displayStatus("Loading the map, we abort after 45 seconds");
        setTimeout(function () {
            document.getElementById("mapContainer").style.opacity = 1;
            is_edit = true;
            changeCanvasSize(384);
        }, 45000);
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
    document.getElementById('map').style.width = width + "px";
    document.getElementById('map').style.height = height + "px";
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

function displayStatus(message) {
    document.getElementById("messages").innerHTML = message;
}

/**
 * Generate the picture as poster_canvas, preview or save it
 */
function generatePicture() {

    displayStatus("Fixing the layout...");

    //Google requires clear, visible attribution to both Google and their data providers when the Content is shown
    //https://www.google.com/permissions/geoguidelines.html
    //this info will be too small when generated...
    //Thus we will insert the gmno_print string as text in the poster
    document.getElementById("pac-input").style.display = 'none';
    document.getElementsByClassName("gmnoprint")[0].style.display = 'none';
    document.getElementsByClassName("gmnoprint gm-style-cc")[0].style.display = 'none';
    document.getElementsByClassName("gmnoprint gm-bundled-control gm-bundled-control-on-bottom")[0].style.display = 'none';
    document.querySelector('[src^="http://maps.gstatic.com/mapfiles/api-3/images/google"]').style.display = 'none';

    gmno_print = document.getElementsByClassName("gmnoscreen")[0].firstChild.firstChild.textContent;

    html2canvas(map_canvas, {
        useCORS: true
    }).then(function (canvas) {
        document.getElementsByClassName("gmnoprint")[0].style.display = 'initial';
        document.getElementsByClassName("gmnoprint gm-style-cc")[0].style.display = 'initial';

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
        poster_canvas_ctx.fillText(gmno_print + " | " + render_date, PW / 2, PcopyY);

        //save or preview
        if (is_preview) {
            previewPicture();
        } else {
            document.getElementById("mapContainer").style.opacity = 1.0;
            savePicture();
        }
    });
}

function savePicture() {
    is_edit = true;
    var image_name = resolved_location_name + '_' + generated_size + '_' + init_lat + '_' + init_lng + '_' + init_zoom;
    poster_canvas.toBlob(function (blob) {
        saveAs(blob, image_name + '.jpg');
    }, "image/jpeg", 1.0);

    // //PDF generation :-)
    // // base64, but only the data
    // data = dest_canvas.toDataURL('image/jpeg', 1.0).slice('data:image/jpeg;base64,'.length);
    // // Convert the data to binary form
    // data = atob(data);
    // var doc = new jsPDF('p', 'mm', [297, 210]);
    // doc.addImage(data, 'JPEG', 0, 0, 210, 297);
    // doc.save(image_name + '.pdf');
    displayStatus("Image dowmloaded as " + image_name + '.jpg');
    changeCanvasSize(384);
}

function previewPicture() {
    is_preview = false;
    is_edit = true;
    var ctx = preview_canvas.getContext('2d');
    ctx.drawImage(poster_canvas, 0, 0, 480, 678);
    displayStatus('');
    changeCanvasSize(384);
}

function initScript() {
    changeCanvasSize(generated_size);
}

/**
 * Create the map
 */
function initMap() {
    var styles = [{
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{
            "color": "#FFFFFF"
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "landscape",
        "elementType": "labels.text",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{
            "weight": "1.0"
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
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [{
            "visibility": "on"
        }]
    }, {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [{
            "visibility": "on"
        }]
    }, {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }];
    var styledMap = new google.maps.StyledMapType(styles, {
        name: "Poster"
    });
    var mapOptions = {
        center: {
            lat: init_lat,
            lng: init_lng
        },
        disableDefaultUI: true,
        zoomControl: true,
        keyboardShortcuts: true,
        zoom: init_zoom,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'weight_style']
        }
    };


    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    map.mapTypes.set('weight_style', styledMap);
    map.setMapTypeId('weight_style');

    //The Search Box
    var input = document.createElement("input");
    input.setAttribute("id", "pac-input");
    input.setAttribute("class", "controls");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Search Box");
    document.getElementById('map').appendChild(input);
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    map.addListener('tilesloaded', function () {
        displayStatus("Map generated");

        if (canvas_bounds != map.getBounds()) {
            canvas_bounds = map.getBounds();
            if (is_edit === false) {
                generatePicture();
            }
        }
    });

    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
        init_zoom = map.zoom;
        init_lat = map.center.lat();
        init_lng = map.center.lng();

        // update the url for the sharing option
        var url = '?bold=' + bold + '&zoom=' + map.zoom + '&lat=' + map.center.lat() + '&lng=' + map.center.lng() + '&name=' + resolved_location_name;
        window.history.replaceState("", "", url);
        // update the Title
        document.title = "Map Poster Generator: " + resolved_location_name;
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
        map.fitBounds(bounds);
    });
}
