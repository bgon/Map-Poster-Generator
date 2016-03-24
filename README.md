# Introduction
A single page application to create maps of your favorite area.
It creates a 3840x5430 | 7680x10860 (crash sometimes) JPEG file  or a PDF file you can then print on your favorite 180g paper.

# Usage
You need to get an API key from https://developers.google.com/maps/documentation/javascript/get-api-key#key to run it and is intented for private use only.
```html
<script src="http://maps.google.com/maps/api/js?key=<APIKEY>&libraries=places&callback=initScript" async defer></script>
```
# Demo

http://bgon.github.io/Map-Poster-Generator/

# Examples
![San Fransisco](images/san_francisco.png?raw=true "")
![Detroit](images/detroit.png?raw=true "")
![Dubai](images/dubai.png?raw=true "")
![Karlaplan](images/karlaplan.png?raw=true "")
![Paris](images/paris.png?raw=true "")
![Chicago](images/chicago.png?raw=true "")
# Dependencies
* html2canvas.js, renders the current page as a canvas image https://github.com/niklasvh/html2canvas
* canvas-toBlob.js, create Blob objects from an HTML canvas element https://github.com/blueimp/JavaScript-Canvas-to-Blob
* FileSaver.min.js, implements the HTML5 W3C saveAs() FileSaver interface in browsers that do not natively support it https://github.com/eligrey/FileSaver.js/
* jspdf.js and addimage.js for pdf creation https://github.com/MrRio/jsPDF
* ionicons icons https://github.com/driftyco/ionicons/
* Asimov  by Robert Jablonski http://www.dafont.com/robert-jablonski.d5679