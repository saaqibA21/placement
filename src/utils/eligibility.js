// Evaluates whether a student meets a job's eligibility rules.
// Falls back gracefully for legacy jobs that only have branches/minCGPA
// and no `eligibility` object.
export function evaluateEligibility(job, student) {
  const reasons = [];
  if (!student) return { eligible: false, reasons: ['No student profile found.'] };

  const branches = job.branches || [];
  if (branches.length > 0 && student.branch && !branches.includes(student.branch)) {
    reasons.push(`Branch ${student.branch} is not eligible for this drive.`);
  }

  const rules = job.eligibility || {};
  const minCGPA = rules.minCGPA ?? job.minCGPA ?? job.minCgpa ?? 0;
  const maxCGPA = rules.maxCGPA ?? 10;
  const cgpa = student.cgpa ?? 0;
  if (cgpa < minCGPA) reasons.push(`Requires minimum CGPA ${minCGPA} (you have ${cgpa}).`);
  if (cgpa > maxCGPA) reasons.push(`Requires CGPA at or below ${maxCGPA} (you have ${cgpa}).`);

  if (rules.gender && rules.gender !== 'Any' && student.gender && student.gender !== 'Any' && rules.gender !== student.gender) {
    reasons.push(`This drive is open to ${rules.gender} candidates only.`);
  }

  if (rules.maxCurrentArrears !== null && rules.maxCurrentArrears !== undefined) {
    const current = student.currentArrears ?? 0;
    if (current > rules.maxCurrentArrears) {
      reasons.push(`Max ${rules.maxCurrentArrears} current arrears allowed (you have ${current}).`);
    }
  }

  if (rules.maxArrearsHistory !== null && rules.maxArrearsHistory !== undefined) {
    const history = student.arrearsHistory ?? 0;
    if (history > rules.maxArrearsHistory) {
      reasons.push(`Max ${rules.maxArrearsHistory} arrears history allowed (you have ${history}).`);
    }
  }

  if (rules.tenthMinPercent) {
    const val = student.tenthPercent;
    if (val !== null && val !== undefined && val < rules.tenthMinPercent) {
      reasons.push(`Requires 10th standard >= ${rules.tenthMinPercent}% (you have ${val}%).`);
    }
  }

  if (rules.twelfthOrDiploma) {
    const twelfthOk = rules.twelfthMinPercent ? (student.twelfthPercent ?? 0) >= rules.twelfthMinPercent : true;
    const diplomaOk = rules.diplomaMinPercent ? (student.diplomaPercent ?? 0) >= rules.diplomaMinPercent : true;
    const hasTwelfth = student.twelfthPercent !== null && student.twelfthPercent !== undefined;
    const hasDiploma = student.diplomaPercent !== null && student.diplomaPercent !== undefined;
    if (!((hasTwelfth && twelfthOk) || (hasDiploma && diplomaOk))) {
      reasons.push(`Requires 12th >= ${rules.twelfthMinPercent || 0}% OR Diploma >= ${rules.diplomaMinPercent || 0}%.`);
    }
  } else if (rules.twelfthMinPercent) {
    const val = student.twelfthPercent;
    if (val !== null && val !== undefined && val < rules.twelfthMinPercent) {
      reasons.push(`Requires 12th standard >= ${rules.twelfthMinPercent}% (you have ${val}%).`);
    }
  }

  if (rules.batches && rules.batches.length > 0 && student.batch && !rules.batches.includes(student.batch)) {
    reasons.push(`Open to batch ${rules.batches.join(', ')} only (you are ${student.batch}).`);
  }

  return { eligible: reasons.length === 0, reasons };
}

export const DEFAULT_ELIGIBILITY = {
  gender: 'Any',
  minCGPA: 0,
  maxCGPA: 10,
  maxCurrentArrears: null,
  maxArrearsHistory: null,
  batches: [],
  tenthMinPercent: null,
  twelfthMinPercent: null,
  diplomaMinPercent: null,
  twelfthOrDiploma: false,
};

export const DEFAULT_PIPELINE = [
  { id: 'p1', name: 'Application & Resume Screening', type: 'screening' },
  { id: 'p2', name: 'Online Assessment / Aptitude', type: 'test' },
  { id: 'p3', name: 'Technical Interview', type: 'interview' },
  { id: 'p4', name: 'HR Interview', type: 'interview' },
  { id: 'p5', name: 'Offer Rollout', type: 'offer' },
];
