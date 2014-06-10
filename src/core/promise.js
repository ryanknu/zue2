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

var PromiseNotFullfilled = 0;
var PromiseCanceled = 1;

function ZuePromise()
{
    this.fullfilled = PromiseNotFullfilled;
}

ZuePromise.prototype.cancel = function()
{
    this.fullfilled = PromiseCanceled;
}

ZuePromise.prototype.then = function()
{
}

ZuePromise.prototype.done = function(s, e, p)
{
    this.then(s, e, p);
}
