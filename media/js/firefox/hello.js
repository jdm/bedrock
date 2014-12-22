/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

;(function(w, $) {
    'use strict';

    var $document = $(document);

    // listen for events in/on Hello menu
    var bindHelloObserver = function() {
        Mozilla.UITour.observe(function(e, data) {
            // none of this code seems to fire...
            console.log(e);
            console.log(data);

            // untested, as this code block never fires...
            switch (e) {
                case 'Loop:ChatWindowOpened':
                    w.gaTrack(['_trackEvent', 'hello interactions','productPage','StartConversation-NoTour']);
                    break;
                case 'Loop:RoomURLCopied':
                    w.gaTrack(['_trackEvent', 'hello interactions','productPage','CopyLink-NoTour']);
                    break;
            }
        }, function() {
            // however, this code does fire, so...?
            console.log('observing!');
        });
    };

    var handleVisibilityChange = function() {
        if (document.hidden) {
            // hide Hello menu & stop observer when changing tabs or minimizing window
            Mozilla.UITour.observe(null);
        } else {
            // listen for Hello menu/chat window events
            bindHelloObserver();
        }
    };

    if (w.isFirefox()) {
        // if Fx, hide all footer messaging
        // (correct messaging to display determined below)
        $('.dltry-copy').hide();

        // Hello exists in version 35 and up
        if (w.getFirefoxMasterVersion() >= 35) {
            // show Fx with Hello footer messaging
            $('#ctacopy-hellofx').show();

            // hide footer download button
            $('#download-fx').hide();

            // show footer try button
            $('#try-hello-footer').css('display', 'block');

            // see if Hello is an available target in toolbar/overflow/customize menu
            Mozilla.UITour.getConfiguration('availableTargets', function(config) {
                // 'loop' is the snazzy internal code name for Hello
                if (config.targets && config.targets.indexOf('loop') > -1) {
                    // show the intro try hello button
                    $('#intro .try-hello').addClass('active');

                    // clicking either 'try Hello' button (intro/footer) will open the Hello menu
                    $('.try-hello').on('click', function() {
                        // show Hello menu when icon in toolbar, customize menu, or overflow
                        Mozilla.UITour.showMenu('loop', function() {
                            // clicking Hello icon in toolbar does not close the menu
                            // (bug 1113896), so allow closing by clicking anywhere on page
                            $document.one('click', function() {
                                Mozilla.UITour.hideMenu('loop');
                            });

                            w.gaTrack(['_trackEvent', 'hello interactions', 'productPage', 'Open']);
                        });
                    });

                    // listen for events within Hello menu/chat window
                    bindHelloObserver();

                    // enable/disable listeners when document visibility changes
                    $document.on('visibilitychange', function() {
                        handleVisibilityChange();
                    });
                } else {
                    // if Hello is not in toolbar/menu, change footer button to link
                    // to a SUMO article and do some GA tracking
                    $('#try-hello-footer').attr('role', 'link').on('click', function() {
                        w.gaTrack(['_trackEvent', 'hello interactions', 'productPage', 'IneligibleClick'], function() {
                            window.location.href = 'https://support.mozilla.org/kb/where-firefox-hello-button';
                        });
                    });

                    w.gaTrack(['_trackEvent', 'hello interactions', 'productPage', 'IneligibleView']);
                }
            });
        } else {
            // if Fx is version 34 or lower (no Hello support) display update messaging in footer
            $('#ctacopy-oldfx').show();
        }
    } else {
        // for non-Fx users, show get Fx feature & remove node to maintain nth-child margin rules
        // (we wont need this node/copy for non-Fx users)
        $('#feature-account').remove();
        $('#feature-getfx').show();
    }
})(window, window.jQuery);
