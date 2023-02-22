//Script to make the clock in the top bar work
//pretty self explanatory but it's a bit of a mess lmfao
startTime();
        function startTime() {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            if (m < 10) {
                m = "0" + m;
            }
            if (h < 10) {
                h = "0" + h;
            }
            
            document.getElementsByClassName("topbartime")[0].innerHTML =
            h + ":" + m;
            var t = setTimeout(startTime, 500);
        }