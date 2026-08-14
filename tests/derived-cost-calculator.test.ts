import { describe, it, expect } from 'vitest';
import { computeCertificationCost, PrerequisiteGroupForCost } from '../src/lib/derived-cost';

describe('Derived Cost Calculator (computed_cost_usd / computed_cost_cad)', () => {
  it('correctly sums costs for Multi-Exam AND cases (e.g. Windows Server Hybrid = AZ-800 + AZ-801)', () => {
    const windowsHybridGroups: PrerequisiteGroupForCost[] = [
      {
        id: 'group:az800-and-az801',
        logicType: 'AND',
        minRequired: 2,
        groupLabel: 'Required Core & Advanced Hybrid Exams',
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:az-800',
              examCode: 'AZ-800',
              name: 'Administering Windows Server Hybrid Core Infrastructure',
              costAmountUsd: 165.0,
              costAmountCadOverride: 215.0,
            },
          },
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:az-801',
              examCode: 'AZ-801',
              name: 'Configuring Windows Server Hybrid Advanced Services',
              costAmountUsd: 165.0,
              costAmountCadOverride: 215.0,
            },
          },
        ],
      },
    ];

    const result = computeCertificationCost(windowsHybridGroups, 1.36);

    // Summed USD total: 165 + 165 = 330
    expect(result.minUsd).toBe(330.0);
    expect(result.maxUsd).toBe(330.0);
    expect(result.isRange).toBe(false);
    expect(result.formattedUsd).toBe('$330 USD');

    // Summed CAD override total: 215 + 215 = 430
    expect(result.minCad).toBe(430.0);
    expect(result.maxCad).toBe(430.0);
    expect(result.formattedCad).toBe('$430 CAD');
    expect(result.examCount).toBe(2);
  });

  it('correctly computes min/max cost ranges for Elective OR cases (e.g. CCNP Enterprise = 1 Core + 1 of 6 Concentrations)', () => {
    const ccnpEnterpriseGroups: PrerequisiteGroupForCost[] = [
      {
        id: 'group:ccnp-core',
        logicType: 'AND',
        minRequired: 1,
        groupLabel: 'Mandatory Core Exam',
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:350-401',
              examCode: '350-401 ENCOR',
              name: 'Implementing and Operating Cisco Enterprise Network Core Technologies',
              costAmountUsd: 400.0,
              costAmountCadOverride: 550.0,
            },
          },
        ],
      },
      {
        id: 'group:ccnp-concentration',
        logicType: 'OR',
        minRequired: 1,
        groupLabel: 'Choose 1 Concentration Exam',
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:300-410',
              examCode: '300-410 ENARSI',
              name: 'Implementing Cisco Enterprise Advanced Routing and Services',
              costAmountUsd: 300.0,
              costAmountCadOverride: 415.0,
            },
          },
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:300-415',
              examCode: '300-415 ENSDWI',
              name: 'Implementing Cisco SD-WAN Solutions',
              costAmountUsd: 300.0,
              costAmountCadOverride: 415.0,
            },
          },
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:300-435',
              examCode: '300-435 ENAUTO',
              name: 'Automating and Programming Cisco Enterprise Solutions',
              costAmountUsd: 300.0,
              costAmountCadOverride: 415.0,
            },
          },
        ],
      },
    ];

    const result = computeCertificationCost(ccnpEnterpriseGroups, 1.36);

    // Core (400) + Concentration (300) = 700 USD
    expect(result.minUsd).toBe(700.0);
    expect(result.maxUsd).toBe(700.0);
    expect(result.isRange).toBe(false);
    expect(result.formattedUsd).toBe('$700 USD');

    // CAD total: 550 + 415 = 965 CAD
    expect(result.minCad).toBe(965.0);
    expect(result.maxCad).toBe(965.0);
    expect(result.formattedCad).toBe('$965 CAD');
    expect(result.examCount).toBe(2);
  });

  it('correctly identifies price ranges when elective exams have variable costs', () => {
    const variableElectiveGroups: PrerequisiteGroupForCost[] = [
      {
        id: 'group:core',
        logicType: 'AND',
        minRequired: 1,
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:core',
              examCode: 'CORE-100',
              name: 'Foundation Core',
              costAmountUsd: 200.0,
            },
          },
        ],
      },
      {
        id: 'group:electives',
        logicType: 'OR',
        minRequired: 1,
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:elec-standard',
              examCode: 'ELEC-A',
              name: 'Standard Elective',
              costAmountUsd: 150.0,
            },
          },
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:elec-premium',
              examCode: 'ELEC-B',
              name: 'Advanced Practical Elective',
              costAmountUsd: 350.0,
            },
          },
        ],
      },
    ];

    const result = computeCertificationCost(variableElectiveGroups, 1.36);

    // Min: 200 + 150 = 350, Max: 200 + 350 = 550
    expect(result.minUsd).toBe(350.0);
    expect(result.maxUsd).toBe(550.0);
    expect(result.isRange).toBe(true);
    expect(result.formattedUsd).toBe('$350 – $550 USD');
  });

  it('handles Single-Exam certifications directly', () => {
    const singleExamGroup: PrerequisiteGroupForCost[] = [
      {
        id: 'group:aws-saa',
        logicType: 'AND',
        minRequired: 1,
        members: [
          {
            memberType: 'EXAM',
            exam: {
              id: 'exam:saa-c03',
              examCode: 'SAA-C03',
              name: 'AWS Certified Solutions Architect - Associate',
              costAmountUsd: 150.0,
            },
          },
        ],
      },
    ];

    const result = computeCertificationCost(singleExamGroup, 1.36);
    expect(result.minUsd).toBe(150.0);
    expect(result.maxUsd).toBe(150.0);
    expect(result.isRange).toBe(false);
    expect(result.formattedUsd).toBe('$150 USD');
    expect(result.minCad).toBe(204.0); // 150 * 1.36
  });
});
