import type { EditionId, Subject } from '../types/study';

export const EDITION_6_SUBJECTS: Subject[] = [
  { id: 'anatomy', name: 'Anatomy', hours: 65.8, minutes: 3948 },
  { id: 'biochemistry', name: 'Biochemistry', hours: 47.3, minutes: 2838 },
  { id: 'physiology', name: 'Physiology', hours: 53.2, minutes: 3192 },
  { id: 'pharmacology', name: 'Pharmacology', hours: 59.2, minutes: 3552 },
  { id: 'microbiology', name: 'Microbiology', hours: 81.4, minutes: 4884 },
  { id: 'pathology', name: 'Pathology', hours: 69.7, minutes: 4182 },
  { id: 'psm', name: 'PSM', hours: 68.5, minutes: 4110 },
  { id: 'fmt', name: 'FMT', hours: 24.8, minutes: 1488 },
  { id: 'ophthalmology', name: 'Ophthalmology', hours: 41.1, minutes: 2466 },
  { id: 'ent', name: 'ENT', hours: 61.3, minutes: 3678 },
  { id: 'anaesthesia', name: 'Anaesthesia', hours: 29.0, minutes: 1740 },
  { id: 'dermatology', name: 'Dermatology', hours: 19.0, minutes: 1140 },
  { id: 'psychiatry', name: 'Psychiatry', hours: 20.9, minutes: 1254 },
  { id: 'radiology', name: 'Radiology', hours: 30.8, minutes: 1848 },
  { id: 'medicine', name: 'Medicine', hours: 161.1, minutes: 9666 },
  { id: 'surgery', name: 'Surgery', hours: 79.6, minutes: 4776 },
  { id: 'orthopaedics', name: 'Orthopaedics', hours: 27.6, minutes: 1656 },
  { id: 'obgyn', name: 'OBGYN', hours: 109.9, minutes: 6594 },
  { id: 'paediatrics', name: 'Paediatrics', hours: 42.5, minutes: 2550 },
];

export const EDITION_8_SUBJECTS: Subject[] = [
  { id: 'anatomy', name: 'Anatomy', hours: 47.8, minutes: 2868 },
  { id: 'biochemistry', name: 'Biochemistry', hours: 42.0, minutes: 2520 },
  { id: 'physiology', name: 'Physiology', hours: 52.4, minutes: 3144 },
  { id: 'pharmacology', name: 'Pharmacology', hours: 58.3, minutes: 3498 },
  { id: 'microbiology', name: 'Microbiology', hours: 62.3, minutes: 3738 },
  { id: 'pathology', name: 'Pathology', hours: 64.7, minutes: 3882 },
  { id: 'psm', name: 'PSM', hours: 60.7, minutes: 3642 },
  { id: 'fmt', name: 'FMT', hours: 33.8, minutes: 2028 },
  { id: 'ophthalmology', name: 'Ophthalmology', hours: 45.0, minutes: 2700 },
  { id: 'ent', name: 'ENT', hours: 48.9, minutes: 2934 },
  { id: 'anaesthesia', name: 'Anaesthesia', hours: 24.0, minutes: 1440 },
  { id: 'dermatology', name: 'Dermatology', hours: 14.1, minutes: 846 },
  { id: 'psychiatry', name: 'Psychiatry', hours: 16.6, minutes: 996 },
  { id: 'radiology', name: 'Radiology', hours: 29.0, minutes: 1740 },
  { id: 'medicine', name: 'Medicine', hours: 133.2, minutes: 7992 },
  { id: 'surgery', name: 'Surgery', hours: 68.4, minutes: 4104 },
  { id: 'orthopaedics', name: 'Orthopaedics', hours: 21.0, minutes: 1260 },
  { id: 'obgyn', name: 'OBGYN', hours: 97.7, minutes: 5862 },
  { id: 'paediatrics', name: 'Paediatrics', hours: 40.4, minutes: 2424 },
];

export const SUBJECTS_BY_EDITION: Record<EditionId, Subject[]> = {
  '6': EDITION_6_SUBJECTS,
  '8': EDITION_8_SUBJECTS,
};

export function getEditionTotals(edition: EditionId): { totalMinutes: number; totalHours: number } {
  const subjects = SUBJECTS_BY_EDITION[edition];
  const totalMinutes = subjects.reduce((sum, subject) => sum + subject.minutes, 0);
  const totalHours = Number((totalMinutes / 60).toFixed(1));
  return { totalMinutes, totalHours };
}
