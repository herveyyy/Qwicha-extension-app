import React from 'react';
import { Icon } from '../atoms/Icon';

interface ClassCardProps {
    id?: string;
    classCardId: string;
    classRoomName: string;
    subjectCode: string;
    subjectName: string;
    color: string;
    onClick?: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
    id,
    classCardId,
    classRoomName,
    subjectCode,
    subjectName,
    color,
    onClick
}) => {


    return (
        <div
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center p-3">
                {/* Color Indicator */}
                <div 
                    className={`w-3 h-10 rounded-full bg-gradient-to-b mr-3`}
                    style={{
                        background: !color || color === ""
                            ? `linear-gradient(135deg, #f97316 0%, #ea580c 100%)`
                            : color.startsWith('#') 
                                ? `linear-gradient(135deg, ${color.slice(0, 7)} 0%, ${color.slice(0, 7)}dd 100%)`
                                : `linear-gradient(135deg, #f97316 0%, #ea580c 100%)`
                    }}
                ></div>
                
                {/* Class Info */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{subjectName}</h3>
                        {/* <span className="text-xs text-gray-500">{activityCount || 0} activities</span> */}
                    </div>
                    <p className="text-sm text-gray-600">{classRoomName}</p>
                    {/* {teacher && (
                        <p className="text-xs text-gray-500">Teacher: {teacher}</p>
                    )} */}
                </div>

                {/* Arrow */}
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Icon name="arrow-right" size="sm" className="text-gray-600" />
                </div>
            </div>
        </div>
    );
};
