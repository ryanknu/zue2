(function() {
    'use strict'

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

    var h = $('#nothing-selected').parent().height();
    $('#nothing-selected').css('height', h + 'px');

    zueLinks();

    if ( location.hash.length > 2 ) {
        mainContentArea(location.hash.replace(/[\#\/]/g, ''));
    }
    else {
        mainContentArea('nothing-selected');
    }
})();
