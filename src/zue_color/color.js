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

 
function Color(lightOrModelId)
{
    this.model_id = '';
    if ( lightOrModelId === undefined ) {
        throw 'Color class needs a modelid
    }
    else if ( typeof lightOrModelId == 'object' ) {
        this.model_id = lightOrModelId.modelid;
    }
    else {
        this.model_id = lightOrModelId;
    }
}

Color.prototype.supportsMode = function(mode) {
    
};

Color.prototype.getHex = function() {

};

(function() {
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
