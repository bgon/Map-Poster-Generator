// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == previewModal) {
        previewModal.className = "Modal is-hidden";
        body.className = "";
        container.className = "MainContainer";
        container.parentElement.className = "";
    }
    if (event.target == shareModal) {
        shareModal.className = "Modal is-hidden";
        body.className = "";
        container.className = "MainContainer";
        container.parentElement.className = "";
    }
};
//the JSONP function for is.gd shortener
function short_url() {
    var shorturl = '';
    if (arguments[0].shorturl === undefined) {
        shorturl = 'error';
    } else {
        shorturl = arguments[0].shorturl;
    }
    document.getElementById("shortUrl").innerHTML = shorturl;
}

function share() {
    //Open the modal
    shareModal.className = "Modal is-visuallyHidden";
    setTimeout(function() {
        container.className = "MainContainer is-blurred";
        shareModal.className = "Modal";
    }, 100);
    container.parentElement.className = "ModalOpen";

    //load thejsonp
    var s = document.createElement('script');
    var url = window.location.href;
    var short_url = resolved_location_name.substring(0, 10) + init_lat.toFixed(2) + '_' + init_lng.toFixed(2);
    s.type = 'text/javascript';
    s.src = 'https://is.gd/create.php?format=json&callback=short_url&url=' + url + '&logstats=0';
    var h = document.getElementsByTagName('script')[0];
    h.parentNode.insertBefore(s, h);
}

// from http://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
var parseQueryString = function() {
    var str = window.location.search;
    var objURL = {};
    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            objURL[$1] = $3;
        }
    );
    return objURL;
};

function posterDownload(width) {
    is_edit = false;
    changeCanvasSize(width);
}

function posterPreview(width) {
    is_preview = true;
    is_edit = false;
    var ctx = preview_canvas.getContext('2d');
    ctx.clearRect(0, 0, preview_canvas.width, preview_canvas.height);

    ctx.fillStyle = "#EEE";
    ctx.font = 30 + "px Asimov";
    ctx.textAlign = 'center';
    ctx.fillText('Generating the preview', preview_canvas.width / 2, 200);

    changeCanvasSize(width);
    previewModal.className = "Modal is-visuallyHidden";
    setTimeout(function() {
        container.className = "MainContainer is-blurred";
        previewModal.className = "Modal";
    }, 100);
    container.parentElement.className = "ModalOpen";
}

function closePreview() {
    is_preview = false;
    previewModal.className = "Modal is-hidden is-visuallyHidden";
    body.className = "";
    container.className = "MainContainer";
    container.parentElement.className = "";
}

function closeShare() {
    is_preview = false;
    shareModal.className = "Modal is-hidden is-visuallyHidden";
    body.className = "";
    container.className = "MainContainer";
    container.parentElement.className = "";
}
