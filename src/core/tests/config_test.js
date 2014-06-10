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

module('Config Tests');

test('Module Loaded', function() {
    ok(typeof zue.config === 'object', 'Module is loaded');
    ok(typeof zue.config.createUser === 'function', '`createUser` function is available in the module');
    ok(typeof zue.config.createAnonUser === 'function', '`createAnonUser` function is available in the module');
});

test('Locate Test', function() {
    m = _bridgeZueModule(
    {
        get: function(url, obj, s, f) {
            ok(url === 'https://www.meethue.com/api/nupnp', 'Discovery URL is ok');
            ok(obj.hue_username === zue.core.getHueUser(), 'Hue user is defined on the bridge object');
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

test('Found Bridge Test', function() {
    m = _bridgeZueModule({ get: function(url, obj, s, f) {} }, {
        trigger: function(e, o) {
            ok(e === zue.bridge.BRIDGE_FOUND, 'Found event triggered');
            ok(typeof o.exchangeData === 'function', 'Object prototype implements exchangeData');
        }
    });
    
    m._foundBridge(new Bridge());
});

test('No Bridge Found Test', function() {
    m = _bridgeZueModule({ get: function(url, obj, s, f) {} }, {
        trigger: function(e, o) {
            ok(e === zue.bridge.NO_BRIDGE_FOUND, 'Not found event triggered');
            ok(o === undefined, 'Object prototype implements exchangeData');
        }
    });
    
    m._noBridgeFound();
});

test('Exchange Data Test', function() {
    obj = new Bridge();
    
    obj.exchangeData(JSON.parse('{}'));
    ok(typeof obj.id === 'undefined', 'Object.id is undefined');
    ok(typeof obj.internalipaddress === 'undefined', 'Object.internalipaddress is undefined');
    ok(typeof obj.macaddress === 'undefined', 'Object.macaddress is undefined');

    obj.exchangeData(JSON.parse('{"id":"001788fffe0923cb","internalipaddress":"192.168.1.37","macaddress":"00:17:88:09:23:cb"}'));
    ok(obj.id === '001788fffe0923cb', 'Object.id is set properly');
    ok(obj.internalipaddress === '192.168.1.37', 'Object.internalipaddress is set properly');
    ok(obj.macaddress === '00:17:88:09:23:cb', 'Object.macaddress is set properly');
});

test('Assemble URL Test', function() {
    obj = new Bridge();
    obj.hue_username = 'zue_0_2';
    obj.internalipaddress = '192.168.1.37';
    ok(obj.assembleUrl('/lights/4') === 'http://192.168.1.37/api/zue_0_2/lights/4');
    
    obj.protocol = 'https';
    obj.hue_username = 'unit_test';
    obj.internalipaddress = '10.0.1.99';
    ok(obj.assembleUrl('/groups/0') === 'https://10.0.1.99/api/unit_test/groups/0');
});

test('Assemble Ro0t URL Test', function() {
    obj = new Bridge();
    obj.hue_username = 'zue_0_2';
    obj.internalipaddress = '192.168.1.37';
    ok(obj.assembleRootUrl() === 'http://192.168.1.37/api');
    
    obj.protocol = 'https';
    obj.hue_username = 'unit_test';
    obj.internalipaddress = '10.0.1.99';
    ok(obj.assembleRootUrl() === 'https://10.0.1.99/api');
});

test('Set Core Bridge Test', function() {
    m = _bridgeZueModule();
    obj = new Bridge();
    obj.internalipaddress = '192.168.1.37';
    m.setCoreBridge(obj);
    
    ok(zue.core.getBridge().internalipaddress === '192.168.1.37', 'Core bridge has correct ip address');
    
    obj = new Bridge();
    obj.internalipaddress = '10.0.1.99';
    m.setCoreBridge(obj);
    
    ok(zue.core.getBridge().internalipaddress === '10.0.1.99', 'Core bridge has correct ip address');
});
