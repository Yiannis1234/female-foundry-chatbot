// SIMPLE TEST - Just to verify code runs
$w.onReady(function () {
    console.log('=== TEST CODE RUNNING ===');
    
    // Your counter
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });
    
    // Simple test button
    setTimeout(() => {
        if (typeof document !== 'undefined' && document.body) {
            const testBtn = document.createElement('button');
            testBtn.id = 'test-button-123';
            testBtn.textContent = '💬 TEST';
            testBtn.style.cssText = `
                position: fixed !important;
                bottom: 100px !important;
                right: 24px !important;
                width: 100px !important;
                height: 100px !important;
                background: red !important;
                color: white !important;
                border: 5px solid yellow !important;
                z-index: 99999999 !important;
                font-size: 20px !important;
                cursor: pointer !important;
            `;
            document.body.appendChild(testBtn);
            console.log('TEST BUTTON CREATED!', testBtn);
            
            testBtn.addEventListener('click', () => {
                alert('Button works!');
            });
        } else {
            console.error('document.body not available');
        }
    }, 2000);
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

