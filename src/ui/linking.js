
zue.on(HUE_ERROR, function(err) {
    if ( err.type == ERR_LINK_BUTTON_NOT_PRESSED ) {
        if ( err.bridge.linking ) {
            setTimeout(function() {
                createUser(err.bridge)
            }, 5000);
        }
    }
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


var createUser = function(bridge) {
    zue.config.createAnonUser(bridge, 'web application');
}



function createLinkButton(bridge) {
    var s = $('#link-section').clone();
    s.find('input[type=button]')
        .attr('mac', bridge.macaddress)
        .data('bridge', bridge)
        .val('Link ' + bridge.macaddress)
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
    $('.col-md-3').prepend(s);
    s.fadeIn();
}
