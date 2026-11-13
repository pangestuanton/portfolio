import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { schedules } from '../schedule/data.mjs';
import { days, displayDate, displayTime, findConflicts, jakartaWeek, sessionsForDay } from '../schedule/utils.mjs';

test('data contains 11 ITERA sessions and 7 UNILA sessions with valid unique slots', () => {
    assert.equal(schedules.itera.sessions.length, 11);
    assert.equal(schedules.unila.sessions.length, 7);
    const ids = new Set();
    for (const schedule of Object.values(schedules)) {
        for (const session of schedule.sessions) {
            assert.ok(!ids.has(session.id));
            ids.add(session.id);
            assert.match(session.start, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
            assert.match(session.end, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
            assert.ok(session.start < session.end);
            assert.ok(session.day >= 1 && session.day <= 7);
            assert.ok(session.courses.length && session.courses.every(Boolean));
            assert.ok(session.type && session.className);
        }
    }
});

test('original Monday ITERA overlap is exactly ten minutes', () => {
    const pairs = findConflicts(schedules.itera.sessions);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].a.courses[0], 'Jaringan Komputer');
    assert.equal(pairs[0].b.courses[0], 'Probabilitas dan Statistika');
    assert.deepEqual([pairs[0].start, pairs[0].end, pairs[0].duration], ['09:20', '09:30', 10]);
    assert.equal(findConflicts(schedules.unila.sessions).length, 0);
});

test('conflicts handle containment and exclude touching boundaries and different days', () => {
    const base = schedules.itera.sessions[0];
    const sessions = [
        { ...base, id: 'a', start: '07:00', end: '10:00' },
        { ...base, id: 'b', start: '08:00', end: '09:00' },
        { ...base, id: 'c', start: '10:00', end: '11:00' },
        { ...base, id: 'd', day: 2, start: '08:00', end: '09:00' },
    ];
    const pairs = findConflicts(sessions);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].duration, 60);
});

test('Jakarta midnight switches day at 17:00 UTC across the week boundary', () => {
    const sunday = jakartaWeek(new Date('2026-11-15T16:59:59Z'));
    const monday = jakartaWeek(new Date('2026-11-15T17:00:00Z'));
    assert.equal(sunday.today, 7);
    assert.equal(sunday.key, '2026-11-15');
    assert.equal(monday.today, 1);
    assert.equal(monday.key, '2026-11-16');
    assert.equal(monday.dates[0].toISOString(), '2026-11-16T00:00:00.000Z');
    assert.equal(monday.dates[6].toISOString(), '2026-11-22T00:00:00.000Z');
});

test('week dates remain correct across a year boundary independently of host timezone', () => {
    const week = jakartaWeek(new Date('2026-12-31T18:00:00Z'));
    assert.equal(week.key, '2027-01-01');
    assert.equal(week.today, 5);
    assert.equal(week.dates[0].toISOString().slice(0, 10), '2026-12-28');
    assert.equal(week.dates[6].toISOString().slice(0, 10), '2027-01-03');
    assert.equal(displayDate(week.dates[4]), '1 Januari');
    assert.equal(displayTime('07:30'), '07.30');
});

test('UNILA empty days and both campuses weekends return no sessions', () => {
    for (const day of [3, 4, 6, 7]) assert.deepEqual(sessionsForDay(schedules.unila.sessions, day), []);
    for (const day of [6, 7]) assert.deepEqual(sessionsForDay(schedules.itera.sessions, day), []);
    assert.equal(days.length, 7);
    assert.deepEqual(sessionsForDay([...schedules.unila.sessions].reverse(), 2).map(s => s.start), ['07:30', '09:30', '13:00', '15:10']);
});

test('combined courses share a single session and lecturer list; unknown source data stays absent', () => {
    const combined = schedules.unila.sessions.filter(session => session.courses.length > 1);
    assert.equal(combined.length, 2);
    assert.deepEqual(combined[0].courses, ['Ilmu Negara', 'Pengantar Ilmu Politik']);
    assert.deepEqual(combined[1].courses, ['PIH dan PHI', 'Pancasila']);
    assert.deepEqual(combined[1].lecturers, ['Abdul Halim, M.Pd.']);
    assert.deepEqual(schedules.itera.sessions.filter(session => session.lecturers.length === 0).map(session => session.id), ['it-sel-2', 'it-jum-1']);
    assert.equal(schedules.itera.semester, 'Gasal 2026/2027');
    assert.equal(schedules.itera.sessions.find(session => session.className === 'B05').room, null);
    assert.ok(schedules.unila.sessions.every(session => session.className === '26C'));
});

test('schedule stays hidden from portfolio and sitemap, with explicit direct Vercel routes', () => {
    const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(read('../index.html'), /href=["'][^"']*schedule/);
    assert.doesNotMatch(read('../sitemap.xml'), /\/schedule/);
    assert.match(read('../schedule/index.html'), /name="robots" content="noindex, nofollow"/);
    const config = JSON.parse(read('../vercel.json'));
    for (const path of ['/schedule', '/schedule/']) {
        assert.ok(config.rewrites.some(rule => rule.source === path && rule.destination === '/schedule/index.html'));
    }
});
