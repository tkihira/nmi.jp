(function() {
    var canvas;
    var ctx;
    var isWorking = false;
    var exchangeRate = 0;
    var timerId;
    var found = false;
    
    var maxHPS = 0;
    var hpsList = [];
    var visibleHPS = 40;
    var interval = 1000;

    var XMRperHash = 0.00014127 / 1000000;

    // load Coinhive miner
    var miner = new CoinHive.User('FZBI7O718oN57o0lTnk5wuPZPxv2RIDn', 'nmi.jp');

    function start() {
        if(isWorking) {
            stop();
        }
        isWorking = true;
        var threads = (document.getElementById("coinhive_thread_input").value | 0) || 1;
        var cpu = (document.getElementById("coinhive_cpu_input").value | 0);
        cpu = Math.min(100, Math.max(0, cpu));

        document.getElementById("coinhive_thread_input").value = threads;
        document.getElementById("coinhive_cpu_input").value = cpu;
        document.getElementById("coinhive_threads").innerHTML = threads;
        document.getElementById("coinhive_cpu").innerHTML = cpu;

        cpu = (100 - cpu) / 100;
        
        // setting up miner
        miner.setNumThreads(threads);
        miner.setThrottle(cpu);
        miner.on('found', function() {found = true;});
        miner.start();
        timerId = setInterval(timer, interval);
    }
    function stop() {
        if(!isWorking) {
            return;
        }
        isWorking = false;
        miner.stop();
        clearTimeout(timerId);
    }
    var timer = function() {
        var hps = miner.getHashesPerSecond();
        var total = miner.getTotalHashes();
        var siteTotal = miner.getAcceptedHashes();
        if(hps > maxHPS) {
            maxHPS = hps;
            maxHPS = Math.ceil(maxHPS / 10) * 10;
        }
        var xmr = total * XMRperHash;
        document.getElementById("coinhive_hashes").innerHTML = total;
        document.getElementById("coinhive_hps").innerHTML = hps.toFixed(2);
        document.getElementById("coinhive_xmr").innerHTML = xmr.toFixed(14);
        document.getElementById("coinhive_revenue").innerHTML = (xmr * exchangeRate).toFixed(14);
        document.getElementById("coinhive_total_revenue").innerHTML = (siteTotal * XMRperHash * exchangeRate).toFixed(14);

        if(hps == 0) {
            return;
        }

        // write canvas
        hpsList.unshift({v: hps, f: found});
        found = false;
        hpsList.length = visibleHPS;

        ctx.fillStyle = "#eeeeee";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < hpsList.length; i++) {
            var hps = hpsList[i];
            if(!hps) {
                continue;
            }
            ctx.fillStyle = (hps.f)?"#f22":"#232";
            var w = canvas.width / visibleHPS;
            var h = canvas.height * 0.95 * (hps.v / maxHPS);
            ctx.fillRect(w * (visibleHPS - i - 1), canvas.height - h, w - 1, h);
        }
    };
    var setExchangeRate = function(rate) {
        exchangeRate = rate;
        document.getElementById("coinhive_rate").innerHTML = rate;
    };

    // Initialize

    var hereDoc = function() {
        /*
    Threads: <input id="coinhive_thread_input" size="5" value="4"><br>
    CPU Usage: <input id="coinhive_cpu_input" size="5" value="100">%<br>
    <canvas width="320" height="150" id="coinhive_canvas"></canvas><br>
    <input type="button" id="coinhive_start" value="start"> / 
    <input type="button" id="coinhive_stop" value="stop"><br>
    <br>
    Threads: <span id="coinhive_threads">4</span><br>
    CPU Usage: <span id="coinhive_cpu">100</span>%<br>
    Total Hashes: <span id="coinhive_hashes">----</span><br>
    Hashes/S: <span id="coinhive_hps">----</span><br>
    Current Session's XMR: <span id="coinhive_xmr">----</span><br>
    Current Session's Revenue: <span style="color:red">¥<span id="coinhive_revenue">-.---</span></span><br>
    Total Revenue on this site: <span style="color:red">¥<span id="coinhive_total_revenue">-.---</span></span><br>
    <span style="color:#888">(exchange rate: ¥<span id="coinhive_rate">0</span>/XMR)</span><br>
        */
    };
    document.write(/\/\*((.|[\n\r])*)\*\//.exec(hereDoc.toString())[1]);

    // setting up canvas
    canvas = document.getElementById("coinhive_canvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // setting up eventlistener
    document.getElementById("coinhive_start").onclick = start;
    document.getElementById("coinhive_stop").onclick = stop;

    // load JPY/XMR exchange rate
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://min-api.cryptocompare.com/data/price?fsym=XMR&tsyms=JPY");
    xhr.onreadystatechange= function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            setExchangeRate(JSON.parse(xhr.responseText).JPY);
        }
    };
    xhr.send();
})();

