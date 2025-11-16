$w.onReady(function () {

    // Start counter when the element enters the viewport
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200); // Duration: 1200ms
    });

    // Female Foundry Chatbot - Page Specific Code
    (function() {
        // Chatbot URL
        const CHATBOT_URL = 'https://573d5ada1e55.ngrok-free.app';
        
        // Create floating button
        const launcher = document.createElement('button');
        launcher.innerHTML = '💬';
        launcher.setAttribute('aria-label', 'Open chat');
        launcher.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #1a1a1a;
            color: #ffffff;
            border: none;
            font-size: 1.6rem;
            cursor: pointer;
            z-index: 999998;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create iframe for chatbot
        const iframe = document.createElement('iframe');
        iframe.src = CHATBOT_URL;
        iframe.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 420px;
            height: 680px;
            max-height: calc(100vh - 120px);
            border: none;
            z-index: 999999;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            display: none;
            background: #ffffff;
        `;
        
        // Toggle chat open/closed
        let isOpen = false;
        launcher.addEventListener('click', function() {
            isOpen = !isOpen;
            iframe.style.display = isOpen ? 'block' : 'none';
            launcher.innerHTML = isOpen ? '✖' : '💬';
            launcher.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        });
        
        // Hover effect
        launcher.addEventListener('mouseenter', function() {
            launcher.style.transform = isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1.05)';
            launcher.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        });
        
        launcher.addEventListener('mouseleave', function() {
            launcher.style.transform = isOpen ? 'rotate(90deg)' : 'scale(1)';
            launcher.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                isOpen = false;
                iframe.style.display = 'none';
                launcher.innerHTML = '💬';
                launcher.style.transform = 'rotate(0deg)';
            }
        });
        
        // Add to page
        document.body.appendChild(launcher);
        document.body.appendChild(iframe);
        
        // Responsive: adjust on mobile
        function adjustForMobile() {
            if (window.innerWidth <= 768) {
                iframe.style.width = 'calc(100vw - 32px)';
                iframe.style.right = '16px';
                iframe.style.bottom = '100px';
                iframe.style.maxWidth = '420px';
                launcher.style.right = '16px';
                launcher.style.bottom = '16px';
            } else {
                iframe.style.width = '420px';
                iframe.style.right = '24px';
                iframe.style.bottom = '100px';
                launcher.style.right = '24px';
                launcher.style.bottom = '24px';
            }
        }
        
        window.addEventListener('resize', adjustForMobile);
        adjustForMobile();
    })();
});

// Function for easing effect: slows down in the last 30% of counting
function easeOutExpo(t, b, c, d) {
    if (t < 0.7 * d) { // First 70% is linear
        return b + (c * (t / d));
    } else { // Last 30% slows down
        return b + c * (1 - Math.pow(2, -10 * (t - 0.7 * d) / (0.3 * d)));
    }
}

// Function to animate number counter smoothly
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
    }, 10); // Updates every 10ms for ultra-smooth animation
}

