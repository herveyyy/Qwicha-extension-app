import { useState, useEffect } from 'react';

interface TabInfo {
    url?: string;
    title?: string;
    id?: number;
}

interface ClassCard {
    id: string;
    name: string;
    subject: string;
    color: 'blue' | 'green' | 'orange' | 'purple';
    activityCount: number;
}

interface Activity {
    id: string;
    title: string;
    type: 'Quiz' | 'Assignment' | 'Lesson';
    dueDate: string;
}

interface AuthState {
    isValid: boolean;
    name?: string;
    email?: string;
    role?: string;
    domain?: string;
    lastChecked: number;
    cookies?: any[];
}

interface CookieResponse {
    allCookies?: any[];
    authCookies?: any[];
    sessionCookies?: any[];
    secureCookies?: any[];
    domain?: string;
    url?: string;
    totalCount?: number;
    method?: string;
    authState?: AuthState;
    error?: string;
}

function App() {
    const [tabInfo, setTabInfo] = useState<TabInfo>({});
    const [isConnected, setIsConnected] = useState(false);
    const [currentView, setCurrentView] = useState<'classes' | 'activities' | 'auth'>('classes');
    const [selectedClass, setSelectedClass] = useState<ClassCard | null>(null);
    const [userInfo, setUserInfo] = useState<AuthState | null>(null);
    const [cookies, setCookies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Minimal class data
    const classCards: ClassCard[] = [
        { id: '1', name: 'Mother Tongue', subject: 'MT1', color: 'blue', activityCount: 3 },
        { id: '2', name: 'Science', subject: 'SCI1', color: 'green', activityCount: 2 },
        { id: '3', name: 'English', subject: 'ENG1', color: 'orange', activityCount: 4 },
        { id: '4', name: 'Mathematics', subject: 'MATH1', color: 'purple', activityCount: 5 },
        { id: '5', name: 'Filipino', subject: 'FIL1', color: 'blue', activityCount: 2 },
        { id: '6', name: 'Advisory', subject: 'ADV1', color: 'green', activityCount: 1 }
    ];

    // Minimal activity data
    const activities: { [classId: string]: Activity[] } = {
        '1': [
            { id: 'a1', title: 'Vocabulary Quiz', type: 'Quiz', dueDate: 'Sep 23' },
            { id: 'a2', title: 'Reading Assignment', type: 'Assignment', dueDate: 'Sep 25' },
            { id: 'a3', title: 'Grammar Lesson', type: 'Lesson', dueDate: 'Sep 27' }
        ],
        '2': [
            { id: 'b1', title: 'Plant Growth Quiz', type: 'Quiz', dueDate: 'Sep 24' },
            { id: 'b2', title: 'Experiment Report', type: 'Assignment', dueDate: 'Sep 26' }
        ],
        '3': [
            { id: 'c1', title: 'Vocabulary Test', type: 'Quiz', dueDate: 'Sep 23' },
            { id: 'c2', title: 'Reading Comprehension', type: 'Assignment', dueDate: 'Sep 25' },
            { id: 'c3', title: 'Grammar Lesson', type: 'Lesson', dueDate: 'Sep 27' },
            { id: 'c4', title: 'Writing Exercise', type: 'Assignment', dueDate: 'Sep 29' }
        ],
        '4': [
            { id: 'd1', title: 'Addition Quiz', type: 'Quiz', dueDate: 'Sep 23' },
            { id: 'd2', title: 'Subtraction Practice', type: 'Assignment', dueDate: 'Sep 24' },
            { id: 'd3', title: 'Number Patterns', type: 'Lesson', dueDate: 'Sep 25' },
            { id: 'd4', title: 'Problem Solving', type: 'Assignment', dueDate: 'Sep 26' },
            { id: 'd5', title: 'Review Quiz', type: 'Quiz', dueDate: 'Sep 28' }
        ],
        '5': [
            { id: 'e1', title: 'Alpabeto Quiz', type: 'Quiz', dueDate: 'Sep 24' },
            { id: 'e2', title: 'Pagsulat Exercise', type: 'Assignment', dueDate: 'Sep 26' }
        ],
        '6': [
            { id: 'f1', title: 'Class Meeting', type: 'Lesson', dueDate: 'Sep 25' }
        ]
    };

    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' }, (response: TabInfo) => {
            if (response) {
                setTabInfo(response);
            }
        });

        const checkConnection = () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response: any) => {
                        if (chrome.runtime.lastError) {
                            setIsConnected(false);
                        } else {
                            setIsConnected(true);
                        }
                    });
                }
            });
        };
        
        checkConnection();
        loadPersistentAuth();

        // Set up interval to check for authentication changes
        const authCheckInterval = setInterval(() => {
            loadPersistentAuth();
        }, 2000); // Check every 2 seconds

        // Listen for tab updates to check auth when user navigates
        const handleTabUpdate = () => {
            setTimeout(() => {
                loadPersistentAuth();
            }, 1000); // Wait 1 second after tab update
        };

        // Listen for messages from background script about auth changes
        const messageListener = (message: any) => {
            if (message.type === 'AUTH_STATE_CHANGED') {
                loadPersistentAuth();
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        return () => {
            clearInterval(authCheckInterval);
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const loadPersistentAuth = () => {
        chrome.runtime.sendMessage({ type: 'GET_PERSISTENT_AUTH' }, (response: any) => {
            if (response && response.authState) {
                setUserInfo(response.authState);
                if (response.authState.cookies) {
                    setCookies(response.authState.cookies);
                }
            }
        });
    };

    const getCookies = () => {
        setIsLoading(true);
        chrome.runtime.sendMessage({ type: 'GET_SILID_COOKIES' }, (response: CookieResponse) => {
            setIsLoading(false);
            if (response.error) {
                console.error('Error getting cookies:', response.error);
                if (response.error.includes('Not a Wela domain')) {
                    alert('Please navigate to a Wela domain (staging-33.wela-v15.dev) first, then try again.');
                } else {
                    alert('Error: ' + response.error);
                }
            } else if (response.allCookies) {
                setCookies(response.allCookies);
                if (response.authState) {
                    setUserInfo(response.authState);
                }
                console.log('Cookies retrieved:', response);
            }
        });
    };

    const clearAuthState = () => {
        chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_STATE' }, (response: any) => {
            if (response && response.success) {
                setUserInfo(null);
                setCookies([]);
                console.log('Auth state cleared');
            }
        });
    };

    const goToLoginPage = () => {
        const loginUrl = 'https://staging-33.wela-v15.dev/login#login';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs[0]?.id) {
                chrome.tabs.update(tabs[0].id, { url: loginUrl });
            }
        });
    };

    const handleClassClick = (classCard: ClassCard) => {
        setSelectedClass(classCard);
        setCurrentView('activities');
    };

    const handleActivityClick = (activity: Activity) => {
        const redirectUrl = 'https://staging-33.wela-v15.dev/silid-lms/';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            if (tabs[0]?.id) {
                chrome.tabs.update(tabs[0].id, { url: redirectUrl });
            }
        });
    };

    const goBackToClasses = () => {
        setCurrentView('classes');
        setSelectedClass(null);
    };

    const getClassColor = (color: string) => {
        switch (color) {
            case 'blue': return 'from-blue-500 to-blue-600';
            case 'green': return 'from-emerald-500 to-emerald-600';
            case 'orange': return 'from-orange-500 to-orange-600';
            case 'purple': return 'from-purple-500 to-purple-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'Quiz': return '🧠';
            case 'Assignment': return '📝';
            case 'Lesson': return '📚';
            default: return '📄';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'Quiz': return 'bg-indigo-50 text-indigo-600';
            case 'Assignment': return 'bg-emerald-50 text-emerald-600';
            case 'Lesson': return 'bg-amber-50 text-amber-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    // Show splash screen when not authenticated
    if (!userInfo?.isValid) {
        return (
            <div className="h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background texture */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-100/30"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-200/40 to-transparent"></div>
                
                {/* Logo */}
                <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25 transform rotate-12">
                        <span className="text-white text-3xl font-bold transform -rotate-12">SQ</span>
                    </div>
                    
                    {/* App Name */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Silid Qwicha</h1>
                        <p className="text-gray-700 text-lg mb-1">Smart. Safe. Seamless.</p>
                        <p className="text-gray-600 text-sm">Your student portal for classes and activities.</p>
                    </div>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button
                            onClick={goToLoginPage}
                            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => {
                                loadPersistentAuth();
                                getCookies();
                            }}
                            disabled={isLoading}
                            className="px-6 py-3 bg-white/80 hover:bg-white disabled:bg-white/60 text-orange-600 font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-orange-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Checking...</span>
                                </>
                            ) : (
                                <span>Check Authentication</span>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Subtle particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-300/20 rounded-full animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-500/25 rounded-full animate-pulse delay-2000"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">SQ</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Silid Qwicha</h1>
                            {userInfo?.isValid && (
                                <p className="text-xs text-green-600">✓ {userInfo.name}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentView(currentView === 'auth' ? 'classes' : 'auth')}
                            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            title="Authentication & Cookies"
                        >
                            <span className="text-gray-600 text-sm">⚙️</span>
                        </button>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            {(currentView === 'activities' && selectedClass) || currentView === 'auth' ? (
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2">
                    <button
                        onClick={currentView === 'auth' ? () => setCurrentView('classes') : goBackToClasses}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>
                </div>
            ) : null}

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {currentView === 'auth' ? (
                    <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-xl p-6 text-gray-900">
                        {/* Authentication Header */}
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25 transform rotate-12 mx-auto mb-4">
                                <span className="text-white text-2xl font-bold transform -rotate-12">⚙️</span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication & Cookies</h2>
                            <p className="text-sm text-gray-600">Manage your login status and cookies</p>
                        </div>

                        {/* Authentication Status */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Authentication Status</h3>
                                <div className={`w-3 h-3 rounded-full ${userInfo?.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            
                            {userInfo?.isValid ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Name:</span>
                                        <span className="text-sm font-medium text-gray-900">{userInfo.name}</span>
                                    </div>
                                    {userInfo.role && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Role:</span>
                                            <span className="text-sm font-medium text-gray-900">{userInfo.role}</span>
                                        </div>
                                    )}
                                    {userInfo.domain && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Domain:</span>
                                            <span className="text-sm font-medium text-gray-900">{userInfo.domain}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Cookies:</span>
                                        <span className="text-sm font-medium text-gray-900">{cookies.length} stored</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-orange-600 text-xl">🔒</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">Not authenticated</p>
                                    <button
                                        onClick={goToLoginPage}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Go to Login Page
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cookie Management */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Cookie Management</h3>
                                <span className="text-xs text-gray-500">{cookies.length} cookies</span>
                            </div>
                            
                            <div className="space-y-2">
                                <button
                                    onClick={getCookies}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Getting Cookies...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🍪</span>
                                            <span>Get Cookies</span>
                                        </>
                                    )}
                                </button>
                                
                                {userInfo?.isValid && (
                                    <button
                                        onClick={clearAuthState}
                                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>🗑️</span>
                                        <span>Clear Authentication</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cookie List */}
                        {cookies.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Stored Cookies</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {cookies.slice(0, 10).map((cookie, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{cookie.name}</p>
                                                <p className="text-xs text-gray-600 truncate">{cookie.domain}</p>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {cookie.secure ? '🔒' : '🔓'}
                                            </div>
                                        </div>
                                    ))}
                                    {cookies.length > 10 && (
                                        <p className="text-xs text-gray-500 text-center">... and {cookies.length - 10} more</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : currentView === 'classes' ? (
                    <>
                        {/* Classes Header */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">My Classes</h2>
                            <p className="text-sm text-gray-600">Select a class to view activities</p>
                        </div>

                        {/* Class Cards */}
                        <div className="space-y-2">
                            {classCards.map((classCard) => (
                                <div
                                    key={classCard.id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                    onClick={() => handleClassClick(classCard)}
                                >
                                    <div className="flex items-center p-3">
                                        {/* Color Indicator */}
                                        <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${getClassColor(classCard.color)} mr-3`}></div>
                                        
                                        {/* Class Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900">{classCard.name}</h3>
                                                <span className="text-xs text-gray-500">{classCard.activityCount} activities</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{classCard.subject}</p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                            <span className="text-gray-600 text-xs">→</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Activities Header */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                {selectedClass?.name} Activities
                            </h2>
                            <p className="text-sm text-gray-600">Click to open in LMS</p>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-2">
                            {selectedClass && activities[selectedClass.id]?.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                    onClick={() => handleActivityClick(activity)}
                                >
                                    <div className="flex items-center p-3">
                                        {/* Activity Icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getActivityColor(activity.type)}`}>
                                            <span className="text-sm">{getActivityIcon(activity.type)}</span>
                                        </div>
                                        
                                        {/* Activity Info */}
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                                            <p className="text-xs text-gray-600">Due: {activity.dueDate}</p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                            <span className="text-gray-600 text-xs">→</span>
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-gray-400 text-xl">📚</span>
                                    </div>
                                    <p className="text-sm text-gray-600">No activities available</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-3">
                <p className="text-xs text-gray-500 text-center">Student Portal</p>
            </div>
        </div>
    );
}

export default App;