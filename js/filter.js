// TODO(cskau): we don't need all the converters..

/* Source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript */
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255.0, g /= 255.0, b /= 255.0;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2.0;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6.0 : 0.0); break;
            case g: h = (b - r) / d + 2.0; break;
            case b: h = (r - g) / d + 4.0; break;
        }
        h /= 6.0;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if(t < 0.0) t += 1.0;
            if(t > 1.0) t -= 1.0;
            if(t < (1.0 / 6.0)) return p + (q - p) * 6.0 * t;
            if(t < (1.0 / 2.0)) return q;
            if(t < (2.0 / 3.0)) return p + (q - p) * ((2.0 / 3.0) - t) * 6.0;
            return p;
        }

        var q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
        var p = 2.0 * l - q;
        r = hue2rgb(p, q, h + (1.0 / 3.0));
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - (1.0 / 3.0));
    }

    return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

/* Purikura Filter */
function purikuraFilter(ctx, comp) {
  var CONTRAST = 1.2;
  var BRIGHTNESS = 0.08;
  var SATURATION = 0.08;
  var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var i = (imageData.width * imageData.height);
  console.log('Running Median Filter..');
  imageData = medianFilter(imageData, 3, 3);
  console.log('Running Normalization Filter..');
  imageData = normalizationFilter(imageData, 0.2, 0.5);
  ctx.putImageData(imageData, 0, 0);
  console.log('Running Pop-Eye Filter..');
  imageData = popeyeFilter(ctx, comp);
  return imageData;
  console.log('Running Custom Filter..');
  var data = imageData.data;
  while (--i) {
    var r = data[(4 * i) + 0];
    var g = data[(4 * i) + 1];
    var b = data[(4 * i) + 2];
    var a = data[(4 * i) + 3];
    /* purikira filter */
//    var hsv = rgbToHsv(r, g, b);
    /* hue */
//    hsv[0] += 0.08;
    /* saturation */
//    hsv[1] -= SATURATION;
    /* value / brightness */
//    hsv[2] += BRIGHTNESS;
//    hsv[2] *= BRIGHTNESS;
//    hsv[2] += 0.1 * BRIGHTNESS;

//    hsv[2] = (hsv[2] - 0.1) * 1.1;

// wash out colors (desaturate?)
//    hsv[2] = 0.5 + (hsv[2] - 0.5) * 0.4;

/** /
    // clamp values
    hsv[1] = (hsv[1] <= 1.0 ? hsv[1] : 1.0);
    hsv[2] = (hsv[2] <= 1.0 ? hsv[2] : 1.0);
    hsv[2] = (hsv[2] >= 0.0 ? hsv[2] : 0.0);
/**/

//    var rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
/*
    var hsl = rgbToHsl(r, g, b);

    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    // Write new values
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
*/

    data[4*i+0] = r;
    data[4*i+1] = g;
    data[4*i+2] = b;
    data[4*i+3] = a;
  }
  return imageData;
}

function medianFilter(imageData, windowWidth, windowHeight) {
  var windowWidth = (windowWidth || 3);
  var windowHeight = (windowHeight || 3);
  var midmid = Math.floor((windowWidth * windowHeight) / 2);
  var outputData = document.createElement('canvas');
  outputData.width = imageData.width;
  outputData.height = imageData.height;
  outputData = outputData.getContext('2d').getImageData(
      0, 0, imageData.width, imageData.height).data;
  var edgex = Math.floor(windowWidth / 2);
  var edgey = Math.floor(windowHeight / 2);
  var colorArrayR = new Array((windowWidth * windowHeight));
  var colorArrayG = new Array((windowWidth * windowHeight));
  var colorArrayB = new Array((windowWidth * windowHeight));
  var cai = 0;
  var idi = 0;
  var sorter = (function(a, b){return parseFloat(a) - parseFloat(b)});
  for (var x = edgex; x < (imageData.height - edgex); x++) {
    for (var y = edgey; y < (imageData.width - edgey); y++) {
      for (var fx = 0; fx < windowWidth; fx++) {
        for (var fy = 0; fy < windowHeight; fy++) {
          cai = (fx * windowWidth) + fy;
          idi = ((x + fx - edgex) * 4 * imageData.width) + (y + fy - edgey) * 4;
          colorArrayR[cai] = imageData.data[idi + 0];
          colorArrayG[cai] = imageData.data[idi + 1];
          colorArrayB[cai] = imageData.data[idi + 2];
        }
      }
      idi = ((x * 4) * imageData.width) + (y * 4);
      outputData[idi + 0] = colorArrayR.sort(sorter)[midmid];
      outputData[idi + 1] = colorArrayG.sort(sorter)[midmid];
      outputData[idi + 2] = colorArrayB.sort(sorter)[midmid];
    }
  }
  // have to copy pixels one-by-one
  // output is only sparsely filled, so only filled in parts
  for (var x = edgex; x < (imageData.height - edgex); x++) {
    for (var y = edgey; y < (imageData.width - edgey); y++) {
      idi = ((x * 4) * imageData.width) + (y * 4);
      imageData.data[idi + 0] = outputData[idi + 0];
      imageData.data[idi + 1] = outputData[idi + 1];
      imageData.data[idi + 2] = outputData[idi + 2];
    }
  }
  return imageData;
}

