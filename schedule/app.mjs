import { schedules } from './data.mjs';
import { days, displayDate, displayTime, durationLabel, findConflicts, jakartaClock, jakartaWeek, liveSessions, minuteLabel, minutes, sessionsForDay, sharedBreaks } from './utils.mjs';

/** @param {string} id */
function required(id) {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Elemen jadwal tidak ditemukan: ${id}`);
    return node;
}

/** @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag @param {string} [className] @param {string} [text]
 */
function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
}

/** @param {string} name */
function icon(name) {
    const node = el('i');
    node.dataset.lucide = name;
    node.setAttribute('aria-hidden', 'true');
    return node;
}

function refreshIcons() {
    const host = /** @type {Window & {lucide?: {createIcons: () => void}}} */ (window);
    if (!host.lucide || !document.querySelector('i[data-lucide]')) return;
    host.lucide.createIcons();
    document.querySelectorAll('svg[data-lucide]').forEach(icon => icon.removeAttribute('data-lucide'));
}

let week = jakartaWeek();
const preferences = (() => {
    try {
        const saved = JSON.parse(window.localStorage.getItem('portfolio-schedule-view') || 'null');
        return {
            campus: typeof saved?.campus === 'string' && Object.hasOwn(schedules, saved.campus) ? saved.campus : 'itera',
            view: saved?.view === 'weekly' ? 'weekly' : 'daily',
        };
    } catch { return { campus: 'itera', view: 'daily' }; }
})();
const state = { ...preferences, day: week.today };
const savePreferences = () => {
    try { window.localStorage.setItem('portfolio-schedule-view', JSON.stringify({ campus: state.campus, view: state.view })); } catch { /* Optional preferences must not block the timetable. */ }
};
const content = required('scheduleContent');
const navigation = required('dayNavigation');
const notice = required('conflictNotice');
const dialog = /** @type {HTMLDialogElement} */ (required('sessionDialog'));
const details = required('sessionDetails');
/** @type {HTMLButtonElement | null} */
let sessionTrigger = null;

/** @param {import('./data.mjs').Session} session */
const courseTitle = session => session.courses.join(' + ');
/** @param {ReturnType<typeof findConflicts>[number]} pair */
const conflictText = pair => `${courseTitle(pair.a)} dan ${courseTitle(pair.b)} bertumpang tindih pada ${displayTime(pair.start)}-${displayTime(pair.end)} WIB (${pair.duration} menit).`;

function renderSharedTime() {
    const allSessions = Object.values(schedules).flatMap(schedule => schedule.sessions);
    const gaps = sharedBreaks(allSessions, state.day);
    const best = gaps.reduce((longest, gap) => !longest || gap.duration > longest.duration ? gap : longest, /** @type {typeof gaps[number] | null} */ (null));
    required('sharedDay').textContent = `${days[state.day - 1]}, ${displayDate(week.dates[state.day - 1])} · Anton & Aura`;
    const body = required('sharedContent');
    const highlight = el('div', 'shared-highlight');
    highlight.append(el('p', 'mono', best ? 'Jeda terpanjang' : 'Hari yang padat'));
    if (best) {
        highlight.append(el('p', 'shared-hours', `${minuteLabel(best.start)} - ${minuteLabel(best.end)}`), el('p', 'shared-duration', `${durationLabel(best.duration)} tanpa perkuliahan bersama`));
    } else {
        highlight.append(el('p', 'shared-no-gap', 'Belum ada jeda yang sama.'), el('p', 'shared-duration', 'Coba pilih hari lain untuk menemukan waktu bersama.'));
    }

    const timeline = el('div', 'shared-timeline');
    const scale = el('div', 'shared-scale');
    scale.setAttribute('aria-hidden', 'true');
    scale.append(...['07.00', '14.00', '21.00'].map(label => el('span', '', label)));
    timeline.append(scale);
    for (const [key, schedule] of Object.entries(schedules)) {
        const row = el('div', `shared-timeline-row shared-timeline-${key}`);
        const sessions = sessionsForDay(schedule.sessions, state.day);
        const track = el('div', 'shared-track');
        track.setAttribute('role', 'img');
        track.setAttribute('aria-label', `${schedule.owner}: ${sessions.length ? sessions.map(session => `${courseTitle(session)} ${displayTime(session.start)} sampai ${displayTime(session.end)}`).join(', ') : 'Tidak ada perkuliahan'}. Waktu dalam WIB.`);
        for (const session of sessions) {
            const start = Math.max(420, minutes(session.start));
            const end = Math.min(1260, minutes(session.end));
            if (end <= start) continue;
            const bar = el('span', 'shared-busy');
            bar.style.left = `${(start - 420) / 840 * 100}%`;
            bar.style.width = `${(end - start) / 840 * 100}%`;
            bar.title = `${courseTitle(session)} · ${displayTime(session.start)}-${displayTime(session.end)} WIB`;
            bar.setAttribute('aria-hidden', 'true');
            track.append(bar);
        }
        row.append(el('span', 'shared-person-label', schedule.shortName), track);
        timeline.append(row);
    }
    const legend = el('p', 'shared-legend', 'Blok berwarna menandai waktu kuliah.');
    timeline.append(legend);
    const options = el('div', 'shared-options');
    options.setAttribute('aria-label', 'Semua jeda tanpa perkuliahan');
    for (const gap of gaps) {
        const option = el('span', 'session-tag', `${minuteLabel(gap.start)}-${minuteLabel(gap.end)}`);
        if (gap === best) option.classList.add('shared-best');
        options.append(option);
    }
    body.replaceChildren(highlight, timeline, options);
    required('sharedWeek').replaceChildren(...days.map((name, index) => {
        const breaks = sharedBreaks(allSessions, index + 1);
        const longest = breaks.reduce((best, gap) => !best || gap.duration > best.duration ? gap : best, /** @type {typeof breaks[number] | null} */ (null));
        const button = el('button', 'shared-week-day');
        button.type = 'button';
        button.id = `shared-week-day-${index + 1}`;
        button.setAttribute('aria-pressed', String(index + 1 === state.day));
        button.append(el('span', '', name), el('span', '', longest ? `${minuteLabel(longest.start)}-${minuteLabel(longest.end)}` : 'Belum ada jeda'), el('small', '', longest ? durationLabel(longest.duration) : 'Pilih hari lain'));
        button.addEventListener('click', () => selectDay(index + 1, false));
        return button;
    }));
}

/** @param {import('./data.mjs').Session} session @param {boolean} conflict */
function sessionCard(session, conflict) {
    const showClass = !schedules[state.campus].className;
    const card = el('button', 'session-card');
    card.type = 'button';
    card.dataset.session = session.id;
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `${displayTime(session.start)} sampai ${displayTime(session.end)} WIB, ${courseTitle(session)}, ${session.type}${showClass ? `, kelas ${session.className}` : ''}, ${session.room || 'ruangan belum tersedia'}${conflict ? ', benturan jadwal' : ''}. Lihat detail.`);

    const time = el('span', 'session-time');
    const start = el('time', '', displayTime(session.start));
    start.dateTime = session.start;
    const end = el('time', '', displayTime(session.end));
    end.dateTime = session.end;
    const endLabel = el('span');
    endLabel.append(el('span', 'schedule-sr-only', 'sampai '), end);
    time.append(start, endLabel);

    const copy = el('span', 'session-copy');
    const meta = el('span', 'session-meta');
    const room = el('span', 'session-room');
    room.append(icon('map-pin'), document.createTextNode(session.room || 'Ruangan belum tersedia'));
    meta.append(room);
    if (showClass) meta.append(el('span', '', `Kelas ${session.className}`));
    const tags = el('span', 'session-tags');
    tags.append(el('span', `session-tag${session.type === 'Praktikum' ? ' session-tag-practical' : ''}`, session.type));
    if (session.courses.length > 1) tags.append(el('span', 'session-tag', 'Sesi gabungan'));
    if (conflict) tags.append(el('span', 'session-tag session-tag-conflict', 'Benturan jadwal'));
    const live = el('span', 'session-tag session-live-status');
    live.hidden = true;
    tags.append(live);
    copy.append(el('span', 'session-title', courseTitle(session)), meta, tags);
    const arrow = icon('arrow-up-right');
    arrow.className = 'session-arrow';
    card.append(time, copy, arrow);
    card.addEventListener('click', () => openSession(session, card));
    return card;
}

/** @param {number} day @param {Set<string>} conflicting */
function daySection(day, conflicting) {
    const sessions = sessionsForDay(schedules[state.campus].sessions, day);
    const section = el('section');
    section.id = `schedule-day-${day}`;
    section.setAttribute('aria-labelledby', `day-title-${day}`);
    if (day === week.today) section.dataset.today = '';
    const header = el('div', 'schedule-day-header');
    const title = el('h3', '', days[day - 1]);
    title.id = `day-title-${day}`;
    if (day === week.today) title.append(el('span', 'schedule-today', 'Hari ini'));
    header.append(title, el('span', '', `${displayDate(week.dates[day - 1], { day: 'numeric', month: 'short' })} · ${sessions.length} sesi`));
    section.append(header);
    if (sessions.length) {
        const list = el('div', 'schedule-sessions');
        list.append(...sessions.map(session => sessionCard(session, conflicting.has(session.id))));
        section.append(list);
    } else {
        const empty = el('div', 'schedule-empty');
        empty.append(icon('calendar-check-2'), el('h4', '', 'Tidak ada perkuliahan'), el('p', '', `Tidak ada sesi terjadwal pada hari ${days[day - 1]}.`));
        section.append(empty);
    }
    return section;
}

function render() {
    const activeId = document.activeElement?.id;
    const schedule = schedules[state.campus];
    const pairs = findConflicts(schedule.sessions);
    const conflicting = new Set(pairs.flatMap(pair => [pair.a.id, pair.b.id]));
    document.querySelectorAll('[data-campus]').forEach(button => {
        button.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (button).dataset.campus === state.campus));
    });
    document.querySelectorAll('[data-view]').forEach(button => {
        button.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (button).dataset.view === state.view));
    });
    required('scheduleTitle').replaceChildren(document.createTextNode(schedule.owner), el('span', '', `${schedule.name} · ${schedule.program}`));
    const activeDays = new Set(schedule.sessions.map(session => session.day)).size;
    required('scheduleSummary').textContent = `${schedule.sessions.length} sesi per minggu · ${activeDays} hari perkuliahan${schedule.semester ? ` · Semester ${schedule.semester}` : ''}`;
    required('weekLabel').textContent = `${displayDate(week.dates[0], { day: 'numeric', month: 'short', year: 'numeric' })} - ${displayDate(week.dates[6], { day: 'numeric', month: 'short', year: 'numeric' })}`;

    navigation.replaceChildren(...days.map((name, index) => {
        const day = index + 1;
        const count = sessionsForDay(schedule.sessions, day).length;
        const button = el('button', 'schedule-day');
        button.type = 'button';
        button.id = `day-button-${day}`;
        button.dataset.day = String(day);
        button.setAttribute('aria-pressed', String(day === state.day));
        button.setAttribute('aria-controls', state.view === 'weekly' || day === state.day ? `schedule-day-${day}` : 'scheduleContent');
        button.setAttribute('aria-label', `${name}, ${displayDate(week.dates[index])}, ${count} sesi${day === week.today ? ', hari ini' : ''}`);
        if (day === week.today) button.setAttribute('aria-current', 'date');
        button.append(el('span', 'schedule-day-name', name), el('span', 'schedule-day-date', String(week.dates[index].getUTCDate()).padStart(2, '0')), el('span', 'schedule-day-info', day === week.today ? 'Hari ini' : `${count} sesi`));
        button.addEventListener('click', () => selectDay(day));
        return button;
    }));

    const visiblePairs = state.view === 'weekly' ? pairs : pairs.filter(pair => pair.a.day === state.day);
    notice.hidden = visiblePairs.length === 0;
    notice.replaceChildren();
    if (visiblePairs.length) {
        const copy = el('div');
        copy.append(el('strong', '', 'Ada benturan jadwal'));
        visiblePairs.forEach(pair => copy.append(el('p', '', `${days[pair.a.day - 1]}: ${conflictText(pair)}`)));
        notice.append(icon('triangle-alert'), copy);
    }

    content.className = `schedule-content${state.view === 'weekly' ? ' schedule-weekly' : ''}`;
    const visibleDays = state.view === 'weekly' ? [1, 2, 3, 4, 5, 6, 7] : [state.day];
    content.replaceChildren(...visibleDays.map(day => daySection(day, conflicting)));
    renderSharedTime();
    updateLiveStatus();
    const count = state.view === 'weekly' ? schedule.sessions.length : sessionsForDay(schedule.sessions, state.day).length;
    required('scheduleAnnouncement').textContent = `${schedule.owner}, ${schedule.name}, ${state.view === 'weekly' ? 'jadwal mingguan' : days[state.day - 1]}, ${count} sesi${visiblePairs.length ? `, ${visiblePairs.length} benturan jadwal` : ''}. Waktu bersama diperbarui untuk ${days[state.day - 1]}.`;
    refreshIcons();
    document.dispatchEvent(new CustomEvent('portfolio:render', { detail: { root: content } }));
    if (activeId) document.getElementById(activeId)?.focus({ preventScroll: true });
}

/** @param {number} day @param {boolean} [scrollToDay] */
function selectDay(day, scrollToDay = true) {
    if (state.day !== day) {
        state.day = day;
        render();
    }
    if (state.view === 'weekly' && scrollToDay) {
        document.getElementById(`schedule-day-${day}`)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
}

/** @param {import('./data.mjs').Session} session @param {HTMLButtonElement} trigger */
function openSession(session, trigger) {
    sessionTrigger = trigger;
    const schedule = schedules[state.campus];
    const title = el('h2', '', courseTitle(session));
    title.id = 'sessionTitle';
    const grid = el('dl', 'schedule-detail-grid');
    const fields = [
        ['Hari', days[session.day - 1]],
        ['Waktu', `${displayTime(session.start)}-${displayTime(session.end)} WIB`],
        ['Ruangan', session.room || 'Belum tersedia'],
        ...(!schedule.className ? [['Kelas', session.className]] : []),
        ['Jenis perkuliahan', session.type],
        ['Program studi', schedule.program],
    ];
    fields.forEach(([label, value]) => {
        const field = el('div');
        field.append(el('dt', '', label), el('dd', '', value));
        grid.append(field);
    });
    const lecturers = el('div', 'schedule-detail-lecturers');
    const lecturerValue = el('dd');
    if (session.lecturers.length) {
        const list = el('ul');
        list.append(...session.lecturers.map(name => el('li', '', name)));
        lecturerValue.append(list);
    } else lecturerValue.textContent = 'Belum tersedia';
    lecturers.append(el('dt', '', 'Dosen'), lecturerValue);
    grid.append(lecturers);
    details.replaceChildren(el('p', 'section-label', `${schedule.name}${session.courses.length > 1 ? ' · Sesi gabungan' : ''}`), title, grid);

    const pairs = findConflicts(schedule.sessions).filter(pair => pair.a.id === session.id || pair.b.id === session.id);
    if (pairs.length) {
        const warning = el('div', 'schedule-conflicts');
        const copy = el('div');
        copy.append(el('strong', '', 'Benturan jadwal'));
        pairs.forEach(pair => copy.append(el('p', '', conflictText(pair))));
        warning.append(icon('triangle-alert'), copy);
        details.append(warning);
    }
    refreshIcons();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    details.scrollTop = 0;
    required('sessionClose').focus();
}

document.querySelectorAll('button[data-campus]').forEach(button => {
    button.addEventListener('click', () => {
        const campus = /** @type {HTMLButtonElement} */ (button).dataset.campus || 'itera';
        if (state.campus === campus) return;
        state.campus = campus;
        savePreferences();
        render();
    });
});
document.querySelectorAll('button[data-view]').forEach(button => {
    button.addEventListener('click', () => {
        const view = /** @type {HTMLButtonElement} */ (button).dataset.view || 'daily';
        if (state.view === view) return;
        state.view = view;
        savePreferences();
        render();
    });
});
navigation.addEventListener('keydown', event => {
    if (!(event.target instanceof HTMLButtonElement)) return;
    let day = Number(event.target.dataset.day);
    if (event.key === 'ArrowRight') day = day % 7 + 1;
    else if (event.key === 'ArrowLeft') day = (day + 5) % 7 + 1;
    else if (event.key === 'Home') day = 1;
    else if (event.key === 'End') day = 7;
    else return;
    event.preventDefault();
    selectDay(day);
    document.getElementById(`day-button-${day}`)?.focus({ preventScroll: true });
});
required('todayButton').addEventListener('click', () => {
    refreshDate();
    selectDay(week.today);
});
required('sessionClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    const id = sessionTrigger?.dataset.session;
    const trigger = sessionTrigger?.isConnected ? sessionTrigger : content.querySelector(`button[data-session="${id}"]`);
    if (trigger instanceof HTMLButtonElement) trigger.focus({ preventScroll: true });
});

function updateLiveStatus() {
    const clock = jakartaClock();
    const current = liveSessions(schedules[state.campus].sessions, clock.today, clock.minute);
    const summary = required('scheduleNow');
    summary.hidden = state.view === 'daily' && state.day !== clock.today;
    const label = current.active.length
        ? `Sedang berlangsung: ${current.active.map(courseTitle).join(' + ')}`
        : current.next
            ? `Berikutnya ${displayTime(current.next.start)}: ${courseTitle(current.next)}`
            : current.hasSessions ? 'Semua sesi hari ini telah berakhir.' : 'Tidak ada perkuliahan hari ini.';
    summary.textContent = `${displayTime(clock.time)} WIB · ${label}`;
    const active = new Set(current.active.map(session => session.id));
    content.querySelectorAll('button[data-session]').forEach(card => {
        if (!(card instanceof HTMLButtonElement)) return;
        const id = card.dataset.session;
        const live = card.querySelector('.session-live-status');
        const ongoing = active.has(id || '');
        const next = current.next?.id === id;
        card.classList.toggle('is-ongoing', ongoing);
        if (live instanceof HTMLElement) {
            live.hidden = !ongoing && !next;
            live.textContent = ongoing ? 'Sedang berlangsung' : next && current.next ? `Mulai ${durationLabel(minutes(current.next.start) - clock.minute)} lagi` : '';
        }
    });
}

function refreshDate() {
    const next = jakartaWeek();
    if (next.key !== week.key) {
        if (state.day === week.today) state.day = next.today;
        week = next;
        render();
    } else updateLiveStatus();
}
/** @type {ReturnType<typeof setTimeout> | undefined} */
let clockTimer;
function stopClock() {
    clearTimeout(clockTimer);
    clockTimer = undefined;
}
function startClock() {
    stopClock();
    if (document.hidden) return;
    refreshDate();
    // Update only at minute boundaries; pause all clock work in background tabs.
    clockTimer = setTimeout(startClock, 60000 - Date.now() % 60000 + 50);
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopClock();
    else startClock();
});
window.addEventListener('pagehide', stopClock);
window.addEventListener('pageshow', startClock);
try {
    render();
    startClock();
} catch (error) {
    content.replaceChildren();
    required('scheduleError').hidden = false;
    console.error('Jadwal tidak dapat ditampilkan.', error);
}
