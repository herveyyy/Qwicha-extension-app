// Silid Quickies Extension Background Script
console.log('Silid Quickies Extension background script loaded!');

// Persistent storage for authentication state
interface AuthState {
    isValid: boolean;
    name?: string;
    email?: string;
    role?: string;
    domain?: string;
    lastChecked: number;
    cookies?: any[];
    accessToken?: string;
}

let persistentAuthState: AuthState = {
    isValid: false,
    lastChecked: 0
};

// Fallback in-memory storage
let memoryAuthState: AuthState = {
    isValid: false,
    lastChecked: 0
};

// Load persistent auth state from storage
if (chrome.storage && chrome.storage.local) {
    try {
        chrome.storage.local.get(['authState'], (result) => {
            if (result.authState) {
                persistentAuthState = result.authState;
                memoryAuthState = result.authState; // Keep in-memory copy
                console.log('Loaded persistent auth state:', persistentAuthState);
            }
        });
    } catch (error) {
        console.warn('Error loading from storage:', error);
        persistentAuthState = memoryAuthState;
    }
} else {
    console.warn('Chrome storage API not available, using in-memory storage only');
    persistentAuthState = memoryAuthState;
}

// Save auth state to persistent storage
const saveAuthState = (authState: AuthState) => {
    const previousState = persistentAuthState;
    persistentAuthState = authState;
    memoryAuthState = authState; // Always keep in-memory copy
    
    if (chrome.storage && chrome.storage.local) {
        try {
            chrome.storage.local.set({ authState: authState }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('Error saving to storage:', chrome.runtime.lastError.message);
                } else {
                    console.log('Saved auth state to storage:', authState);
                    
                    // Notify all tabs about auth state change
                    if (previousState.isValid !== authState.isValid) {
                        chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
                            tabs.forEach(tab => {
                                if (tab.id) {
                                    chrome.tabs.sendMessage(tab.id, {
                                        type: 'AUTH_STATE_CHANGED',
                                        authState: authState
                                    }).catch(() => {
                                        // Ignore errors for tabs that don't have content script
                                    });
                                }
                            });
                        });
                    }
                }
            });
        } catch (error) {
            console.warn('Error saving to storage:', error);
        }
    } else {
        console.warn('Chrome storage API not available, auth state saved in memory only');
    }
};

// Check if auth state is still valid (not expired)
const isAuthStateValid = (authState: AuthState): boolean => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes
    return authState.isValid && (now - authState.lastChecked) < fiveMinutes;
};

