import { useState, useEffect } from 'react';
import { 
    SplashScreen, 
    MainLayout, 
    ClassList, 
    ActivityList,
    AuthStatus,
    Button,
    Icon
} from './components';

interface TabInfo {
    url?: string;
    title?: string;
    id?: number;
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
    accessToken?: string;
}

interface ApiClassCard {
    classCardId: string;
    classRoomId: string;
    classRoomName: string;
    color: string;
    createdAt: string;
    sectionName: string;
    subjectCode: string;
    subjectId: string;
    subjectName: string;
    updatedAt: string;
    activityCount?: number;
    teacher?: string;
}

interface ApiResponse {
    success: boolean;
    data?: ApiClassCard[];
    error?: string;
    message?: string;
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
    const [selectedClass, setSelectedClass] = useState<ApiClassCard | null>(null);
    const [userInfo, setUserInfo] = useState<AuthState | null>(null);
    const [cookies, setCookies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiClassCards, setApiClassCards] = useState<ApiClassCard[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);

    // Minimal class data
    const classCards: ApiClassCard[] = [
        { 
            classCardId: '1', 
            classRoomId: 'room-1',
            classRoomName: 'Mother Tongue', 
            subjectName: 'Mother Tongue', 
            subjectCode: 'MT1', 
            color: '#3b82f6', 
            activityCount: 3,
            createdAt: '2025-09-18T05:50:39.751Z',
            sectionName: 'Grade 1',
            subjectId: 'sub-1',
            updatedAt: '2025-09-18T05:50:39.751Z'
        },
        { 
            classCardId: '2', 
            classRoomId: 'room-2',
            classRoomName: 'Science', 
            subjectName: 'Science', 
            subjectCode: 'SCI1', 
            color: '#10b981', 
            activityCount: 2,
            createdAt: '2025-09-18T05:50:39.751Z',
            sectionName: 'Grade 1',
            subjectId: 'sub-2',
            updatedAt: '2025-09-18T05:50:39.751Z'
        },
        { 
            classCardId: '3', 
            classRoomId: 'room-3',
            classRoomName: 'English', 
            subjectName: 'English', 
            subjectCode: 'ENG1', 
            color: '#f59e0b', 
            activityCount: 4,
            createdAt: '2025-09-18T05:50:39.751Z',
            sectionName: 'Grade 1',
            subjectId: 'sub-3',
            updatedAt: '2025-09-18T05:50:39.751Z'
        },
        { 
            classCardId: '4', 
            classRoomId: 'room-4',
            classRoomName: 'Mathematics', 
            subjectName: 'Mathematics', 
            subjectCode: 'MATH1', 
            color: '#8b5cf6', 
            activityCount: 5,
            createdAt: '2025-09-18T05:50:39.751Z',
            sectionName: 'Grade 1',
            subjectId: 'sub-4',
            updatedAt: '2025-09-18T05:50:39.751Z'
        }
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

    // Auto-fetch class cards when user is authenticated
    useEffect(() => {
        if (userInfo?.isValid && userInfo?.accessToken && apiClassCards.length === 0) {
            fetchClassCards();
        }
    }, [userInfo?.isValid, userInfo?.accessToken]);

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

    const fetchClassCards = async () => {
        if (!userInfo?.accessToken) {
            console.error('No access token available');
            return;
        }

        setIsLoadingClasses(true);
        try {
            const params = new URLSearchParams({
                // Add any required parameters here
                // For example: student_id, academic_year, etc.
            });

            // Use your backend API
            const BACKEND_API = 'https://iws4c44og44kg4ok8cwggwsw.wela.dev';

            console.log('User Info:', userInfo);
            console.log('Backend API:', BACKEND_API);
            console.log('Access Token:', userInfo.accessToken ? 'Present' : 'Missing');

            const response = await fetch(
                `${BACKEND_API}/class/classCards?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userInfo.accessToken}`,
                    },
                }
            );

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const resJson = await response.json();
            console.log('API Response:', resJson);

            // Handle different possible response structures
            let classCardsData = [];
            
            if (Array.isArray(resJson)) {
                // Direct array response
                classCardsData = resJson;
            } else if (resJson.data && Array.isArray(resJson.data)) {
                // Response with data property
                classCardsData = resJson.data;
            } else if (resJson.message && Array.isArray(resJson.message)) {
                // Frappe-style response
                classCardsData = resJson.message;
            } else if (resJson.classCards && Array.isArray(resJson.classCards)) {
                // Response with classCards property
                classCardsData = resJson.classCards;
            } else {
                console.warn('Unexpected API response format:', resJson);
                setApiClassCards([]);
                return;
            }

            // Transform API data to match our interface
            const transformedCards: ApiClassCard[] = classCardsData.map((card: any, index: number) => ({
                classCardId: card.classCardId || card.id || `card-${index}`,
                classRoomId: card.classRoomId || '',
                classRoomName: card.classRoomName || card.name || 'Unnamed Class',
                color: card.color || '#22d3ee', // Default to the cyan color from your example
                createdAt: card.createdAt || '',
                sectionName: card.sectionName || '',
                subjectCode: card.subjectCode || '',
                subjectId: card.subjectId || '',
                subjectName: card.subjectName || card.subject || 'N/A',
                updatedAt: card.updatedAt || '',
                activityCount: card.activityCount || card.activity_count || card.activities?.length || 0,
                teacher: card.teacher || card.instructor || card.teacherName
            }));
            
            setApiClassCards(transformedCards);
        } catch (error) {
            console.error('Error fetching class cards:', error);
            setApiClassCards([]);
        } finally {
            setIsLoadingClasses(false);
        }
    };

    const handleClassClick = (classCard: ApiClassCard) => {
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


    // Show splash screen when not authenticated
    if (!userInfo?.isValid) {
        return (
            <SplashScreen
                isLoading={isLoading}
                onGetStarted={goToLoginPage}
                onCheckAuth={() => {
                    loadPersistentAuth();
                    getCookies();
                }}
            />
        );
    }

    return (
        <MainLayout
            isConnected={isConnected}
            userInfo={userInfo}
            currentView={currentView}
            selectedClass={selectedClass || undefined}
            onSettingsClick={() => setCurrentView(currentView === 'auth' ? 'classes' : 'auth')}
            onBackClick={() => {
                if (currentView === 'activities') {
                    goBackToClasses();
                } else if (currentView === 'auth') {
                    setCurrentView('classes');
                }
            }}
        >
                {currentView === 'auth' ? (
                    <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-xl p-6 text-gray-900">
                        {/* Authentication Header */}
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25 transform rotate-12 mx-auto mb-4">
                                <Icon name="settings" size="lg" className="text-white transform -rotate-12" />
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
                            
                            <AuthStatus
                                isValid={userInfo?.isValid || false}
                                name={userInfo?.name}
                                role={userInfo?.role}
                                domain={userInfo?.domain}
                                cookieCount={cookies.length}
                                onLoginClick={goToLoginPage}
                            />
                        </div>

                        {/* Cookie Management */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900">Cookie Management</h3>
                                <span className="text-xs text-gray-500">{cookies.length} cookies</span>
                            </div>
                            
                            <div className="space-y-2">
                                <Button
                                    onClick={getCookies}
                                    disabled={isLoading}
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    <Icon name="cookie" size="sm" />
                                    Get Cookies
                                </Button>
                                
                                {userInfo?.isValid && (
                                    <Button
                                        onClick={clearAuthState}
                                        variant="danger"
                                        className="w-full"
                                    >
                                        <Icon name="trash" size="sm" />
                                        Clear Authentication
                                    </Button>
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
                        <ClassList
                            classes={apiClassCards.length > 0 ? apiClassCards : classCards}
                            isLoading={isLoadingClasses}
                            hasAccessToken={!!userInfo?.accessToken}
                            onRefresh={fetchClassCards}
                            onClassClick={handleClassClick}
                        />

                        {/* Fallback indicator */}
                        {apiClassCards.length === 0 && !isLoadingClasses && (
                            <div className="text-xs text-gray-500 text-center mt-2">Using sample data</div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Activities Header */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                {selectedClass?.subjectName} Activities
                            </h2>
                            <p className="text-sm text-gray-600">Click to open in LMS</p>
                        </div>

                        <ActivityList
                            activities={selectedClass ? activities[selectedClass.classCardId] || [] : []}
                            onActivityClick={handleActivityClick}
                        />
                    </>
                )}
        </MainLayout>
    );
}

export default App;