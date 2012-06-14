/* プリクラ booth app class */

/** @constructor */
Booth = function() {
  this.localVideo;
  this.localCanvas;
};

Booth.prototype.initialize = function(localVideoElement, localCanvasElement, trigger) {
  this.localVideo = (localVideoElement || document.getElementById("localVideo"));
//  this.localCanvas = (localCanvasElement || document.getElementById("localCanvas"));
  this.trigger = (localCanvasElement || document.getElementById("localVideo"));
  this.trigger.onclick = this.onClickTrigger.bind(this);
  // TODO This needs fixing ..
  this.sound = document.createElement('audio');
  this.sound.autoplay = false;
  this.sound.controls = false;
  this.sound.hidden = true;
  this.sound.loop = false;
  this.sound.src = './shutter.wav';
  this.getUserMedia();
};

Booth.prototype.onClickTrigger = function(e) {
  this.localVideo.style.display = '';
  setTimeout(this.capture.bind(this), 2000);
  setTimeout((function(){this.sound.play()}).bind(this), 1500);
};

Booth.prototype.getUserMedia = function() {
  try {
    navigator.webkitGetUserMedia(
        "video,audio",
        this.onGotStream.bind(this),
        this.onFailedStream.bind(this));
  } catch (e) {
    alert("getUserMedia error " + e);
  }
};

Booth.prototype.drawDetectedAreas = function(comp) {
  var ctx2 = this.localCanvas.getContext('2d');
  ctx2.lineWidth = 2;
  ctx2.lineJoin = "round";

  var x_offset = 0;
  var y_offset = 0;
  var x_scale = 1;
  var y_scale = 1;
  if (
      (this.localVideo.clientWidth * this.localVideo.videoHeight) >
      (this.localVideo.videoWidth * this.localVideo.clientHeight)) {
    x_offset = (
        (this.localVideo.clientWidth -
            ((this.localVideo.clientHeight * this.localVideo.videoWidth) /
                this.localVideo.videoHeight)) / 2);
  } else {
    y_offset = (
        (this.localVideo.clientHeight -
            ((this.localVideo.clientWidth * this.localVideo.videoHeight) /
                this.localVideo.videoWidth)) / 2);
  }
  x_scale = ((this.localVideo.clientWidth - x_offset * 2) /
      this.localVideo.videoWidth) || 1;
  y_scale = ((this.localVideo.clientHeight - y_offset * 2) /
      this.localVideo.videoHeight) || 1;

  for (var i = 0; i < comp.length; i++) {
    comp[i].x = ((comp[i].x * x_scale) + x_offset);
    comp[i].y = ((comp[i].y * y_scale) + y_offset);
    comp[i].width = (comp[i].width * x_scale);
    comp[i].height = (comp[i].height * y_scale);
    var opacity = 0.1;
    if (comp[i].confidence > 0) {
      opacity += (comp[i].confidence / 10);
      if (opacity > 1.0) {
        opacity = 1.0;
      }
    }
    ctx2.lineWidth = (opacity * 10);
    ctx2.strokeStyle = "rgb(255, 0, 0)";
    ctx2.strokeRect(comp[i].x, comp[i].y, comp[i].width, comp[i].height);
    var eyey = (comp[i].y + ((comp[i].height / 100.0) * 35.0));
    var eyex1 = (comp[i].x + ((comp[i].width / 100.0) * 30.0));
    var eyex2 = (comp[i].x + ((comp[i].width / 100.0) * 70.0));
    ctx2.strokeRect(eyex1 - 10, eyey - 10, 20, 20);
    ctx2.strokeRect(eyex2 - 10, eyey - 10, 20, 20);
  }
};

Booth.prototype.capture = function() {
  /* Capture image from webcam and detect face */
  var w = this.localVideo.videoWidth;
  var h = this.localVideo.videoHeight;
  // result canvas
  this.localCanvas = document.createElement('canvas');
  this.localCanvas.width = w;
  this.localCanvas.height = h;
  // captured image from video stream into canvas
  var ctx = this.localCanvas.getContext('2d');
  ctx.drawImage(this.localVideo, 0, 0, w, h);
  // Swith to captured image
  this.localVideo.parentNode.insertBefore(
      this.localCanvas,
      this.localVideo.nextSibling);
  this.localVideo.style.display = 'none';
  // TODO saving doesn't work in chrome atm
//  this.localCanvas.onclick = this.onClickSaveCanvasImage.bind(this);
  // create temporary capture canvas
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(this.localCanvas, 0, 0, w, h);
  // Call CCV for face detection
  var comp = ccv.detect_objects(
      {
        "canvas" : ccv.grayscale(canvas),
        "cascade" : cascade,
        "interval" : 5,
        "min_neighbors" : 1
      });
  // apply filters
  this.localCanvas.getContext('2d').putImageData(
      purikuraFilter(ctx, comp), 0, 0);
  console.log(comp);
/*
  // replace canvas with the more (user) useful img tag
  var img = document.createElement('img');
  img.src = this.localCanvas.toDataURL();
  this.localCanvas.parentNode.insertBefore(
      img, this.localCanvas);
  this.localCanvas.parentNode.removeChild(
      this.localCanvas);
  this.localCanvas = null;
*/
  this.localCanvas.onmousedown = this.onMouseDownPaintCanvas;
  this.localCanvas.onmouseup = this.onMouseUpPaintCanvas;
  this.localCanvas.onmousemove = this.onMouseMovePaintCanvas;
  // display video again when we're ready for next photo
  this.localVideo.style.display = '';
};

Booth.prototype.onGotStream = function(stream) {
  // connect webcam to video tag
  var url = webkitURL.createObjectURL(stream);
  this.localVideo.style.opacity = 1;
  this.localVideo.src = url;
  this.localStream = stream;
};

Booth.prototype.onFailedStream = function(error) {
  alert("Failed to get access to local media. Error code was " + error.code + ".");
};

Booth.prototype.onClickSaveCanvasImage = function(e, format) {
  var format = format || 'image/png';
  console.log('Format: ' + format);
  // none seem to work in chrome :(
//  document.location.href = e.target.toDataURL(format).replace(format, 'image/octet-stream');
//  window.open(e.target.toDataURL(format), '_newtab');
};

Booth.prototype.onMouseDownPaintCanvas = function(e) {
  e.target.isPainting = ('rgb('+
    Math.floor(Math.random()*256) + ','+
    Math.floor(Math.random()*256) + ','+
    Math.floor(Math.random()*256) + ')');
  e.target.lineWidth = 6;
  var ctx = e.target.getContext('2d');
  var imageData = ctx.getImageData(
      0, 0, e.target.width, e.target.height);
//  ctx.putImageData(imageData, 0, 0);
};

Booth.prototype.onMouseUpPaintCanvas = function(e) {
  e.target.isPainting = false;
};

Booth.prototype.onMouseMovePaintCanvas = function(e) {
  if (e.target.isPainting) {
    var ctx = e.target.getContext('2d');
//    var imageData = ctx.getImageData(
//        0, 0, e.target.width, e.target.height);
    ctx.strokeStyle = e.target.isPainting;
    ctx.lineWidth = e.target.lineWidth;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.lineTo(e.offsetX + e.webkitMovementX, e.offsetY + e.webkitMovementY);
    ctx.stroke();
    ctx.closePath();
//    ctx.putImageData(imageData, 0, 0);
  }
};

