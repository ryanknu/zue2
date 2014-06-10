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
    var comparator = function(a, b) {
        return a.priority > b.priority ? 1 : -1;
    }
    
    if ( this.o[event] === undefined ) {
        this.o[event] = new PriorityQueue(comparator);
    }
    
    var n = {};
    n.callback = callback;
    n.object = object;
    n.priority = 1;
    this.o[event].enq(n);
}

ZueEventManager.prototype.trigger = function(event, argument) {
    if ( this.o[event] !== undefined ) {
        this.o[event].forEach(function(callback) {
            callback.callback.call(callback.object, argument);
        });
    }
}
