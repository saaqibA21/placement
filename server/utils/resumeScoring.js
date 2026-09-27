// Shared ATS scoring engine — used by both the student-facing manual
// AI Resume Reviewer (routes/aiResume.js) and the automatic per-application
// screening score computed when a student applies to a drive
// (routes/applications.js), so the two never drift apart.

export const ROLE_BENCHMARKS = {
  'Full Stack Developer': {
    coreSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'HTML/CSS', 'REST APIs', 'SQL', 'MongoDB', 'Git'],
    recommendedSkills: ['Docker', 'AWS', 'GraphQL', 'TailwindCSS', 'Redux', 'CI/CD', 'Jest', 'Next.js', 'Express'],
    actionVerbs: ['Architected', 'Developed', 'Engineered', 'Optimized', 'Deployed', 'Implemented', 'Designed', 'Integrated', 'Refactored'],
    weightMetrics: 25,
  },
  'Data Analyst / Scientist': {
    coreSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Visualization', 'Tableau', 'Power BI', 'Statistics', 'Excel'],
    recommendedSkills: ['Scikit-Learn', 'R', 'Machine Learning', 'BigQuery', 'Matplotlib', 'Seaborn', 'A/B Testing', 'ETL'],
    actionVerbs: ['Analyzed', 'Modeled', 'Extracted', 'Forecasted', 'Quantified', 'Discovered', 'Automated', 'Synthesized'],
    weightMetrics: 30,
  },
  'Cloud / DevOps Engineer': {
    coreSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git', 'Bash', 'Terraform', 'Networking'],
    recommendedSkills: ['Azure', 'GCP', 'Ansible', 'Jenkins', 'Prometheus', 'Grafana', 'Python', 'Security', 'YAML'],
    actionVerbs: ['Automated', 'Provisioned', 'Scaled', 'Configured', 'Maintained', 'Monitored', 'Migrated', 'Secured'],
    weightMetrics: 25,
  },
  'AI & Machine Learning Engineer': {
    coreSkills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Deep Learning', 'NLP', 'Computer Vision', 'Mathematics', 'Git'],
    recommendedSkills: ['OpenCV', 'HuggingFace', 'LangChain', 'CUDA', 'FastAPI', 'MLOps', 'Pandas', 'Transformers'],
    actionVerbs: ['Trained', 'Fine-tuned', 'Evaluated', 'Engineered', 'Developed', 'Deployed', 'Benchmarked', 'Optimized'],
    weightMetrics: 25,
  },
  'Software Systems Engineer': {
    coreSkills: ['Java', 'C++', 'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'Git'],
    recommendedSkills: ['Spring Boot', 'Multithreading', 'System Design', 'Microservices', 'Linux', 'PostgreSQL', 'Unit Testing'],
    actionVerbs: ['Architected', 'Designed', 'Optimized', 'Resolved', 'Implemented', 'Engineered', 'Tested', 'Constructed'],
    weightMetrics: 25,
  },
};

export const COMPANY_PREFERENCES = {
  'TCS': ['Java', 'Python', 'SQL', 'Agile', 'SDLC', 'Data Structures', 'Problem Solving', 'Communication'],
  'Infosys': ['Java', 'Spring', 'Python', 'Web Technologies', 'Cloud Basics', 'DBMS', 'Algorithms'],
  'Zoho': ['C', 'C++', 'Java', 'Data Structures', 'OOP', 'System Logic', 'Low-Level Design', 'Clean Code'],
  'Amazon': ['Data Structures', 'Algorithms', 'System Design', 'AWS', 'Scalability', 'Distributed Systems', 'Customer Obsession', 'Leadership Principles'],
  'Microsoft': ['Data Structures', 'Algorithms', 'C++', 'C#', '.NET', 'Cloud', 'Azure', 'Design Patterns', 'Collaboration'],
  'Accenture': ['Cloud Computing', 'Java', 'Full Stack', 'Agile', 'Consulting Mindset', 'SQL', 'Testing'],
  'Cognizant': ['Java', 'Full Stack', 'Database Management', 'Testing', 'Python', 'REST APIs'],
  'Wipro': ['Core Java', 'Python', 'Data Analytics', 'Cloud Fundamentals', 'Problem Solving'],
  'Google': ['Data Structures', 'Algorithms', 'System Design', 'Distributed Computing', 'Clean Code', 'Performance Optimization'],
};

