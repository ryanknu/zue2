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
 *  Zue Core -- Ryan Knuesel -- 2014
 *
 */

function ZueEventManager()
{
    this.o = {};
}

ZueEventManager.prototype.attach = function(event, callback, object) {
    if ( this.o[event] === undefined ) {
        this.o[event] = [];
    }
    var n = {};
    n.callback = callback;
    n.object = object;
    this.o[event].push(n);
}

ZueEventManager.prototype.trigger = function(event, argument) {
    if ( detectArray(this.o[event]) ) {
        for ( var i = 0; i < this.o[event].length; i++ ) {
            var n = this.o[event][i];
            if ( n.object === undefined ) {
                n.callback(argument);
            }
            else {
                n.callback.call(n.object, argument);
            }
        }
    }
}
