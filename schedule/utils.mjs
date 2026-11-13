export const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/** @param {string} time */
export function minutes(time) {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
}

/** @param {string} time */
export function displayTime(time) {
    return time.replace(':', '.');
}

/** @param {Date} [now] */
export function jakartaWeek(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);
    /** @param {string} type */
    const part = type => Number(parts.find(item => item.type === type)?.value);
    const date = new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
    const today = date.getUTCDay() || 7;
    const dates = days.map((_, index) => {
        const day = new Date(date);
        day.setUTCDate(date.getUTCDate() - today + index + 1);
        return day;
    });
    return { today, dates, key: date.toISOString().slice(0, 10) };
}

/** @param {Date} date @param {Intl.DateTimeFormatOptions} [options] */
export function displayDate(date, options = { day: 'numeric', month: 'long' }) {
    return new Intl.DateTimeFormat('id-ID', { ...options, timeZone: 'UTC' }).format(date);
}

/** @param {import('./data.mjs').Session[]} sessions @param {number} day */
export function sessionsForDay(sessions, day) {
    return sessions.filter(session => session.day === day).sort((a, b) => minutes(a.start) - minutes(b.start));
}

/** Return unique pairs; touching boundaries and sessions on different days do not conflict.
 * @param {import('./data.mjs').Session[]} sessions
 */
export function findConflicts(sessions) {
    /** @type {{a: import('./data.mjs').Session, b: import('./data.mjs').Session, start: string, end: string, duration: number}[]} */
    const pairs = [];
    sessions.forEach((a, index) => {
        sessions.slice(index + 1).forEach(b => {
            if (a.day !== b.day) return;
            const start = a.start > b.start ? a.start : b.start;
            const end = a.end < b.end ? a.end : b.end;
            const duration = minutes(end) - minutes(start);
            if (duration > 0) pairs.push({ a, b, start, end, duration });
        });
    });
    return pairs;
}

/** Shared gaps in the union of both timetables. Merge overlapping sessions first.
 * Bounds describe a comparison window, not personal availability.
 * @param {import('./data.mjs').Session[]} sessions
 * @param {number} day
 * @param {{start?: number, end?: number, minimum?: number}} [options]
 */
export function sharedBreaks(sessions, day, { start = 420, end = 1260, minimum = 30 } = {}) {
    const busy = sessionsForDay(sessions, day)
        .map(session => ({ start: Math.max(start, minutes(session.start)), end: Math.min(end, minutes(session.end)) }))
        .filter(slot => slot.end > slot.start);
    /** @type {{start: number, end: number, duration: number}[]} */
    const gaps = [];
    let cursor = start;
    for (const slot of busy) {
        if (slot.start - cursor >= minimum) gaps.push({ start: cursor, end: slot.start, duration: slot.start - cursor });
        cursor = Math.max(cursor, slot.end);
    }
    if (end - cursor >= minimum) gaps.push({ start: cursor, end, duration: end - cursor });
    return gaps;
}

/** @param {number} value */
export function minuteLabel(value) {
    return `${String(Math.floor(value / 60)).padStart(2, '0')}.${String(value % 60).padStart(2, '0')}`;
}

/** @param {number} value */
export function durationLabel(value) {
    const hours = Math.floor(value / 60);
    const mins = value % 60;
    return [hours ? `${hours} jam` : '', mins ? `${mins} menit` : ''].filter(Boolean).join(' ') || '0 menit';
}