// Maps a recruitment drive's role/description to the closest ATS benchmark
// profile, so the automatic per-application score is evaluated against
// sensible keyword/skill expectations for that job rather than a generic one.
export function mapJobToRole(job) {
  const t = `${job?.role || ''} ${job?.description || ''} ${job?.jobType || ''}`.toLowerCase();
  if (/(data scien|data analy|machine learning engineer|\bml\b|analytics)/.test(t) && !/devops|cloud/.test(t)) {
    if (/machine learning|\bai\b|deep learning|nlp|computer vision/.test(t)) return 'AI & Machine Learning Engineer';
    return 'Data Analyst / Scientist';
  }
  if (/devops|cloud|kubernetes|aws|azure|site reliability|\bsre\b/.test(t)) return 'Cloud / DevOps Engineer';
  if (/machine learning|artificial intelligence|\bai\b|deep learning|nlp|computer vision/.test(t)) return 'AI & Machine Learning Engineer';
  if (/full stack|frontend|front-end|backend|back-end|web developer|react|node/.test(t)) return 'Full Stack Developer';
  return 'Software Systems Engineer';
}

// Helper: analyze raw text for metrics, action verbs, and structure
export function evaluateResumeText(text, targetRole = 'Full Stack Developer', targetCompany = 'General') {
  const cleanText = (text || '').trim();

  const benchmark = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Full Stack Developer'];
  const companyKeywords = COMPANY_PREFERENCES[targetCompany] || [];

  // 1. Keyword Matching
  const allTargetKeywords = Array.from(new Set([...benchmark.coreSkills, ...benchmark.recommendedSkills, ...companyKeywords]));
  const matchedKeywords = [];
  const missingKeywords = [];

  allTargetKeywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(cleanText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchScore = Math.min(100, Math.round((matchedKeywords.length / (allTargetKeywords.length * 0.6)) * 100));

  // 2. Action Verbs Evaluation
  const foundVerbs = [];
  benchmark.actionVerbs.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(cleanText)) {
      foundVerbs.push(verb);
    }
  });
  const actionVerbScore = Math.min(100, Math.round((foundVerbs.length / 5) * 100));

  // 3. Measurable Impact / Numbers & Metrics Detection
  const metricMatches = cleanText.match(/(\d+%\s*|\d+x\s*|\$\d+|\d+\+?\s*(users|clients|requests|ms|seconds|hours|queries|points|increase|reduction|improvement))/gi) || [];
  const numbersFound = (cleanText.match(/\b\d+(\.\d+)?\b/g) || []).length;
  const metricsScore = Math.min(100, Math.round((metricMatches.length * 20) + (numbersFound >= 4 ? 30 : numbersFound * 7)));

  // 4. Structural Completeness
  const hasEducation = /education|b\.tech|b\.e|cgpa|gpa|university|college/i.test(cleanText);
  const hasSkills = /skills|technical skills|technologies|proficiencies/i.test(cleanText);
  const hasProjects = /projects|portfolio|github|built/i.test(cleanText);
  const hasExperience = /experience|internship|work history|employment|project lead/i.test(cleanText);
  const hasContact = /email|phone|linkedin|github|portfolio|contact/i.test(cleanText);

  let structureScore = 40;
  if (hasEducation) structureScore += 15;
  if (hasSkills) structureScore += 15;
  if (hasProjects) structureScore += 15;
  if (hasExperience) structureScore += 10;
  if (hasContact) structureScore += 5;
  structureScore = Math.min(100, structureScore);

  // 5. Brevity & Word Count
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  let brevityScore = 100;
  if (wordCount < 150) brevityScore = 55;
  else if (wordCount < 250) brevityScore = 75;
  else if (wordCount > 900) brevityScore = 80;

  const overallAtsScore = Math.round(
    (keywordMatchScore * 0.35) +
    (metricsScore * 0.25) +
    (structureScore * 0.20) +
    (actionVerbScore * 0.10) +
    (brevityScore * 0.10)
  );

  const sampleWeakBullets = [
    {
      original: 'Worked on front-end development using React and CSS for student portal.',
      improved: 'Architected responsive frontend components in React and TailwindCSS, reducing page load latency by 35% across 2,000+ active student users.',
      category: 'Impact & Specificity',
      reason: 'Missing measurable impact and action verb.',
    },
    {
      original: 'Helped in database design and wrote SQL queries for backend.',
      improved: 'Designed normalized PostgreSQL relational schema and optimized complex indexing queries, cutting average query execution time from 240ms to 45ms.',
      category: 'Technical Depth',
      reason: 'Lacks details on performance, optimization, and database architecture.',
    },
    {
      original: 'Built a machine learning model to predict prices with Python.',
      improved: 'Engineered an end-to-end predictive ML pipeline in Scikit-Learn & Pandas with 92.4% validation accuracy; deployed REST inferencing microservice using FastAPI.',
      category: 'Quantification & Tooling',
      reason: 'No accuracy metrics or deployment lifecycle mentioned.',
    },
    {
      original: 'Responsible for bug fixing and code reviews in team project.',
      improved: 'Spearheaded automated CI/CD pipeline integration and conducted rigorous peer code reviews, decreasing production bug regressions by 28%.',
      category: 'Leadership & CI/CD',
      reason: 'Replaces passive "Responsible for" with proactive leadership verb.',
    },
  ];

  const suggestions = [];
  if (keywordMatchScore < 75) {
    suggestions.push({
      type: 'critical',
      title: 'Incorporate Missing High-Demand Keywords',
      desc: `Add missing technologies relevant to ${targetRole} like: ${missingKeywords.slice(0, 5).join(', ')}.`,
    });
  }
  if (metricsScore < 70) {
    suggestions.push({
      type: 'warning',
      title: 'Quantify Your Project Accomplishments',
      desc: 'Use numbers (e.g. "% performance gain", "number of API endpoints", "user count", "latency reduction") to validate your claims to recruiters.',
    });
  }
  if (foundVerbs.length < 3) {
    suggestions.push({
      type: 'tip',
      title: 'Upgrade to Power Action Verbs',
      desc: `Begin experience bullet points with strong verbs such as: ${benchmark.actionVerbs.slice(0, 4).join(', ')}.`,
    });
  }
  if (!hasProjects) {
    suggestions.push({
      type: 'critical',
      title: 'Include a Dedicated "Featured Projects" Section',
      desc: 'Top recruiters prioritize demonstrable GitHub project links with live demo URLs and tech stack descriptions.',
    });
  }

  let statusLabel = 'Competitive';
  let badgeColor = '#15803d';
  if (overallAtsScore >= 85) {
    statusLabel = 'Interview Ready (Top 10%)';
    badgeColor = '#15803d';
  } else if (overallAtsScore >= 70) {
    statusLabel = 'Competitive Candidate';
    badgeColor = '#0369a1';
  } else if (overallAtsScore >= 55) {
    statusLabel = 'Needs Improvement';
    badgeColor = '#b45309';
  } else {
    statusLabel = 'Critical Fixes Required';
    badgeColor = '#be123c';
  }

  return {
    overallAtsScore,
    statusLabel,
    badgeColor,
    wordCount,
    targetRole,
    targetCompany,
    pillars: {
      keywordMatch: { score: keywordMatchScore, label: 'Keyword & Skill Match' },
      metricsImpact: { score: metricsScore, label: 'Measurable Metrics & Impact' },
      structure: { score: structureScore, label: 'Format & ATS Structure' },
      actionVerbs: { score: actionVerbScore, label: 'Action Verb Strength' },
      brevity: { score: brevityScore, label: 'Brevity & Conciseness' },
    },
    matchedKeywords: matchedKeywords.slice(0, 14),
    missingKeywords: missingKeywords.slice(0, 10),
    foundVerbs,
    suggestions,
    bulletRewrites: sampleWeakBullets,
    analyzedAt: new Date().toISOString(),
  };
}
