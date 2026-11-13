/**
 * Jadwal berulang setiap minggu. Hari mengikuti ISO: Senin = 1, Minggu = 7.
 * Waktu memakai HH:mm dalam WIB. null berarti data belum tersedia.
 * Gabungkan mata kuliah dalam satu array courses jika berbagi sesi yang sama.
 * @typedef {{id: string, day: number, start: string, end: string, courses: string[], type: string, className: string, room: string | null, lecturers: string[]}} Session
 * @typedef {{name: string, program: string, semester?: string, className: string | null, sessions: Session[]}} Schedule
 */

/** @type {Record<string, Schedule>} */
export const schedules = {
    itera: {
        name: 'ITERA',
        program: 'Teknik Informatika',
        semester: 'Gasal 2026/2027',
        className: null,
        sessions: [
            { id: 'it-sen-1', day: 1, start: '07:30', end: '09:30', courses: ['Jaringan Komputer'], type: 'Praktikum', className: 'RH', room: 'Lab Jarkom & IoT, Labtek 3 Lt. 3', lecturers: ['Hartanto Tantriawan, S.Kom., M.Kom.'] },
            { id: 'it-sen-2', day: 1, start: '09:20', end: '12:00', courses: ['Probabilitas dan Statistika'], type: 'Kuliah', className: 'RD', room: 'GK2 124', lecturers: ['Imam Ekowicaksono, S.Si., M.Si.'] },
            { id: 'it-sen-3', day: 1, start: '13:00', end: '15:40', courses: ['Strategi Algoritma'], type: 'Kuliah', className: 'RD', room: 'GK2 104', lecturers: ['Radhinka Bagaskara, S.Si.Kom., M.Si., M.Sc.'] },
            { id: 'it-sel-1', day: 2, start: '07:00', end: '08:40', courses: ['Pola Hidup Sehat dan Kebugaran Fisik'], type: 'Kuliah', className: 'B05', room: null, lecturers: ['Burhaan Shodiq, M.Or.'] },
            { id: 'it-sel-2', day: 2, start: '13:00', end: '15:00', courses: ['Pemrograman Berorientasi Objek'], type: 'Praktikum', className: 'RD', room: 'Lab IF 1, Labtek 1', lecturers: [] },
            { id: 'it-rab-1', day: 3, start: '07:30', end: '10:10', courses: ['Basis Data'], type: 'Kuliah', className: 'RB', room: 'GK2 119', lecturers: ['Rajif Agung Yunmar, S.Kom., M.Cs.'] },
            { id: 'it-rab-2', day: 3, start: '11:10', end: '12:55', courses: ['Kewarganegaraan'], type: 'Kuliah', className: 'R13', room: 'GK2 411', lecturers: ['Nufikha Ulfah, M.Pd.'] },
            { id: 'it-rab-3', day: 3, start: '13:55', end: '15:40', courses: ['Jaringan Komputer'], type: 'Kuliah', className: 'RH', room: 'GK2 125', lecturers: ['Hartanto Tantriawan, S.Kom., M.Kom.'] },
            { id: 'it-kam-1', day: 4, start: '07:30', end: '09:15', courses: ['Pemrograman Berorientasi Objek'], type: 'Kuliah', className: 'RB', room: 'GK2 214', lecturers: ['Arkham Zahri Rakhman, S.Kom., M.Eng.'] },
            { id: 'it-kam-2', day: 4, start: '13:00', end: '15:40', courses: ['Dasar Rekayasa Perangkat Lunak'], type: 'Kuliah', className: 'RC', room: 'GK2 219', lecturers: ['Aidil Afriansyah, S.Kom., M.Kom.', 'Ir. Hira Laksmiwati Soemitro, M.Sc.'] },
            { id: 'it-jum-1', day: 5, start: '15:00', end: '17:00', courses: ['Basis Data'], type: 'Praktikum', className: 'RB', room: 'Lab IF 1, Labtek 1', lecturers: [] },
        ],
    },
    unila: {
        name: 'UNILA',
        program: 'PPKn',
        className: '26C',
        sessions: [
            { id: 'un-sen-1', day: 1, start: '09:30', end: '11:10', courses: ['Landasan Kependidikan'], type: 'Kuliah', className: '26C', room: 'D5', lecturers: ['Rohman, S.Pd., M.Pd.', 'Dr. Muhammad Kaulan Karima, M.Pd.'] },
            { id: 'un-sel-1', day: 2, start: '07:30', end: '09:10', courses: ['DKPM'], type: 'Kuliah', className: '26C', room: 'D4', lecturers: ['Rima Yuni Saputri, M.Pd.', 'Lisa Retno Sari, M.Pd.'] },
            { id: 'un-sel-2', day: 2, start: '09:30', end: '12:00', courses: ['IPS Terpadu'], type: 'Kuliah', className: '26C', room: 'Aula J', lecturers: ['Lisa Retno Sari, M.Pd.', 'Dr. Karyadi Hidayat, M.Pd.', 'Dr. Yunisca Nurmalisa, M.Pd.'] },
            { id: 'un-sel-3', day: 2, start: '13:00', end: '14:40', courses: ['Ilmu Kewarganegaraan'], type: 'Kuliah', className: '26C', room: 'D5', lecturers: ['Susilo, M.Pd.'] },
            { id: 'un-sel-4', day: 2, start: '15:10', end: '16:50', courses: ['Ilmu Negara', 'Pengantar Ilmu Politik'], type: 'Kuliah', className: '26C', room: 'Aula J', lecturers: ['Edi Siswanto, M.Pd.', 'Dr. Teki Prasetyo Sulaksono, M.Pd.'] },
            { id: 'un-jum-1', day: 5, start: '07:00', end: '09:10', courses: ['PIH dan PHI', 'Pancasila'], type: 'Kuliah', className: '26C', room: 'Aula J', lecturers: ['Abdul Halim, M.Pd.'] },
            { id: 'un-jum-2', day: 5, start: '09:30', end: '12:00', courses: ['Agama Islam'], type: 'Kuliah', className: '26C', room: 'Aula J', lecturers: ['Rima Yuni Saputri, M.Pd.', 'Joni Putra, M.Pd.I.'] },
        ],
    },
};
