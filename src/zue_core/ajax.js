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

function ZueAjax()
{
    this.eventManager = undefined;
    this.defaults = {
        method:'get',
        data: '',
        url: undefined,
        model: undefined,
        success: function() {},
        failure: function() {}
    };
    this.$ = jQuery;
}

ZueAjax.prototype.setEventManager = function(em)
{
    this.eventManager = em;
}

ZueAjax.prototype.exec = function(in_options)
{
    var $ = this.$;
    var options = $.extend( {}, this._defaults, in_options );
    var ajaxOptions = {
        type: options.method,
        url: options.url,
        success: function(data) {
            if ( detectArray(data) ) {
                if ( data.length == 0 ) {
                    this.eventManager.trigger(HUE_ERROR, { type: 10001, description: 'empty result set' });
                }
                for ( var i in data ) {
                    if ( data.hasOwnProperty(i) ) {
                        data[i]._i = i;
                        if ( 'error' in data[i] ) {
                            this.eventManager.trigger(HUE_ERROR, data[i].error);
                            options.failure();
                        }
                        else {
                            var _o = $.extend(true, {}, options.model);
                            _o.exchangeData(data[i]);
                            options.success(_o);
                        }
                    }
                }
            }
            else if ( typeof data === 'object' ) {
                if ( 'error' in data ) {
                    this.eventManager.trigger(HUE_ERROR, data.error);
                }
                else {
                    options.model.exchangeData(data);
                    options.success(options.model);
                }
            }
            else {
                throw '`data` is not something I can work with';
            }
        },
        error: function() {
            this.eventManager.trigger(HUE_ERROR, { type: 10000, description: 'no/bad response from server' });
            options.failure();
        }
    };
    if ( options.method == 'post' || options.method == 'put' ) {
        ajaxOptions.data = JSON.stringify(options.data);
    }
    $.ajax(ajaxOptions);
};