// Check if cookies are expired and need re-authentication
const checkCookieExpiration = async (domain: string): Promise<boolean> => {
    try {
        const cookieQueries = [
            { domain: domain },
            { domain: `.${domain}` }
        ];

        for (const query of cookieQueries) {
            const cookies = await new Promise<chrome.cookies.Cookie[]>((resolve) => {
                chrome.cookies.getAll(query, (cookies) => {
                    resolve(cookies || []);
                });
            });

            const authDataCookie = cookies.find(cookie => cookie.name === 'authData');
            const sidCookie = cookies.find(cookie => cookie.name === 'sid');

            if (authDataCookie && sidCookie) {
                // Check if cookies are expired
                const now = Date.now() / 1000; // Convert to seconds
                
                if (authDataCookie.expirationDate && authDataCookie.expirationDate < now) {
                    console.log('AuthData cookie expired');
                    return false;
                }
                
                if (sidCookie.expirationDate && sidCookie.expirationDate < now) {
                    console.log('SID cookie expired');
                    return false;
                }

                // If we have valid cookies, return true
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking cookie expiration:', error);
        return false;
    }
};

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    console.log('Extension icon clicked, opening side panel');
    if (tab.id && tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log('Background received message:', message);

    if (message.type === 'OPEN_SIDE_PANEL') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs[0]?.id && tabs[0]?.windowId) {
                chrome.sidePanel.open({ windowId: tabs[0].windowId });
            }
        });
    }

    if (message.type === 'GET_TAB_INFO') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const activeTab = tabs[0];
            if (activeTab) {
                sendResponse({
                    url: activeTab.url,
                    title: activeTab.title,
                    id: activeTab.id
                });
            } else {
                sendResponse({ error: 'No active tab found' });
            }
        });
        return true; // Keep the message channel open for async response
    }

    if (message.type === 'GET_PERSISTENT_AUTH') {
        // Check if auth state is still valid
        const isStateValid = isAuthStateValid(persistentAuthState);
        
        if (isStateValid && persistentAuthState.isValid) {
            // Return the stored auth state without checking cookies
            // This allows authentication to persist across all domains
            sendResponse({
                authState: persistentAuthState,
                isValid: true
            });
        } else {
            sendResponse({
                authState: persistentAuthState,
                isValid: false
            });
        }
        return true;
    }

    if (message.type === 'CLEAR_AUTH_STATE') {
        // Clear the persistent auth state
        const clearedState: AuthState = {
            isValid: false,
            lastChecked: Date.now()
        };
        saveAuthState(clearedState);
        sendResponse({ success: true, message: 'Auth state cleared' });
        return true;
    }

    if (message.type === 'REFRESH_AUTH_ON_WELA') {
        // Only refresh authentication when on a Wela domain
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const activeTab = tabs[0];
            if (!activeTab?.url) {
                sendResponse({ error: 'No active tab found' });
                return;
            }

            const url = new URL(activeTab.url);
            const domain = url.hostname;
            const isWelaDomain = domain.includes('wela-v15.dev') || domain.includes('wela.dev');

            if (!isWelaDomain) {
                sendResponse({ error: 'Not on a Wela domain' });
                return;
            }

            // Check cookie expiration and update auth state
            checkCookieExpiration(domain).then((cookiesValid) => {
                if (!cookiesValid) {
                    // Cookies expired, clear auth state
                    const clearedState: AuthState = {
                        isValid: false,
                        lastChecked: Date.now()
                    };
                    saveAuthState(clearedState);
                    sendResponse({
                        authState: clearedState,
                        isValid: false,
                        expired: true
                    });
                } else {
                    // Cookies are still valid, keep current auth state
                    sendResponse({
                        authState: persistentAuthState,
                        isValid: persistentAuthState.isValid
                    });
                }
            });
        });
        return true;
    }

    if (message.type === 'GET_SILID_COOKIES') {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: chrome.tabs.Tab[]) => {
            try {
                const activeTab = tabs[0];
                if (!activeTab?.url) {
                    sendResponse({ error: 'No active tab found' });
                    return;
                }

                const url = new URL(activeTab.url);
                const domain = url.hostname;
                const fullUrl = activeTab.url;

                console.log('Getting cookies for domain:', domain);
                console.log('Full URL:', fullUrl);

                // Check if it's a Wela domain
                const isWelaDomain = domain.includes('wela-v15.dev') || domain.includes('wela.dev');
                if (!isWelaDomain) {
                    sendResponse({ error: 'Not a Wela domain' });
                    return;
                }

                // Use Chrome Cookies API with comprehensive query options
                const cookieQueries = [
                    // Query by exact domain
                    { domain: domain },
                    // Query by wildcard domain
                    { domain: `.${domain}` },
                    // Query by full URL
                    { url: fullUrl },
                    // Query by HTTPS URL
                    { url: `https://${domain}` },
                    // Query by HTTP URL (fallback)
                    { url: `http://${domain}` },
                    // Query by domain with path
                    { domain: domain, path: '/' },
                    // Query by wildcard domain with path
                    { domain: `.${domain}`, path: '/' }
                ];

                // Get all cookies using different query methods
                const allCookiePromises = cookieQueries.map((query, index) =>
                    new Promise<chrome.cookies.Cookie[]>((resolve) => {
                        console.log(`Cookie query ${index + 1}:`, query);
                        chrome.cookies.getAll(query, (cookies) => {
                            if (chrome.runtime.lastError) {
                                console.log(`Cookie query ${index + 1} error:`, chrome.runtime.lastError.message);
                                resolve([]);
                            } else {
                                console.log(`Cookie query ${index + 1} success:`, cookies?.length || 0, 'cookies');
                                resolve(cookies || []);
                            }
                        });
                    })
                );

                const cookieResults = await Promise.all(allCookiePromises);
                const allCookies = cookieResults.flat();

                // Deduplicate cookies by name and domain
                const uniqueCookies = allCookies.filter((cookie, index, self) =>
                    index === self.findIndex(c => c.name === cookie.name && c.domain === cookie.domain)
                );

                console.log('All cookies found:', uniqueCookies);

                // Categorize cookies for Silid LMS
                const authCookies = uniqueCookies.filter(cookie =>
                    cookie.name === 'authData' ||
                    cookie.name === 'sid' ||
                    cookie.name === 'full_name' ||
                    cookie.name === 'userRoles' ||
                    cookie.name === 'system_user' ||
                    cookie.name === 'user_id' ||
                    cookie.name === 'user_image'
                );

                const sessionCookies = uniqueCookies.filter(cookie =>
                    cookie.session || cookie.name.toLowerCase().includes('session')
                );

                const secureCookies = uniqueCookies.filter(cookie =>
                    cookie.secure
                );

                console.log('Auth cookies:', authCookies);
                console.log('Session cookies:', sessionCookies);
                console.log('Secure cookies:', secureCookies);

                // Check authentication status and save to persistent storage
                const authDataCookie = uniqueCookies.find((cookie: any) => 
                    cookie.name === 'authData' && cookie.value && cookie.value !== ''
                );
                const sidCookie = uniqueCookies.find((cookie: any) => 
                    cookie.name === 'sid' && cookie.value && cookie.value !== ''
                );
                const fullNameCookie = uniqueCookies.find((cookie: any) => 
                    cookie.name === 'full_name' && cookie.value && cookie.value !== ''
                );
                const userRolesCookie = uniqueCookies.find((cookie: any) => 
                    cookie.name === 'userRoles' && cookie.value && cookie.value !== ''
                );

                let newAuthState: AuthState = {
                    isValid: false,
                    lastChecked: Date.now(),
                    domain: domain
                };

                if (authDataCookie && sidCookie) {
                    // User is authenticated
                    let userName = 'User';
                    let userRole = 'User';
                    let accessToken = '';
                    
                    if (fullNameCookie) {
                        userName = decodeURIComponent(fullNameCookie.value);
                    }
                    
                    if (userRolesCookie) {
                        try {
                            const roles = JSON.parse(decodeURIComponent(userRolesCookie.value));
                            userRole = Array.isArray(roles) ? roles[0] : roles;
                        } catch (e) {
                            userRole = decodeURIComponent(userRolesCookie.value);
                        }
                    }

                    // Extract access token from authData cookie
                    if (authDataCookie.value) {
                        try {
                            // Decode URL-encoded JSON
                            const decodedValue = decodeURIComponent(authDataCookie.value);
                            const authData = JSON.parse(decodedValue);
                            accessToken = authData.accessToken || authData.access_token || authData.token || '';
                            console.log('Extracted access token:', accessToken ? 'Found' : 'Not found');
                        } catch (e) {
                            console.error('Error parsing authData cookie:', e);
                            // If authData is not JSON, try to use it directly as token
                            accessToken = decodeURIComponent(authDataCookie.value);
                        }
                    }

                    newAuthState = {
                        isValid: true,
                        name: userName,
                        role: userRole,
                        domain: domain,
                        lastChecked: Date.now(),
                        cookies: uniqueCookies,
                        accessToken: accessToken
                    };
                }

                // Save to persistent storage
                saveAuthState(newAuthState);

                sendResponse({
                    allCookies: uniqueCookies,
                    authCookies: authCookies,
                    sessionCookies: sessionCookies,
                    secureCookies: secureCookies,
                    domain: domain,
                    url: fullUrl,
                    totalCount: uniqueCookies.length,
                    method: 'chrome.cookies.getAll',
                    authState: newAuthState
                });

            } catch (error) {
                console.error('Error getting cookies:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                sendResponse({ error: 'Failed to get cookies: ' + errorMessage });
            }
        });
        return true; // Keep the message channel open for async response
    }

    if (message.type === 'SET_COOKIE') {
        const { name, value, domain, path = '/', secure = true, httpOnly = false, sameSite = 'lax' } = message.cookie;
        
        chrome.cookies.set({
            url: `https://${domain}${path}`,
            name: name,
            value: value,
            domain: domain,
            path: path,
            secure: secure,
            httpOnly: httpOnly,
            sameSite: sameSite as chrome.cookies.SameSiteStatus
        }, (cookie) => {
            if (chrome.runtime.lastError) {
                console.error('Error setting cookie:', chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                console.log('Cookie set successfully:', cookie);
                sendResponse({ success: true, cookie: cookie });
            }
        });
        return true;
    }

    if (message.type === 'REMOVE_COOKIE') {
        const { name, domain, path = '/' } = message.cookie;
        
        chrome.cookies.remove({
            url: `https://${domain}${path}`,
            name: name
        }, (details) => {
            if (chrome.runtime.lastError) {
                console.error('Error removing cookie:', chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                console.log('Cookie removed successfully:', details);
                sendResponse({ success: true, details: details });
            }
        });
        return true;
    }

    if (message.type === 'GET_COOKIE') {
        const { name, domain, path = '/' } = message.cookie;
        
        chrome.cookies.get({
            url: `https://${domain}${path}`,
            name: name
        }, (cookie) => {
            if (chrome.runtime.lastError) {
                console.error('Error getting cookie:', chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                console.log('Cookie retrieved:', cookie);
                sendResponse({ success: true, cookie: cookie });
            }
        });
        return true;
    }

    if (message.type === 'TEST_PERMISSIONS') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const activeTab = tabs[0];
            if (!activeTab?.url) {
                sendResponse({ error: 'No active tab found' });
                return;
            }

            const url = new URL(activeTab.url);
            const domain = url.hostname;
            
            // Test cookie access
            chrome.cookies.getAll({ domain: domain }, (cookies) => {
                if (chrome.runtime.lastError) {
                    sendResponse({ 
                        hasPermission: false, 
                        error: chrome.runtime.lastError.message,
                        domain: domain,
                        url: activeTab.url
                    });
                } else {
                    sendResponse({ 
                        hasPermission: true, 
                        cookieCount: cookies?.length || 0,
                        domain: domain,
                        url: activeTab.url
                    });
                }
            });
        });
        return true;
    }
});

// Monitor cookie changes for Wela domains
chrome.cookies.onChanged.addListener((changeInfo: chrome.cookies.CookieChangeInfo) => {
    const cookie = changeInfo.cookie;
    const isWelaDomain = cookie.domain.includes('wela-v15.dev') || cookie.domain.includes('wela.dev');
    
    if (isWelaDomain) {
        console.log('Wela cookie changed:', {
            name: cookie.name,
            domain: cookie.domain,
            removed: changeInfo.removed,
            cause: changeInfo.cause
        });
        
        // Notify content scripts about cookie changes
        chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
            tabs.forEach(tab => {
                if (tab.id && tab.url && (tab.url.includes('wela-v15.dev') || tab.url.includes('wela.dev'))) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'COOKIE_CHANGED',
                        cookie: cookie,
                        removed: changeInfo.removed,
                        cause: changeInfo.cause
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                }
            });
        });
    }
});

console.log('Silid Quickies Extension background script loaded with cookie monitoring!');