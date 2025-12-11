'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { getCalendarEvents, CalendarEvent, HOLIDAY_CALENDAR_ID } from '@/api/calendarApi';

interface ExtendedCalendarEvent extends CalendarEvent {
    isHoliday?: boolean;
}

export function PerformanceCalendar({ mini = false, className = '', calendarId }: { mini?: boolean; className?: string; calendarId?: string }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ExtendedCalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, calendarId]);

    const fetchEvents = async () => {
        setLoading(true);
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const timeMin = start.toISOString();
        const timeMax = end.toISOString();

        try {
            const mainEvents = await getCalendarEvents(timeMin, timeMax, calendarId);
            let holidays: ExtendedCalendarEvent[] = [];

            if (!mini) {
                const holidayEvents = await getCalendarEvents(timeMin, timeMax, HOLIDAY_CALENDAR_ID);
                // Filter out observances that are not public holidays
                // Google Holiday Calendar usually marks public holidays with "Public holiday" or "공휴일" in description
                holidays = holidayEvents
                    .filter(event => event.description?.includes('공휴일') || event.description?.includes('Public holiday'))
                    .map(event => ({ ...event, isHoliday: true }));
            }

            setEvents([...mainEvents, ...holidays]);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // Generate days
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            if (event.start.date) {
                return isSameDay(parseISO(event.start.date), date);
            }
            if (event.start.dateTime) {
                return isSameDay(parseISO(event.start.dateTime), date);
            }
            return false;
        });
    };

    const onDateClick = (day: Date) => {
        setSelectedDate(day);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 relative ${mini ? '' : 'overflow-hidden'} ${className}`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-gray-100 bg-gray-50 ${mini ? 'p-3 rounded-t-xl' : 'p-4'}`}>
                <span className={`${mini ? 'text-base' : 'text-lg'} font-bold text-gray-800 flex items-center gap-2`}>
                    <CalendarIcon className={`${mini ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                    {format(currentDate, 'yyyy년 M월', { locale: ko })}
                </span>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="이전 달">
                        <ChevronLeft className={`${mini ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-full transition-colors" aria-label="다음 달">
                        <ChevronRight className={`${mini ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {dayNames.map((dayName, index) => (
                    <div key={dayName} className={`text-center font-medium ${mini ? 'py-2 text-xs' : 'py-3 text-sm'} ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 bg-white ${mini ? 'rounded-b-xl' : ''}`}>
                {calendarDays.map((dayItem, index) => {
                    const dayEvents = getEventsForDay(dayItem);
                    const isCurrentMonth = isSameMonth(dayItem, monthStart);
                    const isSelected = selectedDate && isSameDay(dayItem, selectedDate);
                    const isToday = isSameDay(dayItem, new Date());

                    // Check if today is a holiday
                    const holiday = dayEvents.find(e => e.isHoliday);
                    const isSunday = dayItem.getDay() === 0;
                    const isRedDay = isSunday || !!holiday;
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <div
                            key={dayItem.toString()}
                            className={`border-b border-r border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative
                                ${mini ? 'min-h-[60px] p-1' : 'min-h-[100px] p-2'}
                                ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : 'text-gray-700'}
                                ${isSelected && !mini ? 'bg-primary/5 ring-1 ring-primary inset-0' : ''}
                                ${mini && hasEvents ? 'bg-red-50/30' : ''}
                            `}
                            onClick={() => onDateClick(dayItem)}
                        >
                            <div className={`flex justify-between items-start ${mini && hasEvents ? 'h-full items-center' : ''}`}>
                                <span className={`font-medium flex items-center justify-center rounded-full transition-all
                                    ${mini ? 'text-xs w-5 h-5' : 'text-sm w-6 h-6'}
                                    ${isToday ? 'bg-primary text-white' : isRedDay && isCurrentMonth ? 'text-red-500' : ''}
                                    ${mini && hasEvents && !isToday ? 'bg-red-600 text-white font-extrabold text-sm w-7 h-7 ring-4 ring-red-100 shadow-md scale-110 z-10' : ''}
                                `}>
                                    {format(dayItem, dateFormat)}
                                </span>
                            </div>
                            <div className={`mt-1 ${mini ? 'flex flex-wrap gap-0.5 justify-center' : 'space-y-1'}`}>
                                {dayEvents.map((event) => (
                                    mini ? (
                                        // Hide dot if emphasized
                                        !hasEvents && (
                                            <div
                                                key={event.id}
                                                className={`w-1.5 h-1.5 rounded-full ${event.isHoliday ? 'bg-red-400' : 'bg-primary'}`}
                                                title={event.summary}
                                            />
                                        )
                                    ) : (
                                        <div
                                            key={event.id}
                                            className={`rounded truncate font-medium
                                                ${event.isHoliday
                                                    ? 'text-xs px-1.5 py-0.5 bg-red-50 text-red-600'
                                                    : 'text-sm px-2 py-1 bg-primary text-white shadow-sm mb-1'
                                                }
                                            `}
                                        >
                                            {event.summary}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Date Details (Full Mode) */}
            {!mini && selectedDate && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {format(selectedDate, 'M월 d일 EEEE', { locale: ko })} 일정
                    </h3>
                    {getEventsForDay(selectedDate).length > 0 ? (
                        <div className="space-y-3">
                            {getEventsForDay(selectedDate).map(event => (
                                <div key={event.id} className={`bg-white p-4 rounded-lg border shadow-sm ${event.isHoliday ? 'border-red-100 bg-red-50/30' : 'border-gray-200'}`}>
                                    <h4 className={`font-bold text-lg mb-2 ${event.isHoliday ? 'text-red-600' : 'text-gray-800'}`}>{event.summary}</h4>
                                    {event.start.dateTime && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {format(parseISO(event.start.dateTime), 'a h:mm', { locale: ko })} ~
                                                {event.end.dateTime ? format(parseISO(event.end.dateTime), 'a h:mm', { locale: ko }) : ''}
                                            </span>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                    {event.description && (
                                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{event.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">등록된 일정이 없습니다.</p>
                    )}
                </div>
            )}

            {/* Mini Mode Modal */}
            {mini && selectedDate && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 rounded-xl">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
                            </h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedDate(null); }}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="닫기"
                            >
                                <ChevronLeft className="w-5 h-5 rotate-180 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-3 max-h-[250px] overflow-y-auto">
                            {getEventsForDay(selectedDate).length > 0 ? (
                                <div className="space-y-2">
                                    {getEventsForDay(selectedDate).map(event => (
                                        <div key={event.id} className="bg-red-50 p-3 rounded-lg border border-red-100">
                                            <h4 className="font-bold text-gray-800 mb-1 text-sm">{event.summary}</h4>
                                            {event.start.dateTime && (
                                                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(parseISO(event.start.dateTime), 'a h:mm', { locale: ko })}
                                                </div>
                                            )}
                                            {event.location && (
                                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">등록된 일정이 없습니다.</p>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedDate(null)}></div>
                </div>
            )}
        </div>
    );
}
