// FORCE WORK VERSION - This WILL work
$w.onReady(function () {
    
    // Your counter
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });

    // FORCE CREATE CHATBOT - Multiple aggressive attempts
    console.log('=== STARTING CHATBOT ===');
    
    function forceCreateChatbot() {
        console.log('forceCreateChatbot called');
        
        // Access document through window
        const doc = typeof window !== 'undefined' ? window.document : (typeof document !== 'undefined' ? document : null);
        
        if (!doc || !doc.body) {
            console.log('Document not ready, retrying...');
            setTimeout(forceCreateChatbot, 500);
            return;
        }
        
        console.log('Document found!', doc);
        
        // Check if exists
        if (doc.getElementById('ff-chatbot-launcher')) {
            console.log('Already exists');
            return;
        }
        
        console.log('Creating chatbot NOW...');
        
        // Create button directly
        const btn = doc.createElement('button');
        btn.id = 'ff-chatbot-launcher';
        btn.innerHTML = '💬';
        btn.setAttribute('aria-label', 'Chat');
        
        // FORCE styles inline
        btn.style.position = 'fixed';
        btn.style.bottom = '24px';
        btn.style.right = '24px';
        btn.style.width = '64px';
        btn.style.height = '64px';
        btn.style.borderRadius = '50%';
        btn.style.background = '#1a1a1a';
        btn.style.color = '#ffffff';
        btn.style.border = 'none';
        btn.style.fontSize = '1.6rem';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '2147483647';
        btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        
        // Try multiple append methods
        try {
            doc.body.appendChild(btn);
            console.log('Button appended to body');
        } catch (e) {
            console.error('Failed to append to body:', e);
            try {
                doc.documentElement.appendChild(btn);
                console.log('Button appended to documentElement');
            } catch (e2) {
                console.error('Failed to append to documentElement:', e2);
            }
        }
        
        // Verify it exists
        setTimeout(() => {
            const check = doc.getElementById('ff-chatbot-launcher');
            if (check) {
                console.log('✅ BUTTON EXISTS!', check);
                if (typeof window !== 'undefined' && window.getComputedStyle) {
                    console.log('Button computed style:', window.getComputedStyle(check));
                }
                
                // Force show again
                check.style.cssText = 'position:fixed!important;bottom:24px!important;right:24px!important;width:64px!important;height:64px!important;border-radius:50%!important;background:#1a1a1a!important;color:#fff!important;border:none!important;font-size:1.6rem!important;cursor:pointer!important;z-index:2147483647!important;box-shadow:0 4px 16px rgba(0,0,0,0.3)!important;display:flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;';
                
                // Add click handler
                check.onclick = function() {
                    alert('Chatbot button clicked! Code is working!');
                };
            } else {
                console.error('❌ BUTTON NOT FOUND AFTER CREATION!');
            }
        }, 100);
    }
    
    // Try immediately - access document through window
    const doc = typeof window !== 'undefined' ? window.document : null;
    if (doc && doc.body) {
        forceCreateChatbot();
    }
    
    // Try after delays
    setTimeout(forceCreateChatbot, 500);
    setTimeout(forceCreateChatbot, 1500);
    setTimeout(forceCreateChatbot, 3000);
    
    // Try on window load
    if (typeof window !== 'undefined') {
        const win = window;
        if (win.addEventListener) {
            win.addEventListener('load', () => {
                setTimeout(forceCreateChatbot, 1000);
            });
        }
        
        // Also try accessing document after a delay
        setTimeout(() => {
            if (win.document && win.document.body) {
                forceCreateChatbot();
            }
        }, 2000);
    }
    
    // Try with requestAnimationFrame
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
            setTimeout(forceCreateChatbot, 500);
        });
    }
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

