import { describe, it, expect } from 'vitest';
import {
  evaluatePrerequisiteTree,
  PrerequisiteGroupNode,
  CandidateProfile,
} from '../src/lib/prerequisite-engine';

describe('Prerequisite Engine Real-World Edge Cases', () => {
  // Case 1: Cisco CCNP Enterprise (Core 350-401 ENCOR AND 1-of-6 Concentrations)
  it('correctly evaluates Cisco CCNP Enterprise (Core 350-401 AND 1-of-6 Concentrations)', () => {
    const ccnpEnterpriseRule: PrerequisiteGroupNode = {
      id: 'ccnp-root',
      logicType: 'AND',
      members: [
        { memberType: 'EXAM', examId: 'exam:350-401', edgeType: 'REQUIRED' },
        { memberType: 'CERTIFICATION', certificationId: 'cert:ccna', edgeType: 'RECOMMENDED' }, // Recommended precursor
      ],
      childGroups: [
        {
          id: 'ccnp-concentrations',
          logicType: 'OR',
          minRequired: 1,
          members: [
            { memberType: 'EXAM', examId: 'exam:300-410', edgeType: 'ALTERNATIVE' },
            { memberType: 'EXAM', examId: 'exam:300-415', edgeType: 'ALTERNATIVE' },
            { memberType: 'EXAM', examId: 'exam:300-420', edgeType: 'ALTERNATIVE' },
            { memberType: 'EXAM', examId: 'exam:300-425', edgeType: 'ALTERNATIVE' },
            { memberType: 'EXAM', examId: 'exam:300-430', edgeType: 'ALTERNATIVE' },
            { memberType: 'EXAM', examId: 'exam:300-435', edgeType: 'ALTERNATIVE' },
          ],
        },
      ],
    };

    // Candidate A: Passed Core (350-401) + ENARSI (300-410), no CCNA -> Qualified (CCNA is recommended, not mandatory)
    expect(
      evaluatePrerequisiteTree(ccnpEnterpriseRule, {
        passedExams: new Set(['exam:350-401', 'exam:300-410']),
        heldCertifications: new Set(),
        yearsExperience: 0,
        hasDegree: false,
      })
    ).toBe(true);

    // Candidate B: Passed Core only -> Not qualified
    expect(
      evaluatePrerequisiteTree(ccnpEnterpriseRule, {
        passedExams: new Set(['exam:350-401']),
        heldCertifications: new Set(),
        yearsExperience: 0,
        hasDegree: false,
      })
    ).toBe(false);

    // Candidate C: Passed Concentration only -> Not qualified
    expect(
      evaluatePrerequisiteTree(ccnpEnterpriseRule, {
        passedExams: new Set(['exam:300-410']),
        heldCertifications: new Set(),
        yearsExperience: 0,
        hasDegree: false,
      })
    ).toBe(false);
  });

  // Case 2: Microsoft SC-100 (Exam SC-100 AND [SC-200 OR AZ-500 OR SC-300])
  it('correctly evaluates Microsoft SC-100 (Exam SC-100 AND [SC-200 OR AZ-500 OR SC-300])', () => {
    const sc100Rule: PrerequisiteGroupNode = {
      id: 'sc100-root',
      logicType: 'AND',
      members: [
        { memberType: 'EXAM', examId: 'exam:sc-100', edgeType: 'REQUIRED' },
      ],
      childGroups: [
        {
          id: 'sc100-prereq-certs',
          logicType: 'OR',
          minRequired: 1,
          members: [
            { memberType: 'CERTIFICATION', certificationId: 'cert:sc-200', edgeType: 'ALTERNATIVE' },
            { memberType: 'CERTIFICATION', certificationId: 'cert:az-500', edgeType: 'ALTERNATIVE' },
            { memberType: 'CERTIFICATION', certificationId: 'cert:sc-300', edgeType: 'ALTERNATIVE' },
          ],
        },
      ],
    };

    // Passed SC-100 exam + holds AZ-500 -> Qualified
    expect(
      evaluatePrerequisiteTree(sc100Rule, {
        passedExams: new Set(['exam:sc-100']),
        heldCertifications: new Set(['cert:az-500']),
        yearsExperience: 0,
        hasDegree: false,
      })
    ).toBe(true);

    // Passed SC-100 exam but holds no associate cert -> Not qualified
    expect(
      evaluatePrerequisiteTree(sc100Rule, {
        passedExams: new Set(['exam:sc-100']),
        heldCertifications: new Set(),
        yearsExperience: 0,
        hasDegree: false,
      })
    ).toBe(false);
  });

  // Case 3: ISC2 CISSP (Exam CISSP AND [5 Yrs Exp OR (4 Yrs Exp AND [Degree OR Waiver Cert])])
  it('correctly evaluates ISC2 CISSP nested prerequisite logic (5 yrs exp OR [4 yrs exp AND (degree OR waiver cert)])', () => {
    const cisspRule: PrerequisiteGroupNode = {
      id: 'cissp-root',
      logicType: 'AND',
      groupLabel: 'CISSP Certification Gateway',
      members: [
        { memberType: 'EXAM', examId: 'exam:cissp', edgeType: 'REQUIRED' },
      ],
      childGroups: [
        {
          id: 'cissp-experience-or-waiver-gateway',
          logicType: 'OR',
          minRequired: 1,
          groupLabel: 'Experience or Education Waiver Route',
          members: [
            // Option 1: Direct 5 years experience
            {
              memberType: 'EXPERIENCE',
              experienceYearsRequired: 5,
              experienceDescription: '5 years cumulative paid work experience in 2+ domains of the CISSP CBK',
              edgeType: 'ALTERNATIVE',
            },
          ],
          childGroups: [
            // Option 2: 1-Year Waiver Route (4 years experience AND [Degree OR Approved Credential])
            {
              id: 'cissp-waiver-branch',
              logicType: 'AND',
              groupLabel: '1-Year Waiver Route (Requires 4 years experience + Qualifying Education/Credential)',
              members: [
                {
                  memberType: 'EXPERIENCE',
                  experienceYearsRequired: 4,
                  experienceDescription: '4 years cumulative paid work experience in 2+ domains of the CISSP CBK',
                  edgeType: 'REQUIRED',
                },
              ],
              childGroups: [
                {
                  id: 'cissp-qualifying-waiver-options',
                  logicType: 'OR',
                  minRequired: 1,
                  groupLabel: 'Qualifying Education or Approved Credential',
                  members: [
                    {
                      memberType: 'DEGREE',
                      degreeDescription: '4-year post-secondary college degree',
                      edgeType: 'ALTERNATIVE',
                    },
                    {
                      memberType: 'CERTIFICATION',
                      certificationId: 'cert:security-plus', // CompTIA Security+ (on ISC2 approved list)
                      edgeType: 'ALTERNATIVE',
                      notes: 'ISC2 Approved Credential Waiver',
                    },
                    {
                      memberType: 'CERTIFICATION',
                      certificationId: 'cert:cisa', // ISACA CISA (on ISC2 approved list)
                      edgeType: 'ALTERNATIVE',
                      notes: 'ISC2 Approved Credential Waiver',
                    },
                    {
                      memberType: 'CERTIFICATION',
                      certificationId: 'cert:cysa-plus', // CompTIA CySA+ (on ISC2 approved list)
                      edgeType: 'ALTERNATIVE',
                      notes: 'ISC2 Approved Credential Waiver',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // Scenario A: Candidate with 5 years experience + passed exam -> QUALIFIED
    const candidateA: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(),
      yearsExperience: 5,
      hasDegree: false,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateA)).toBe(true);

    // Scenario B: Candidate with 4 years experience + 4-year college degree + passed exam -> QUALIFIED (via degree waiver)
    const candidateB: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(),
      yearsExperience: 4,
      hasDegree: true,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateB)).toBe(true);

    // Scenario C: Candidate with 4 years experience + CompTIA Security+ + passed exam -> QUALIFIED (via credential waiver)
    const candidateC: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(['cert:security-plus']),
      yearsExperience: 4,
      hasDegree: false,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateC)).toBe(true);

    // Scenario D: Candidate with 4 years experience + ISACA CISA + passed exam -> QUALIFIED (via credential waiver)
    const candidateD: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(['cert:cisa']),
      yearsExperience: 4,
      hasDegree: false,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateD)).toBe(true);

    // Scenario E: Candidate with 4 years experience ONLY (no degree, no waiver cert) -> NOT QUALIFIED (needs 5 yrs or waiver)
    const candidateE: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(),
      yearsExperience: 4,
      hasDegree: false,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateE)).toBe(false);

    // Scenario F: Candidate holds BOTH Degree AND Security+ (both valid waivers), but ONLY has 3 years experience
    // -> NOT QUALIFIED (rejection reason: 3 years is below the non-negotiable 4-year experience floor;
    // holding multiple waivers does not stack beyond the maximum 1-year waiver cap).
    const candidateF: CandidateProfile = {
      passedExams: new Set(['exam:cissp']),
      heldCertifications: new Set(['cert:security-plus']),
      yearsExperience: 3,
      hasDegree: true,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateF)).toBe(false);

    // Scenario G: Candidate with 5 years experience but HAS NOT PASSED the CISSP exam -> NOT QUALIFIED
    const candidateG: CandidateProfile = {
      passedExams: new Set(),
      heldCertifications: new Set(),
      yearsExperience: 5,
      hasDegree: true,
    };
    expect(evaluatePrerequisiteTree(cisspRule, candidateG)).toBe(false);
  });
});
