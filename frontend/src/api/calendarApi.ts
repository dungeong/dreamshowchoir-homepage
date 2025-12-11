import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
const CALENDAR_ID = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;
export const PRACTICE_CALENDAR_ID = process.env.NEXT_PUBLIC_GOOGLE_PRACTICE_CALENDAR_ID || '';
const BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    start: {
        dateTime?: string;
        date?: string; // For all-day events
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    htmlLink: string;
}

export interface CalendarResponse {
    items: CalendarEvent[];
}

export const HOLIDAY_CALENDAR_ID = 'ko.south_korea#holiday@group.v.calendar.google.com';

export const getCalendarEvents = async (timeMin: string, timeMax: string, calendarId: string = CALENDAR_ID || ''): Promise<CalendarEvent[]> => {
    if (!API_KEY || !calendarId) {
        console.warn('Google Calendar API Key or Calendar ID is missing.');
        return [];
    }

    try {
        const response = await axios.get<CalendarResponse>(`${BASE_URL}/${encodeURIComponent(calendarId)}/events`, {
            params: {
                key: API_KEY,
                timeMin: timeMin,
                timeMax: timeMax,
                singleEvents: true,
                orderBy: 'startTime',
            },
        });
        return response.data.items || [];
    } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.error(`Failed to fetch calendar events for ${calendarId}: ${errorMessage}`);
        return [];
    }
};
