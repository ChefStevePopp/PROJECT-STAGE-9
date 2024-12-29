import ICAL from 'ical.js';
import type { ShiftEvent } from '../types';

export async function fetchCalendarData(url: string): Promise<string> {
  try {
    // Direct fetch for 7shifts URLs since they support CORS
    const is7shiftsUrl = url.includes('7shifts.com');
    const fetchUrl = is7shiftsUrl ? url : `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    if (!data.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid calendar feed URL');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    throw new Error('Unable to access calendar feed. Please check the URL and try again.');
  }
}

export function parseICS(icsData: string): ShiftEvent[] {
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    return vevents.map(vevent => {
      const event = new ICAL.Event(vevent);
      const summary = event.summary || '';
      
      // 7shifts specific parsing - they use a consistent format:
      // "Employee Name (Role) @ Location"
      const match = summary.match(/^(.+?)\s*\((.+?)\)(?:\s*@\s*(.+))?$/);
      
      let employeeName = 'Staff Member';
      let role = 'Staff';
      let location = 'Main Kitchen';

      if (match) {
        [, employeeName, role, location = 'Main Kitchen'] = match;
      }

      return {
        id: event.uid || `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeName: employeeName.trim(),
        role: role.trim(),
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        notes: event.description || '',
        location: location.trim()
      };
    });
  } catch (error) {
    console.error('Error parsing calendar:', error);
    throw new Error('Failed to parse calendar data');
  }
}