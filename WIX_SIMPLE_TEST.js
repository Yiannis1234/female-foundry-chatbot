// ULTRA SIMPLE TEST - This MUST work if code is running
$w.onReady(function () {
    
    // Your counter
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });
    
    // SIMPLE TEST - Show alert immediately
    alert('CODE IS RUNNING! If you see this, the code works.');
    
    // Try to add button after alert
    setTimeout(() => {
        if (typeof document !== 'undefined' && document.body) {
            const btn = document.createElement('button');
            btn.textContent = 'CHATBOT TEST';
            btn.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:20px;z-index:999999;font-size:20px;';
            document.body.appendChild(btn);
            btn.onclick = () => alert('Button works!');
        }
    }, 1000);
});

function easeOutExpo(t, b, c, d) {
    if (t < 0.7 * d) {
        return b + (c * (t / d));
    } else {
        return b + c * (1 - Math.pow(2, -10 * (t - 0.7 * d) / (0.3 * d)));
    }
}

function animateNumberCounter(elementId, start, end, duration) {
    let startTime = Date.now();
    const change = end - start;
    const counterInterval = setInterval(() => {
        let elapsedTime = Date.now() - startTime;
        if (elapsedTime < duration) {
            const easedValue = easeOutExpo(elapsedTime, start, change, duration);
            $w(elementId).text = `${Math.round(easedValue).toLocaleString()}`;
        } else {
            clearInterval(counterInterval);
            $w(elementId).text = `${end.toLocaleString()}`;
        }
    }, 10);
}

