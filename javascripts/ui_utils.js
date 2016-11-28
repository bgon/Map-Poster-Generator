// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == infoModal) {
        closeModal();
        document.getElementById("messages").innerHTML = "";
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
    document.getElementById("messages").innerHTML = '<input value="' + shorturl + '" onclick="this.select();" class="share" readonly="" type="text">';
}

function share() {
    openModal();
    //load thejsonp
    var s = document.createElement('script');
    var url = encodeURIComponent(window.location.href);
    s.type = 'text/javascript';
    s.src = 'https://is.gd/create.php?format=json&callback=short_url&url=' + url + '&logstats=0';
    var h = document.getElementsByTagName('script')[0];
    h.parentNode.insertBefore(s, h);
}

// from http://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
var parseQueryString = function () {
    var str = window.location.search;
    var objURL = {};
    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function ($0, $1, $2, $3) {
            objURL[$1] = $3;
        }
    );
    return objURL;
};

function save(width) {
    is_save_image = true;
    changeCanvasSize(width);
}

function displayStatus(message) {
    document.getElementById("messages").innerHTML = message;
}

function closeModal() {
    infoModal.className = "Modal is-hidden is-visuallyHidden";
    body.className = "";
    container.className = "MainContainer";
    container.parentElement.className = "";
}

function openModal() {
    infoModal.className = "Modal is-visuallyHidden";
    setTimeout(function () {
        container.className = "MainContainer is-blurred";
        infoModal.className = "Modal";
    }, 50);
    container.parentElement.className = "ModalOpen";
}