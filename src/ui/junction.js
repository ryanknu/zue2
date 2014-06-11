function junctions()
{
    $('.junction').each(function() {
        var $s = $(this).find('[data-jswitch]');
        var v = $s.val() || $s.text();
        $s = undefined;

        $(this).find('[data-jif]').each(function() {
            if ( $(this).data('jif').toString() == v.toString() ) {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    });
}
