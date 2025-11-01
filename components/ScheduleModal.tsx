import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Staff, StaffSchedule } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CheckIcon from './icons/CheckIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: Staff;
    onSave: (schedule: StaffSchedule) => void;
}

const CustomOffDayCheckbox: React.FC<{ day: string; checked: boolean; onChange: () => void }> = ({ day, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer capitalize">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-4 h-4 ${checked ? 'bg-red-500' : 'bg-gray-800'} rounded-sm flex items-center justify-center transition-colors`}>
            {checked && <CheckIcon className="w-3 h-3 text-black" />}
        </div>
        <span className={`transition-colors text-sm ${checked ? 'text-blue-800 font-bold' : 'text-gray-400'}`}>{day}</span>
    </label>
);

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, staff, onSave }) => {
    const [weeklyHours, setWeeklyHours] = useState<StaffSchedule['weeklyHours']>(staff.schedule.weeklyHours);
    const [leaves, setLeaves] = useState<Set<string>>(new Set(staff.schedule.leaves));
    const [holidays, setHolidays] = useState<Set<string>>(new Set(staff.schedule.holidays));
    const [weeklyOffDays, setWeeklyOffDays] = useState<Set<string>>(new Set(staff.schedule.weeklyOffDays));

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (staff.schedule) {
            setWeeklyHours(staff.schedule.weeklyHours);
            setLeaves(new Set(staff.schedule.leaves));
            setHolidays(new Set(staff.schedule.holidays));
            setWeeklyOffDays(new Set(staff.schedule.weeklyOffDays));
        }
    }, [staff]);

    const conflicts = useMemo(() => {
        const detectedConflicts: { date: string; type: string }[] = [];
        const allAbsences = [...leaves, ...holidays];

        for (const dateString of allAbsences) {
            const date = new Date(dateString);
            const localDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
            const dayIndex = localDate.getDay(); 
            const dayName = WEEK_DAYS[(dayIndex + 6) % 7]; 

            if (weeklyHours[dayName as keyof typeof weeklyHours].isWorkingDay) {
                const type = leaves.has(dateString) ? 'Leave' : 'Holiday';
                detectedConflicts.push({
                    date: dateString,
                    type: `${type} on a working day`,
                });
            }
        }
        return detectedConflicts;
    }, [leaves, holidays, weeklyHours]);

    const conflictingDateStrings = useMemo(() => new Set(conflicts.map(c => c.date)), [conflicts]);
    const conflictingWeekdays = useMemo(() => {
        const weekdays = new Set<string>();
        for (const dateString of conflictingDateStrings) {
             const date = new Date(dateString);
             const localDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
             const dayIndex = localDate.getDay();
             const dayName = WEEK_DAYS[(dayIndex + 6) % 7];
             weekdays.add(dayName);
        }
        return weekdays;
    }, [conflictingDateStrings]);

    const handleTimeChange = (day: string, field: 'from' | 'to', value: string) => {
        setWeeklyHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], [field]: value } }));
    };

    const handleWorkingDayToggle = (day: string, isWorking: boolean) => {
        setWeeklyHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], isWorkingDay: isWorking } }));
    };

    const handleWeeklyOffDayToggle = (day: string) => {
        setWeeklyOffDays(prev => {
            const newOffDays = new Set(prev);
            if (newOffDays.has(day)) {
                newOffDays.delete(day);
            } else {
                newOffDays.add(day);
                handleWorkingDayToggle(day, false);
            }
            return newOffDays;
        });
    };

    const handleDateClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const dayIndex = date.getDay();
        const dayName = WEEK_DAYS[(dayIndex + 6) % 7];
        if (weeklyOffDays.has(dayName)) return;

        setLeaves(prev => {
            const newLeaves = new Set(prev);
            if (newLeaves.has(dateString)) {
                newLeaves.delete(dateString);
            } else {
                newLeaves.add(dateString);
                setHolidays(h => {
                    const newHolidays = new Set(h);
                    newHolidays.delete(dateString);
                    return newHolidays;
                });
            }
            return newLeaves;
        });
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        let dayCounter = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(new Date(year, month, dayCounter));
                    dayCounter++;
                }
            }
            grid.push(week);
            if(dayCounter > daysInMonth) break;
        }
        return grid;
    }, [currentDate]);

    const handleSave = () => {
        const schedule: StaffSchedule = {
            weeklyHours,
            leaves: Array.from(leaves),
            holidays: Array.from(holidays),
            weeklyOffDays: Array.from(weeklyOffDays),
        };
        onSave(schedule);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Set Schedule for ${staff.name}`} size="4xl">
            {conflicts.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg mb-6" role="alert">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-6 h-6 mr-3" />
                        <div>
                            <p className="font-bold">Scheduling Conflict Detected</p>
                            <ul className="list-disc list-inside text-sm">
                                {conflicts.slice(0, 3).map((conflict, index) => (
                                    <li key={index}>{conflict.type}: {new Date(conflict.date).toLocaleDateString('en-CA')}</li>
                                ))}
                                {conflicts.length > 3 && <li>And {conflicts.length - 3} more...</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Working Hours</h3>
                    <div className="space-y-3">
                        {WEEK_DAYS.map(day => {
                            const daySchedule = weeklyHours[day as keyof typeof weeklyHours];
                            const isWeeklyOff = weeklyOffDays.has(day);
                            const hasConflict = conflictingWeekdays.has(day);
                            return (
                                <div key={day} className={`grid grid-cols-12 items-center gap-3 transition-all duration-300 ${isWeeklyOff ? 'opacity-50' : ''} ${hasConflict ? 'bg-yellow-50 rounded-lg p-2 -m-2' : ''}`}>
                                    <label className={`col-span-4 flex items-center ${isWeeklyOff ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            checked={daySchedule.isWorkingDay}
                                            onChange={(e) => handleWorkingDayToggle(day, e.target.checked)}
                                            className="sr-only"
                                            disabled={isWeeklyOff}
                                        />
                                        <div className={`w-4 h-4 ${daySchedule.isWorkingDay ? 'bg-lavender-purple' : 'bg-gray-800'} rounded-sm flex items-center justify-center transition-colors`}>
                                            {daySchedule.isWorkingDay && <CheckIcon className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`ml-3 capitalize transition-colors ${daySchedule.isWorkingDay ? 'text-blue-800 font-bold' : 'text-gray-400'}`}>{day}</span>
                                        {hasConflict && <ExclamationTriangleIcon className="w-4 h-4 ml-2 text-yellow-500" titleAccess="This day has a scheduling conflict" />}
                                    </label>
                                    <div className="col-span-8 flex items-center gap-2">
                                        <input type="time" value={daySchedule.from} onChange={e => handleTimeChange(day, 'from', e.target.value)} disabled={!daySchedule.isWorkingDay || isWeeklyOff} className="w-full p-2 border-none rounded-md text-center bg-gray-200 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400" />
                                        <input type="time" value={daySchedule.to} onChange={e => handleTimeChange(day, 'to', e.target.value)} disabled={!daySchedule.isWorkingDay || isWeeklyOff} className="w-full p-2 border-none rounded-md text-center bg-gray-200 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Absences & Holidays</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200/80">
                        <div className="flex justify-between items-center mb-2">
                            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <h4 className="font-semibold text-gray-700">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold">
                            {DAY_NAMES.map(d => <div key={d} className="py-2">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {calendarGrid.flat().map((date, idx) => {
                                if (!date) return <div key={idx}></div>;
                                
                                const dateString = date.toISOString().split('T')[0];
                                const dayIndex = date.getDay();
                                const dayName = WEEK_DAYS[(dayIndex + 6) % 7];

                                const isLeave = leaves.has(dateString);
                                const isHoliday = holidays.has(dateString);
                                const isWeeklyOff = weeklyOffDays.has(dayName);
                                const isConflict = conflictingDateStrings.has(dateString);
                                
                                let cellClass = 'w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors';

                                if (isConflict) {
                                    cellClass += ' ring-2 ring-yellow-500';
                                }
                                if (isLeave) {
                                    cellClass += ' font-bold bg-yellow-300 text-yellow-800 cursor-pointer hover:bg-yellow-400';
                                } else if (isHoliday) {
                                    cellClass += ' font-bold bg-pink-300 text-pink-800 cursor-pointer hover:bg-pink-400';
                                } else if (isWeeklyOff) {
                                    cellClass += ' text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-300';
                                } else {
                                    cellClass += ' bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200';
                                }
                                
                                return (
                                    <div key={idx} className="p-1 flex justify-center items-center">
                                       <div className="relative group">
                                         <button type="button" onClick={() => handleDateClick(date)} className={cellClass} disabled={isWeeklyOff}>{date.getDate()}</button>
                                       </div>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-4 pl-1 text-blue-800">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-300 rounded-full"></span> Leave Day</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-pink-300 rounded-full"></span> Yearly Holiday</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-dashed border-gray-300 rounded-full"></span> Weekly Off</div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Set Weekly Off-Days</h4>
                        <div className="grid grid-cols-4 gap-2">
                             {WEEK_DAYS.map(day => (
                                <CustomOffDayCheckbox 
                                    key={day}
                                    day={day}
                                    checked={weeklyOffDays.has(day)}
                                    onChange={() => handleWeeklyOffDayToggle(day)}
                                />
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 mt-6">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                <button type="button" onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">Save Schedule</button>
            </div>
        </Modal>
    );
};

export default ScheduleModal;