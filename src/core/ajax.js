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
        failure: function() {},
        trap: false,
        bridge: undefined
    };
    this.$ = jQuery;
}

ZueAjax.prototype.setEventManager = function(em)
{
    this.eventManager = em;
}

ZueAjax.prototype.exec = function(in_options)
{
    var options = extend( {}, this.defaults, in_options );
    var em = this.eventManager;
    var method = options.method || 'get';

    /**
     * checkResult
     * Find all possible reasons for failure:
     * - non-2XX response code
     * - empty result set []
     * - "error" key in data object, either:
     *   - {error: ...}
     *   - [{error: ...}]
     */
    var checkResult = function(req) {
        var d_o = { failed: true, type: 10001, message: 'Unknown error', data: undefined };
        d_o.data = typeof h.response === 'string' ? JSON.parse(h.response) : h.response;
        if ( h.status < 200 || h.status > 299 ) {
            d_o.message = 'Expected 200, got ' + h.status;
            return d_o;
        }

        // RK: If data is not an array, make it one.
        if ( !detectArray(d_o.data) ) {
            d_o.data = [d_o.data];
        }

        if ( d_o.data.length < 1 ) {
            d_o.message = 'empty result set';
            d_o.type = 10002;
            return d_o;
        }

        for ( var i in d_o.data ) {
            if ( !d_o.data.hasOwnProperty(i) ) continue;
            d_o.data[i]._i = i;
            if ( 'error' in d_o.data[i] ) {
                d_o.message = d_o.data[i].error.description;
                d_o.type = d_o.data[i].error.type;
                return d_o;
            }
        }

        d_o.failed = false;
        return d_o;
    }

    var h = new XMLHttpRequest();
    h.timeout = 30000;
    h.ontimeout = options.failed;
    h.responseType = "json";
    h.onreadystatechange = function() {
        if ( h.readyState == 4) {
            var res = checkResult(h);
            if ( res.failed ) {
                if ( !options.trap ) {
                    em.trigger(HUE_ERROR, { bridge: options.bridge, type: res.type, description: res.message });
                }
                return options.failure();
            }
            var data = res.data;
            for ( var i in data ) {
                var _o = extend(true, {}, options.model);
                _o.exchangeData(data[i]);
                options.success(_o);
            }
        }
    }
    h.open(method, options.url);
    if ( options.method == 'post' || options.method == 'put' ) {
        h.setRequestHeader("Content-Type", "application/json");
        h.setRequestHeader("Accept", "application/json");
        h.send(JSON.stringify(options.data));
    }
    else {
        h.send();
    }
};
