import { schedules } from './data.mjs';
import { days, displayDate, displayTime, findConflicts, jakartaWeek, sessionsForDay } from './utils.mjs';

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
    host.lucide?.createIcons();
}

let week = jakartaWeek();
const state = { campus: 'itera', view: 'daily', day: week.today };
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

/** @param {import('./data.mjs').Session} session @param {boolean} conflict */
function sessionCard(session, conflict) {
    const card = el('button', 'session-card');
    card.type = 'button';
    card.dataset.session = session.id;
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `${displayTime(session.start)} sampai ${displayTime(session.end)} WIB, ${courseTitle(session)}, ${session.type}, kelas ${session.className}, ${session.room || 'ruangan belum tersedia'}${conflict ? ', benturan jadwal' : ''}. Lihat detail.`);

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
    meta.append(room, el('span', '', `Kelas ${session.className}`));
    const tags = el('span', 'session-tags');
    tags.append(el('span', `session-tag${session.type === 'Praktikum' ? ' session-tag-practical' : ''}`, session.type));
    if (session.courses.length > 1) tags.append(el('span', 'session-tag', 'Sesi gabungan'));
    if (conflict) tags.append(el('span', 'session-tag session-tag-conflict', 'Benturan jadwal'));
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
    required('scheduleTitle').replaceChildren(document.createTextNode(schedule.name), el('span', '', schedule.program));
    const activeDays = new Set(schedule.sessions.map(session => session.day)).size;
    required('scheduleSummary').textContent = `${schedule.sessions.length} sesi per minggu · ${activeDays} hari perkuliahan${schedule.className ? ` · Kelas ${schedule.className}` : ''}${schedule.semester ? ` · Semester ${schedule.semester}` : ''}`;
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
    const count = state.view === 'weekly' ? schedule.sessions.length : sessionsForDay(schedule.sessions, state.day).length;
    required('scheduleAnnouncement').textContent = `${schedule.name}, ${state.view === 'weekly' ? 'jadwal mingguan' : days[state.day - 1]}, ${count} sesi${visiblePairs.length ? `, ${visiblePairs.length} benturan jadwal` : ''}.`;
    refreshIcons();
    if (activeId) document.getElementById(activeId)?.focus({ preventScroll: true });
}

/** @param {number} day */
function selectDay(day) {
    state.day = day;
    render();
    if (state.view === 'weekly') {
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
        ['Kelas', session.className],
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
        state.campus = /** @type {HTMLButtonElement} */ (button).dataset.campus || 'itera';
        render();
    });
});
document.querySelectorAll('button[data-view]').forEach(button => {
    button.addEventListener('click', () => {
        state.view = /** @type {HTMLButtonElement} */ (button).dataset.view || 'daily';
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
    week = jakartaWeek();
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

function refreshDate() {
    const next = jakartaWeek();
    if (next.key === week.key) return;
    if (state.day === week.today) state.day = next.today;
    week = next;
    render();
}
setInterval(refreshDate, 30000);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDate();
});
render();
