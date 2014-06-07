
/**
 * Before moving any objects that match these selectors, find them in the javascript to 
 * see how it might affect the code.
 * Important CSS Selectors:
 * #lights li[light-id]
 * #link-section input[type=button]
 * #bridges
 * #no-bridge
 * #hue-exception
 */

var hoodie  = new Hoodie()

hoodie.store.findAll('bridge').then( function(bridges) {
    console.log(JSON.stringify(bridges));
    if ( bridges.length < 1 ) {
        zue.bridge.locate();
        return;
    }
    
    for( var i = 0; i < bridges.length; i++ ) {
        var b = new Bridge();
        b.exchangeData(bridges[i]);
        getAllLights(b);
    }
});

var sortGroups = function() {
    var d = '#lights';
    $(d + ' > div').sort(function(a, b) {
        return ( $(a).data('model').type === 'group' ) ? -1 : 1;
    }).appendTo($(d));
}

var createUser = function(bridge) {
    zue.config.createAnonUser(bridge, 'web application');
}

// RK: function copies light into DOM for future use, any resource that returns a Light
//     should probably call this function.
function saveLight(light) {
    $('#' + light.getId())
        .data('model', light)
        .find('.name')
            .text(light.name)
        .end()
        .find('.state_on')
            .text(light.state.on ? 'ON' : 'OFF')
        .end()
        .find('.state_hue')
            .text(light.state.hue)
        .end();
    sortGroups();
}

function createLinkButton(bridge) {
    var s = $('#link-section').clone();
    s.find('input[type=button]')
        .attr('mac', bridge.macaddress)
        .val( 'Link ' + bridge.macaddress )
        .data('bridge', bridge)
        .on('click', function() {
            var b = $(this).data('bridge');
            if ( !b.linking ) {
                b.linking = true;
                $(this).val( 'Cancel ' + b.macaddress);
                createUser(b);
            }
            else {
                b.linking = false;
                $(this).val( 'Link ' + b.macaddress);
            }
        });
    $('.content').prepend(s);
    s.fadeIn();
}

// RK: function gets the light out of DOM for any given element by looking up to it's 
//     closest parent that would have a light. Convenient for triggers nested underneath
//     a DOM object encapsulating a light.
function getLight(element) {
    return $(element).closest('.ILightControl').data('model');
}

// RK: returns a CSS selector-safe mac address
function safeMacAddress(mac_address)
{
    return mac_address.replace(/:/g, '');
}

function getAllLights(bridge) {
    poopulate('#IBridgeControl', '#bridges', bridge)
        .attr('mac-safe', safeMacAddress(bridge.macaddress))
        .addClass('working')
        .find('a.configure')
            .on('click', function() {
                var bridge = $(this).closest('.IBridgeControl').data('model');
                poopulate('#bridge-config', 'body', bridge)
                    .modal();
            })
        .end();
    zue.lights.getAllLights(bridge);
}

function stopWorking(bridge) {
    $('.IBridgeControl[mac-safe=' + safeMacAddress(bridge.macaddress) + ']').removeClass('working');
}

function hoodieStore(bridge) {
    console.log(JSON.stringify(bridge));
    hoodie.store.add('bridge', JSON.parse(JSON.stringify(bridge)))
        .done(function(o) {
            console.log('added: ' + JSON.stringify(o));
        });;
}

function poopulate(template, bucket, model)
{
    var cl = $(template).clone();
    cl.attr('id', '').data('model', model);
    for ( i in model ) {
        if ( typeof model[i] === 'function' ) {
            continue;
        }
        var o = cl.find('.' + i);
        o.each(function() {
            if ( $(this).is('input') ) {
                $(this).val( model[i] );
            }
            else {
                $(this).text( model[i] );
            }
        });
    }
    $(bucket).append(cl);
    return cl;
}

// RK: Enable the name-based group simulator
zue.enablePlugin('SimulateGroupsByNames');

zue.on(HUE_ERROR, function(err) {
    if ( err.type == ERR_UNAUTHORIZED ) {
        createLinkButton(err.bridge);
    }
    else if ( err.type == ERR_LINK_BUTTON_NOT_PRESSED ) {
        if ( err.bridge.linking ) {
            setTimeout(function() {
                createUser(err.bridge)
            }, 5000);
        }
    }
    else {
        $('#hue-exception').modal();
    }
});

zue.on(BRIDGE_FOUND, function(bridge) {
    hoodieStore(bridge);
    getAllLights(bridge);
});

zue.on(LIGHT_ADDED, function(light) {
    stopWorking(light.bridge);
    if ( $('#' + light.getId()).length < 1 ) {
        poopulate('#ILightControl', '#lights', light)
            .attr('id', light.getId())
            .find('.toggle')
                .on('click', function() {
                    getLight(this).toggle();
                })
            .end()
            .find('.setHue')
                .on('click', function() {
                    getLight(this).setHue(parseInt(prompt('hue'),10));
                })
            .end();
            
        if ( light.simple ) {
            zue.lights.getLightDetails(light);
        }
    }
    else {
        saveLight(light);
    }
});

zue.on(LIGHT_UPDATING, function(light) {
    $('#lights').find('li[light-id=' + light.id + ']').addClass('updating');
});

zue.on(LIGHT_UPDATED, function(light) {
    $('#lights').find('li[light-id=' + light.id + ']').removeClass('updating');
    saveLight(light);
});

zue.on(GROUP_ADDED, function(group) {
    poopulate('#ILightControl', '#lights', group)
        .find('no-group').hide();
});

zue.on(LINKED, function(bridge) {
    $('input[type=button]').each(function() {
        if ( $(this).attr('mac') == bridge.macaddress ) {
            $(this).parent().remove();
        }
    });
    hoodieStore(bridge);
    getAllLights(bridge);
});

zue.on(NO_BRIDGE_FOUND, function() {
    $('#no-bridge').modal();
});

