
// initialize Hoodie
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
        gotABridge(b);
    }
});

// initial load of all todo items from the store
// hoodie.store.findAll('todo').then( function(todos) {
//   todos.sort( sortByCreatedAt ).forEach( addTodo )
// })

// clear todo list when the get wiped from store
//hoodie.account.on('signout', clearTodos)


// begin ZUE UI code here

var createUser = function(bridge) {
    zue.config.createAnonUser(bridge, 'web application');
}

// RK: function copies light into DOM for future use, any resource that returns a Light
//     should probably call this function.
function saveLight(light) {
    $('#lights').find('li[light-id=' + light.id + ']').data('light', light).find('span').text(light.name + light.state.hue);
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
    return $(element).closest('li[light-id]').data('light');
}

function gotABridge(bridge) {
    $('#bridges').append($('<li/>').text(bridge.macaddress));
    zue.lights.getAllLights(bridge);
}

function hoodieStore(bridge) {
    console.log(JSON.stringify(bridge));
    hoodie.store.add('bridge', JSON.parse(JSON.stringify(bridge)))
        .done(function(o) {
            console.log('added: ' + JSON.stringify(o));
        });;
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
    gotABridge(bridge);
});

zue.on(LIGHT_ADDED, function(light) {
    if ( $('#lights').find('li[light-id=' + light.id + ']').length < 1 ) {
        $lightLI = $('<li/>')
            .attr('light-id', light.id)
            .html( '<span>' + light.name + '</span><a>ON</a>')
            .data('light', light)
            .find('a')
                .on('click', function() {
                    getLight(this).setHue(parseInt(prompt('hue'),10));
                })
            .end();
        $('#lights').append($lightLI);
        $lightLI = '';
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

//zue.addPlugin(new GroupNameImplementation());
zue.on(GROUP_ADDED, function(group) {
    $('#lights').append($('<li/>').text('GROUP: ' + group.name));
});

zue.on(LINKED, function(bridge) {
    $('input[type=button]').each(function() {
        if ( $(this).attr('mac') == bridge.macaddress ) {
            $(this).parent().remove();
        }
    });
    hoodieStore(bridge);
    gotABridge(bridge);
});

zue.on(NO_BRIDGE_FOUND, function() {
    $('#no-bridge').modal();
});

