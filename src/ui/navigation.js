function zueLinks() {
    var zueLinkClick = function() {
        mainContentArea($(this).data('tag'));
    };

    $('a[zue][href]').each(function() {
        var href = $(this).attr('href');
        $(this).css('cursor', 'pointer');
        $(this).removeAttr('href');
        $(this).data('tag', href);
        $(this).on('click', zueLinkClick);
    });
}

function mainContentArea(pane) {
    $('#content-zone > div').hide();
    $z = $('#' + pane.replace('/', '_'));
    if ( $z.length > 0 && pane != 'nothing-selected' ) {
        $z.show();
        location.hash = '/' + pane;
    }
    else {
        $('#nothing-selected').show();
        location.hash = '/';
    }
}
