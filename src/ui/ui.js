
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

var hoodie  = new Hoodie();

var sortGroups = function() {
    var d = '#lights';
    $(d + ' > div').sort(function(a, b) {
        return ( $(a).data('model').type === 'group' ) ? -1 : 1;
    }).appendTo($(d));
}


// RK: function copies light into DOM for future use, any resource that returns a Light
//     should probably call this function.
function saveLight(light) {
    var c = new Color(light);
    var quick_state = (light.state.reachable && light.state.on) ? c : 'OFF';
    $('#' + light.getId())
        .show()
        .data('model', light)
        .find('.name')
            .text(light.name)
        .end()
        .find('.state_hue')
            .text(quick_state)
            .css('color', c.getCss())
        .end();

    if ( !light.state.reachable ) {
        $('#' + light.getId()).hide();
    }

    showNoLightsAvailable();
}

function showNoLightsAvailable()
{
    $('#all-off').hide();
    if ( $('#lights > :visible' ).length < 1 ) {
        $('#all-off').show();
    }
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
            zue.log('added: ' + JSON.stringify(o));
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
    else if ( err.type != ERR_LINK_BUTTON_NOT_PRESSED ) {
        // RK: don't show modal if it's a link cycle.
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
            .end()
            .find('.name')
                .wrap(
                    $('<a zue/>').attr('href', 'light/' + light.getId())
                )
            .end();

        poopulate('#light-control-pallete', '#content-zone', light)
            .attr('id', 'light_' + light.getId());

        zueLinks();

        if ( light.simple ) {
            zue.lights.getLightDetails(light);
        }
    }
    else {
        saveLight(light);
    }
});

zue.on(LIGHT_UPDATING, function(light) {
    $('#' + light.getId()).addClass('working');
});

zue.on(LIGHT_UPDATED, function(light) {
    $('#' + light.getId()).removeClass('working');
    saveLight(light);
});

zue.on(GROUP_ADDED, function(group) {
    poopulate('#ILightControl', '#groups', group)
        .attr('id', group.getId())
        .find('no-group').hide();
});
