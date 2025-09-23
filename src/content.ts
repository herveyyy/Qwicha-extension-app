// Silid Qwicha Extension Content Script
console.log('Silid Qwicha Extension content script loaded!');

// Check if we're on a Wela domain
const isWelaDomain = window.location.hostname.includes('wela-v15.dev') || window.location.hostname.includes('wela.dev');

if (!isWelaDomain) {
    console.log('Not on a Wela domain, content script inactive');
} else {
    console.log('On Wela domain, content script active');
}

// Handle messages from background script and side panel
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Content script received message:', message);

    try {
        if (message.type === 'PING') {
            sendResponse({ status: 'pong', domain: window.location.hostname });
        }

        if (message.type === 'GET_PAGE_INFO') {
            sendResponse({
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname,
                isWelaDomain: isWelaDomain
            });
        }

        if (message.type === 'INJECT_GOOD_VIBES') {
            // Create a beautiful notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            `;
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">✨</span>
                    <span>Good vibes from Silid Qwicha!</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    if (style.parentNode) {
                        style.parentNode.removeChild(style);
                    }
                }, 300);
            }, 3000);
            
            sendResponse({ success: true, message: 'Good vibes injected!' });
        }

        if (message.type === 'COOKIE_CHANGED') {
            console.log('Cookie changed on page:', message.cookie);
            
            // Show a subtle notification for cookie changes
            if (message.cookie.name === 'authData' || message.cookie.name === 'sid') {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: ${message.removed ? '#ef4444' : '#10b981'};
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    animation: slideIn 0.3s ease-out;
                `;
                
                notification.textContent = message.removed 
                    ? `🔓 ${message.cookie.name} removed` 
                    : `🔐 ${message.cookie.name} updated`;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 2000);
            }
        }

    } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Auto-detect page changes and notify background script
if (isWelaDomain) {
    // Monitor for navigation changes
    let currentUrl = window.location.href;
    
    const checkUrlChange = () => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('Page navigation detected:', currentUrl);
            
            // Notify background script about page change
            chrome.runtime.sendMessage({
                type: 'PAGE_NAVIGATED',
                url: currentUrl,
                domain: window.location.hostname
            }).catch(() => {
                // Ignore errors if background script is not ready
            });
        }
    };
    
    // Check for URL changes periodically
    setInterval(checkUrlChange, 1000);
    
    // Also listen for popstate events
    window.addEventListener('popstate', checkUrlChange);
    
    console.log('Silid Qwicha Extension content script ready for Wela domain!');
}