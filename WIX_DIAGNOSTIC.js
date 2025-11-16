// DIAGNOSTIC TEST - Let's see what's actually happening
$w.onReady(function () {
    console.log('=== DIAGNOSTIC TEST STARTED ===');
    
    // Your counter
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });
    
    // Test 1: Can we access document?
    console.log('Test 1 - document exists?', typeof document !== 'undefined');
    console.log('Test 2 - window exists?', typeof window !== 'undefined');
    console.log('Test 3 - document.body exists?', document && document.body ? 'YES' : 'NO');
    
    // Test 2: Try to create a simple element
    setTimeout(() => {
        try {
            console.log('Attempting to create test element...');
            
            if (!document || !document.body) {
                console.error('ERROR: document or document.body is not available!');
                alert('ERROR: Cannot access document.body. Wix might be blocking DOM access.');
                return;
            }
            
            // Create a super obvious test button
            const testBtn = document.createElement('button');
            testBtn.id = 'DIAGNOSTIC-TEST-BUTTON';
            testBtn.textContent = '🔴 TEST BUTTON';
            testBtn.style.cssText = `
                position: fixed !important;
                top: 50px !important;
                left: 50px !important;
                width: 200px !important;
                height: 100px !important;
                background: red !important;
                color: white !important;
                border: 5px solid yellow !important;
                z-index: 99999999 !important;
                font-size: 24px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            
            testBtn.onclick = () => {
                alert('Button clicked! Code is working!');
            };
            
            document.body.appendChild(testBtn);
            console.log('Test button created and appended!');
            console.log('Button element:', testBtn);
            console.log('Button in DOM?', document.getElementById('DIAGNOSTIC-TEST-BUTTON') ? 'YES' : 'NO');
            
            // Check if it's actually visible
            setTimeout(() => {
                const btn = document.getElementById('DIAGNOSTIC-TEST-BUTTON');
                if (btn) {
                    const styles = window.getComputedStyle(btn);
                    console.log('Button computed styles:', {
                        display: styles.display,
                        visibility: styles.visibility,
                        opacity: styles.opacity,
                        zIndex: styles.zIndex,
                        position: styles.position
                    });
                }
            }, 500);
            
        } catch (error) {
            console.error('ERROR creating test element:', error);
            alert('ERROR: ' + error.message);
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

