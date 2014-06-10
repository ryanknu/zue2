/**
 *  zzzzzzzzzzuuu    uuueeeeeeeeee
 *  ZZZZZZZZZZUUU    UUUEEEEEEEEEE
 *       ZZZ  UUU    UUUEEE
 *      ZZZ   UUU    UUUEEEeeeeeee
 *     ZZZ    UUU    UUUEEEEEEEEEE
 *    ZZZ     UUU    UUUEEE
 *  ZZZZzzzzzzUUUuuuuUUUEEEeeeeeee
 *  ZZZZZZZZZZ UUUUUUUU EEEEEEEEEE
 *
 *  Zue COLOR -- Ryan Knuesel -- 2014
 *
 */

var HUE_MAX = 65535;
 
function Color(light)
{
    this.light = light;
}

Color.prototype.supportsMode = function(mode) {
    if ( mode == 'ct' ) {
    
    }
    else if ( mode == 'hs' ) {
    
    }
    else if ( mode == 'xy' ) {
    
    }
    return false;
};

var hueToCss = function(hue)
{
    var V = 1;
    var S = 1;
    var C = V*S;
    var X = C * (1 - Math.abs( hue / (HUE_MAX / 6) % 2 - 1) );
    var m = V - C;
    
    var q = Math.floor(hue / (HUE_MAX / 6));
    var r = {r:0, g:0, b:0};
    switch (q) {
        case 0: r = { r: C+m, g: X+m, b: 0 }; break;
        case 1: r = { g: C+m, r: X+m, b: 0 }; break;
        case 2: r = { g: C+m, b: X+m, r: 0 }; break;
        case 3: r = { b: C+m, g: X+m, r: 0 }; break;
        case 4: r = { b: C+m, r: X+m, g: 0 }; break;
        case 5: r = { r: C+m, b: X+m, g: 0 }; break;
    }
    
    var _r = [
        Math.floor(r.r * 255), 
        Math.floor(r.g * 255),
        Math.floor(r.b * 255)
    ];
    
    return 'rgb(' + _r.join(',') + ')';
}

var convertKToCt = function(ct)
{
    return (-347/4500) * ct + (5888/9);
}

// y = (x - b) / m
var convertCtToK = function(k)
{
    return (k - (5888/9)) / (-347/4500);
}

/**
 * Takes temperature (temp) in range [1000, 40000]
 * 153 - 6500
 * 500 - 2000
 *
 * Algorithm from here: http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
 * It seems to work pretty well!
 */
var tempToCss = function(tempInK)
{
    var temp = tempInK / 100;
    r = { r: 0, g: 0, b: 0 };
    
    if ( temp < 66 ) {
        r.r = 255;
    }
    else {
        r.r = temp - 60;
        r.r = 329.698727446 * (r.r ^ -0.1332047592);
        r.r = Math.max(0, r.r);
        r.r = Math.min(255, r.r);
    }
    
    if ( temp < 66 ) {
        r.g = temp;
        r.g = 99.4708025861 * Math.log(r.g) - 161.1195681661;
    }
    else {
        r.g = temp - 60;
        r.g = 288.1221695283 * (r.g ^ -0.0755148492);
    }
    r.g = Math.max(0, r.g);
    r.g = Math.min(255, r.g);
    
    if ( temp >= 66 ) {
        r.b = 255;
    }
    else {
        if ( temp <= 19 ) {
            r.b = 0;
        }
        else {
            r.b = temp - 10;
            r.b = 138.5177312231 * Math.log(r.b) - 305.0447927307;
            r.b = Math.max(0, r.b);
            r.b = Math.min(255, r.b);
        }
    }
    
    var _r = [
        Math.floor(r.r), 
        Math.floor(r.g),
        Math.floor(r.b)
    ];
    
    return 'rgb(' + _r.join(',') + ')';
}

Color.prototype.getCss = function()
{
    if ( this.light.state.colormode == 'hs' ) {
        return hueToCss(this.light.state.hue);
    }
    else if ( this.light.state.colormode == 'ct' ) {
        return tempToCss(convertCtToK(this.light.state.ct));
    }
    return 'yellow';
};

Color.prototype.getTempInK = function()
{
    return convertCtToK(this.light.state.ct);
};

Color.prototype.getHueInDegrees = function()
{
    return this.light.state.hue / (HUE_MAX / 360);
};

Color.prototype.toString = function()
{
    if ( this.light.state.colormode == 'hs' ) {
        return (this.getHueInDegrees()).toFixed(2) + '°';
    }
    else if ( this.light.state.colormode == 'ct' ) {
        return Math.floor(this.getTempInK()) + 'K';
    }
    
    return 'XY';
}

;(function() {
    var _color = {
        HUE_RED: 0,
        HUE_SALMON: 6609,
        HUE_GREEN: 32107,
        HUE_BLUE: 44298,
        HUE_PURPLE: 53333,
        HUE_AQUAMARINE: 39242,
        HUE_YELLOW: 18833,
        HUE_ORANGE: 12879
    };
    
    if ( window.zue === undefined ) {
        window.zue = {
            color: _color
        };
    }
    else {
        window.zue.color = _color;
    }
    
})()
