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

function App() {
    const [tabInfo, setTabInfo] = useState<TabInfo>({});
    const [isConnected, setIsConnected] = useState(false);
    const [currentView, setCurrentView] = useState<'classes' | 'activities'>('classes');
    const [selectedClass, setSelectedClass] = useState<ClassCard | null>(null);

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
    }, []);

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
                        </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
            </div>

            {/* Navigation */}
            {currentView === 'activities' && selectedClass && (
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2">
                    <button
                        onClick={goBackToClasses}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {currentView === 'classes' ? (
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