(function ($) {
    'use strict';
    $(document).ready(function () {
        var time;
        var tc = function () {
            time = '#' + (new Date()).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0].replace(/:/g, '');
            $('.time').text(time);
            if ($('html').hasClass('night')) {
                $('html').css('background-color', time);
            } else {
                $('.time').css('color', time);
            }
        };
        $('.time').on('click', function () {
            $('.center-text').css('visibility', 'visible')
            if ($('html').hasClass('night')) {
                $('.center-text').css('color', time);
                $('.rua-counter').css('color', time);
                $('html').removeClass('night');
                $('html').css('background-color', '#fff');
            } else {
                $('.center-text').css('color', '#fff');
                $('.rua-counter').css('color', '#fff');
                $('html').addClass('night');
                tc();
                $('.time').css('color', '#fff');
            }
        });

        $(document).ready(function () {
            var titles = ["らんらん♪", "にゃんぱすー", "にゃおん", "にゃあ"];
            var index = 0;
            function updateContent() {
                var currentTitle = titles[index];
                document.title = currentTitle;
                var navItem = $(".nav li a").first();
                navItem.fadeOut('fast', function () {
                    navItem.html('<i class="fa fa-home"></i>' + currentTitle);
                    navItem.fadeIn('slow');
                });
                index = (index + 1) % titles.length;
            }
            setInterval(updateContent, 3000);
        });

        let ruaCatCount = 0;
        document.querySelector('.zzz').addEventListener('click', function () {
            ruaCatCount++;
            if (Math.random() < 0.1) {
                alert('你惹小猫生气了，小猫跑开了......\n你 Rua 了「 ' + ruaCatCount + ' 」次喵~（甩脑袋）');
                window.location.reload();
            } else {
                document.getElementById('rua-counter').textContent = '喵 × ' + ruaCatCount;
            }
            this.style.transition = 'transform 0.1s';
            this.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 100);
        });

        document.oncontextmenu = function () {
            return false;
        };
        setInterval(function () {
            check();
        }, 1000);
        var check = function () {
            function doCheck(a) {
                if (('' + a / a)['length'] !== 1 || a % 20 === 0) {
                    (function () { }['constructor']('debugger')());
                } else {
                    (function () { }['constructor']('debugger')());
                }
                doCheck(++a);
            }
            try {
                doCheck(0);
            } catch (err) { }
        };
        check();

        // init
        if ((new Date()).getHours() > 18 || (new Date()).getHours() < 6) {
            $('html').addClass('night');
            $('.time').css('color', '#fff');
        }
        tc();
        setInterval(tc, 1000);
    });
})(jQuery);
