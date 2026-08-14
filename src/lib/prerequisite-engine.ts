export interface PrerequisiteMemberItem {
  memberType: 'EXAM' | 'CERTIFICATION' | 'EXPERIENCE' | 'DEGREE' | 'OTHER_CREDENTIAL';
  examId?: string;
  certificationId?: string;
  experienceYearsRequired?: number;
  experienceDescription?: string;
  degreeDescription?: string;
  edgeType: 'REQUIRED' | 'RECOMMENDED' | 'ALTERNATIVE';
}

export interface PrerequisiteGroupNode {
  id: string;
  logicType: 'AND' | 'OR';
  minRequired?: number;
  groupLabel?: string;
  members: PrerequisiteMemberItem[];
  childGroups?: PrerequisiteGroupNode[];
}

export interface CandidateProfile {
  passedExams: Set<string>;
  heldCertifications: Set<string>;
  yearsExperience: number;
  hasDegree: boolean;
}

export function evaluatePrerequisiteTree(
  group: PrerequisiteGroupNode,
  candidate: CandidateProfile
): boolean {
  if (group.logicType === 'AND') {
    // All non-recommended members must be satisfied
    const membersSatisfied = group.members.every((m) => {
      if (m.edgeType === 'RECOMMENDED') return true; // Advisory only
      if (m.memberType === 'EXAM') return m.examId ? candidate.passedExams.has(m.examId) : false;
      if (m.memberType === 'CERTIFICATION')
        return m.certificationId ? candidate.heldCertifications.has(m.certificationId) : false;
      if (m.memberType === 'EXPERIENCE')
        return candidate.yearsExperience >= (m.experienceYearsRequired ?? 5);
      if (m.memberType === 'DEGREE') return candidate.hasDegree;
      return false;
    });

    const childrenSatisfied = (group.childGroups || []).every((cg) =>
      evaluatePrerequisiteTree(cg, candidate)
    );

    return membersSatisfied && childrenSatisfied;
  } else {
    // OR logic: candidate must satisfy at least minRequired branches
    const k = Math.max(1, group.minRequired || 1);
    let satisfiedBranches = 0;

    for (const m of group.members) {
      if (m.edgeType === 'RECOMMENDED') continue;
      let memberPassed = false;
      if (m.memberType === 'EXAM') memberPassed = m.examId ? candidate.passedExams.has(m.examId) : false;
      if (m.memberType === 'CERTIFICATION')
        memberPassed = m.certificationId ? candidate.heldCertifications.has(m.certificationId) : false;
      if (m.memberType === 'EXPERIENCE')
        memberPassed = candidate.yearsExperience >= (m.experienceYearsRequired ?? 5);
      if (m.memberType === 'DEGREE') memberPassed = candidate.hasDegree;

      if (memberPassed) satisfiedBranches++;
    }

    for (const cg of group.childGroups || []) {
      if (evaluatePrerequisiteTree(cg, candidate)) {
        satisfiedBranches++;
      }
    }

    return satisfiedBranches >= k;
  }
}
