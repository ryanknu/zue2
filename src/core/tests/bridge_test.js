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

module('Bridge Tests');

test('#b01 Module Loaded', function() {
    ok(typeof zue.bridge === 'object', 'Module is loaded');
    ok(typeof zue.bridge.locate === 'function', '`locate` function is available in the module');
});

test('#b02 Locate Test', function() {
    m = _bridgeZueModule(
    {
        exec: function(ajm) {
            var url = ajm.url;
            var obj = ajm.model;
            var s = ajm.success;
            var f = ajm.failure;
            ok(url === 'https://www.meethue.com/api/nupnp', 'Discovery URL is ok');
            ok(typeof obj.assembleUrl === 'function', 'Object prototype implements assembleUrl');
            ok(typeof obj.exchangeData === 'function', 'Object prototype implements exchangeData');
            ok(typeof s === 'function', ':success is a function');
            ok(s({}) === '_bridgeZueModule.foundBridge', 'The correct function was calledback');
            ok(typeof f === 'function', ':failure is a function');
            ok(f() === '_bridgeZueModule.noBridgeFound', 'The correct function was calledback');
        }
    },
    {
        trigger: function() {}
    });
    
    m.locate();
});

test('#b03 Found Bridge Test', function() {
    m = _bridgeZueModule({ get: function(url, obj, s, f) {} }, {
        trigger: function(e, o) {
            ok(e === zue.bridge.BRIDGE_FOUND, 'Found event triggered');
            ok(typeof o.exchangeData === 'function', 'Object prototype implements exchangeData');
        }
    });
    
    m._foundBridge(new Bridge());
});

test('#b04 No Bridge Found Test', function() {
    m = _bridgeZueModule({ get: function(url, obj, s, f) {} }, {
        trigger: function(e, o) {
            ok(e === zue.bridge.NO_BRIDGE_FOUND, 'Not found event triggered');
            ok(o === undefined, 'Object prototype implements exchangeData');
        }
    });
    
    m._noBridgeFound();
});

test('#b05 Exchange Data Test', function() {
    obj = new Bridge();
    
    obj.exchangeData(JSON.parse('{}'));
    ok(obj.id === '', 'Object.id is undefined');
    ok(obj.internalipaddress === '', 'Object.internalipaddress is undefined');
    ok(obj.macaddress === '', 'Object.macaddress is undefined');

    obj.exchangeData(JSON.parse('{"id":"001788fffe0923cb","internalipaddress":"192.168.1.37","macaddress":"00:17:88:09:23:cb"}'));
    ok(obj.id === '001788fffe0923cb', 'Object.id is set properly');
    ok(obj.internalipaddress === '192.168.1.37', 'Object.internalipaddress is set properly');
    ok(obj.macaddress === '00:17:88:09:23:cb', 'Object.macaddress is set properly');
});

test('#b06 Assemble URL Test', function() {
    obj = new Bridge();
    obj.hue_username = 'zue_0_2';
    obj.internalipaddress = '192.168.1.37';
    ok(obj.assembleUrl('/lights/4') === 'http://192.168.1.37/api/zue_0_2/lights/4');
    
    obj.protocol = 'https';
    obj.hue_username = 'unit_test';
    obj.internalipaddress = '10.0.1.99';
    ok(obj.assembleUrl('/groups/0') === 'https://10.0.1.99/api/unit_test/groups/0');
});

test('#b07 Assemble Ro0t URL Test', function() {
    obj = new Bridge();
    obj.hue_username = 'zue_0_2';
    obj.internalipaddress = '192.168.1.37';
    ok(obj.assembleRootUrl() === 'http://192.168.1.37/api');
    
    obj.protocol = 'https';
    obj.hue_username = 'unit_test';
    obj.internalipaddress = '10.0.1.99';
    ok(obj.assembleRootUrl() === 'https://10.0.1.99/api');
});
