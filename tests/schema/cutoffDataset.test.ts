import { describe, it, expect } from 'vitest';
import cutoffData from '../../src/data/cutoffs/2026_2027.json' with { type: 'json' };
import { CutoffDataset, DepartmentCutoffRecord } from '../../src/core/types.js';

describe('Departmental Cut-Off Dataset (2026/2027 Official)', () => {
  const data = cutoffData as unknown as CutoffDataset;

  it('contains valid dataset metadata and official source citation', () => {
    expect(data.session).toBe('2026/2027');
    expect(data.source.title).toBe('UNILAG Releases 2026/2027 UTME Merit Cut-Off Marks');
    expect(data.source.url).toBe('https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/');
    expect(data.source.publishedDate).toBe('2026-09-16');
    expect(data.source.verificationStatus).toBe('CONFIRMED');
    expect(data.disclaimer).toBeDefined();
    expect(data.disclaimer).toContain('does not guarantee admission');
  });

  it('contains exactly 112 published programmes across UNILAG faculties', () => {
    expect(data.records).toHaveLength(112);
    expect(data.totalProgrammes).toBe(112);
  });

  it('validates every departmental record conforms strictly to the schema', () => {
    const catchmentKeys = ['ekiti', 'lagos', 'ogun', 'ondo', 'osun', 'oyo'] as const;

    data.records.forEach((record: DepartmentCutoffRecord, index: number) => {
      // Faculty validation
      expect(typeof record.faculty).toBe('string');
      expect(record.faculty.startsWith('FACULTY OF')).toBe(true);

      // Programme validation
      expect(typeof record.programme).toBe('string');
      expect(record.programme.trim().length).toBeGreaterThan(0);

      // Merit validation (number 0..100 or null for NIL)
      if (record.merit !== null) {
        expect(typeof record.merit).toBe('number');
        expect(Number.isFinite(record.merit)).toBe(true);
        expect(record.merit).toBeGreaterThanOrEqual(0);
        expect(record.merit).toBeLessThanOrEqual(100);
      }

      // Catchment states validation
      expect(record.catchment).toBeDefined();
      catchmentKeys.forEach(state => {
        const val = record.catchment[state];
        if (val !== null) {
          expect(typeof val).toBe('number');
          expect(Number.isFinite(val)).toBe(true);
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('Known Benchmark Programme Validations against Official Sept 16, 2026 Notice', () => {
    function findProgramme(name: string) {
      return data.records.find(r => r.programme.toUpperCase() === name.toUpperCase());
    }

    it('validates Medicine & Surgery (Clinical Sciences)', () => {
      const med = findProgramme('MEDICINE & SURGERY');
      expect(med).toBeDefined();
      expect(med?.faculty).toBe('FACULTY OF CLINICAL SCIENCES');
      expect(med?.merit).toBe(83.425);
      expect(med?.catchment.ekiti).toBe(79.425);
      expect(med?.catchment.lagos).toBe(79.1);
      expect(med?.catchment.ogun).toBe(81.75);
      expect(med?.catchment.ondo).toBe(81.35);
      expect(med?.catchment.osun).toBe(79.825);
      expect(med?.catchment.oyo).toBe(80.05);
    });

    it('validates Computer Science (Computing & Informatics)', () => {
      const cs = findProgramme('COMPUTER SCIENCE');
      expect(cs).toBeDefined();
      expect(cs?.faculty).toBe('FACULTY OF COMPUTING & INFORMATICS');
      expect(cs?.merit).toBe(82.05);
      expect(cs?.catchment.ekiti).toBe(78.4);
      expect(cs?.catchment.lagos).toBe(73.225);
      expect(cs?.catchment.ogun).toBe(79.175);
      expect(cs?.catchment.ondo).toBe(79.675);
      expect(cs?.catchment.osun).toBe(78.85);
      expect(cs?.catchment.oyo).toBe(79.875);
    });

    it('validates Law (Faculty of Law)', () => {
      const law = findProgramme('LAW');
      expect(law).toBeDefined();
      expect(law?.faculty).toBe('FACULTY OF LAW');
      expect(law?.merit).toBe(79.125);
      expect(law?.catchment.ekiti).toBe(75.975);
      expect(law?.catchment.lagos).toBe(75.15);
      expect(law?.catchment.ogun).toBe(77.275);
      expect(law?.catchment.ondo).toBe(75.55);
      expect(law?.catchment.osun).toBe(75.25);
      expect(law?.catchment.oyo).toBe(76.35);
    });

    it('validates Pharmacy (Faculty of Pharmacy)', () => {
      const pharm = findProgramme('PHARMACY');
      expect(pharm).toBeDefined();
      expect(pharm?.faculty).toBe('FACULTY OF PHARMACY');
      expect(pharm?.merit).toBe(78.325);
      expect(pharm?.catchment.ekiti).toBe(72.875);
      expect(pharm?.catchment.lagos).toBe(72.175);
      expect(pharm?.catchment.ogun).toBe(76.3);
      expect(pharm?.catchment.ondo).toBe(75.275);
      expect(pharm?.catchment.osun).toBe(75.85);
      expect(pharm?.catchment.oyo).toBe(74.1);
    });

    it('validates Landscape Architecture preserves NIL as null', () => {
      const landscape = findProgramme('LANDSCAPE ARCHITECTURE');
      expect(landscape).toBeDefined();
      expect(landscape?.merit).toBeNull();
      expect(landscape?.catchment.ekiti).toBeNull();
      expect(landscape?.catchment.lagos).toBeNull();
      expect(landscape?.catchment.ogun).toBeNull();
      expect(landscape?.catchment.ondo).toBeNull();
      expect(landscape?.catchment.osun).toBeNull();
      expect(landscape?.catchment.oyo).toBeNull();
    });
  });
});