function normalizationFilter(imageData, alpha, beta) {
  var data = imageData.data;
  var min = rgbToHsl(data[0], data[1], data[2])[2];
  var max = rgbToHsl(data[0], data[1], data[2])[2];
  var newmin = 0.0;
  var newmax = 1.0;
  for (var i = (imageData.width * imageData.height); i; --i) {
    var r = data[(4 * i) + 0];
    var g = data[(4 * i) + 1];
    var b = data[(4 * i) + 2];
    var a = data[(4 * i) + 3];
    var hsl = rgbToHsl(r, g, b);
    min = (min > hsl[2] ? hsl[2] : min);
    max = (max < hsl[2] ? hsl[2] : max);
  }
  for (var i = (imageData.width * imageData.height); i; --i) {
    var r = data[(4 * i) + 0];
    var g = data[(4 * i) + 1];
    var b = data[(4 * i) + 2];
    var a = data[(4 * i) + 3];
    var hsl = rgbToHsl(r, g, b);
    if (alpha && beta) {
      // width of input intesity range
      var alpha = alpha || 0.4;
      // value of intensity around which to center
      var beta = beta || 0.5;
      hsl[2] = (
          ((newmin - newmax) *
              (1.0 / (1.0 + Math.exp((hsl[2] - beta) / alpha)))) +
          newmax);
    } else {
      hsl[2] = ((hsl[2] - min) * ((newmax - newmin) / (max - min))) + (newmin);
    }
    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
    imageData.data[(4 * i) + 0] = r;
    imageData.data[(4 * i) + 1] = g;
    imageData.data[(4 * i) + 2] = b;
    imageData.data[(4 * i) + 3] = a;
  }
  return imageData;
}

function popeyeFilter(ctx, comp) {
  var POP = 1.7;
  var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var data = imageData.data;
  // temp output buffer
  var outputData = document.createElement('canvas');
  outputData.width = imageData.width;
  outputData.height = imageData.height;
  outputData = outputData.getContext('2d').getImageData(
      0, 0, imageData.width, imageData.height).data;
  var x_scale = 1;
  var y_scale = 1;
  var x_offset = 0;
  var y_offset = 0;
  var eye_width = 0;
  var eye_height = 0;
  for (var i = 0; i < comp.length; i++) {
    eye_width = (comp[i].width * 0.14);
    eye_height = (comp[i].height * 0.09);
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
    var eyey = (comp[i].y + (comp[i].height * 0.40));
    var eyex1 = (comp[i].x + (comp[i].width * 0.28));
    var eyex2 = (comp[i].x + (comp[i].width * 0.72));

    function blendFrom(x, y) {
      var minx = Math.floor(x);
      var maxx = Math.ceil(x);
      var miny = Math.floor(y);
      var maxy = Math.ceil(y);
      var tli = xyToI(minx, miny, imageData.width);
      var tri = xyToI(maxx, miny, imageData.width);
      var bli = xyToI(minx, maxy, imageData.width);
      var bri = xyToI(maxx, maxy, imageData.width);
      var r = (
          (data[tli + 0] * (1 - (x - minx)) * (1 - (y - miny))) +
          (data[tri + 0] * (x - minx) * (1 - (y - miny))) +
          (data[bli + 0] * (1 - (x - minx)) * (y - miny)) +
          (data[bri + 0] * (x - minx) * (y - miny)));
      var g = (
          (data[tli + 1] * (1 - (x - minx)) * (1 - (y - miny))) +
          (data[tri + 1] * (x - minx) * (1 - (y - miny))) +
          (data[bli + 1] * (1 - (x - minx)) * (y - miny)) +
          (data[bri + 1] * (x - minx) * (y - miny)));
      var b = (
          (data[tli + 2] * (1 - (x - minx)) * (1 - (y - miny))) +
          (data[tri + 2] * (x - minx) * (1 - (y - miny))) +
          (data[bli + 2] * (1 - (x - minx)) * (y - miny)) +
          (data[bri + 2] * (x - minx) * (y - miny)));
      return [r, g, b];
    }

    function warpedCords(x, y, cx, cy, rad) {
      var dist = Math.sqrt((cx - x) * (cx - x) + (cy - y) * (cy - y));
      if (dist <= rad) {
        var fact = (Math.exp((1 - (dist / rad)) / 1.45) - 1);
        return [
            (x + (cx - x) * fact),
            (y + (cy - y) * fact)];
      }
      return [x, y];
    }

    // pop eyes
    var eyexs = [eyex1, eyex2];
    for (var exi = 0; exi < eyexs.length; exi++) {
      var eyex = eyexs[exi];
      for (var x = (eyex - (eye_width * POP)); x < (eyex + (eye_width * POP)); x++) {
        for (var y = (eyey - (eye_height * POP)); y < (eyey + (eye_height * POP)); y++) {
          var wcs = warpedCords(y, x, eyey, eyex, (eye_width * POP / 2));
          var b = blendFrom(wcs[0], wcs[1]);
          var idi = xyToI(y, x, imageData.width);
          outputData[idi + 0] = b[0];
          outputData[idi + 1] = b[1];
          outputData[idi + 2] = b[2];
        }
      }
      for (var x = (eyex - (eye_width * POP)); x < (eyex + (eye_width * POP)); x++) {
        for (var y = (eyey - (eye_height * POP)); y < (eyey + (eye_height * POP)); y++) {
          var idi = xyToI(y, x, imageData.width);
          imageData.data[idi + 0] = outputData[idi + 0];
          imageData.data[idi + 1] = outputData[idi + 1];
          imageData.data[idi + 2] = outputData[idi + 2];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

/** / // DEBUG
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.strokeRect(comp[i].x, comp[i].y, comp[i].width, comp[i].height);
    ctx.strokeRect(eyex1 - eye_width/2, eyey - eye_height/2, eye_width, eye_height);
    ctx.strokeRect(eyex2 - eye_width/2, eyey - eye_height/2, eye_width, eye_height);
/**/
  }
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function xyToI(x, y, w) {
  return ((Math.round(x) * 4) * w) + (Math.round(y) * 4);
}

