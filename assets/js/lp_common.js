
// variables
var $body = $('body'),
    $html = $('html'),
    $window = $(window),
    $document = $(document),
    $header_main = $('#header_main'),
    header_main_height = $header_main.height(),
    easing_swiftOut = [ 0.35,0,0.25,1 ];
    bez_easing_swiftOut = $.bez(easing_swiftOut);

$(function() {

    // header main
    altair_header_main.init();

    // inputs
    altair_md.init();

});

// $window.on('load',function () {
//     // hi-res images
//     $('img').dense({
//         glue: "@"
//     });
//     // fastClick (touch devices)
//     FastClick.attach(document.body);
// });

altair_header_main = {
    init: function () {
        // sticky header
        altair_header_main.sticky_header();
        // main navigation
        altair_header_main.main_navigation();
    },
    sticky_header: function () {
        $body.addClass('header_sticky');
        $(window).on("scroll touchmove", function () {
            $body.toggleClass('header_shadow', $(document).scrollTop() > 0);
        });
    },
    main_navigation: function() {
        $('#main_navigation').onePageNav({
            currentClass: 'current_active',
            changeHash: false,
            scrollSpeed: 840,
            scrollThreshold: 0.4,
            filter: '',
            scrollOffset: -header_main_height,
            easing: bez_easing_swiftOut,
            begin: function() {
                //Hack so you can click other menu items after the initial click (IOS)
                $('body').append('<div id="device-dummy" style="height: 1px;"></div>');
            },
            end: function() {
                $('#device-dummy').remove();
            },
            scrollChange: function($currentListItem) {
                //I get fired when you enter a section and I pass the list item of the section
            }
        });

    }
};

altair_md = {
    init: function () {
        altair_md.inputs();
    },
    inputs: function(parent) {
        var $mdInput = (typeof parent === 'undefined') ? $('.md-input') : $(parent).find('.md-input');
        $mdInput.each(function() {
            if(!$(this).closest('.md-input-wrapper').length) {
                var $this = $(this),
                    extraClass = '';

                if($this.is('[class*="uk-form-width-"]')) {
                    var elClasses = $this.attr('class').split (' ');
                    for(var i = 0; i < elClasses.length; i++){
                        var classPart = elClasses[i].substr(0,14);
                        if(classPart == "uk-form-width-"){
                            var extraClass = elClasses[i];
                        }
                    }
                }

                if( $this.prev('label').length ) {
                    $this.prev('label').andSelf().wrapAll('<div class="md-input-wrapper"/>');
                } else if($this.siblings('[data-uk-form-password]').length) {
                    $this.siblings('[data-uk-form-password]').andSelf().wrapAll('<div class="md-input-wrapper"/>');
                } else {
                    $this.wrap('<div class="md-input-wrapper"/>');
                }
                $this.closest('.md-input-wrapper').append('<span class="md-input-bar '+extraClass+'"/>');

                altair_md.update_input($this);
            }
            $body
                .on('focus', '.md-input', function() {
                    $(this).closest('.md-input-wrapper').addClass('md-input-focus')
                })
                .on('blur', '.md-input', function() {
                    $(this).closest('.md-input-wrapper').removeClass('md-input-focus');
                    if(!$(this).hasClass('label-fixed')) {
                        if($(this).val() != '') {
                            $(this).closest('.md-input-wrapper').addClass('md-input-filled')
                        } else {
                            $(this).closest('.md-input-wrapper').removeClass('md-input-filled')
                        }
                    }
                })
                .on('change', '.md-input', function() {
                    altair_md.update_input($(this));
                });
        })
    },
    update_input: function(object) {
        // clear wrapper classes
        object.closest('.uk-input-group').removeClass('uk-input-group-danger uk-input-group-success');
        object.closest('.md-input-wrapper').removeClass('md-input-wrapper-danger md-input-wrapper-success md-input-wrapper-disabled');

        if(object.hasClass('md-input-danger')) {
            if(object.closest('.uk-input-group').length) {
                object.closest('.uk-input-group').addClass('uk-input-group-danger')
            }
            object.closest('.md-input-wrapper').addClass('md-input-wrapper-danger')
        }
        if(object.hasClass('md-input-success')) {
            if(object.closest('.uk-input-group').length) {
                object.closest('.uk-input-group').addClass('uk-input-group-success')
            }
            object.closest('.md-input-wrapper').addClass('md-input-wrapper-success')
        }
        if(object.prop('disabled')) {
            object.closest('.md-input-wrapper').addClass('md-input-wrapper-disabled')
        }
        if(object.hasClass('label-fixed')) {
            object.closest('.md-input-wrapper').addClass('md-input-filled')
        }
        if(object.val() != '') {
            object.closest('.md-input-wrapper').addClass('md-input-filled')
        }
    }
};