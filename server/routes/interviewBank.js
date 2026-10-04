import express from 'express';
const router = express.Router();

const HR_QUESTIONS = [
  {
    id: 'hr-1',
    category: 'Self Introduction & Foundation',
    title: 'Tell me about yourself and walk me through your background.',
    frequency: '99% of Campus Interviews',
    difficulty: 'Essential',
    targetTime: '90 – 120 Seconds',
    intent: 'Tests structured communication, confidence, relevant technical highlights, and whether you can summarize 4 years concisely without rambling.',
    framework: 'Present – Past – Future formula (Who you are today -> Key engineering projects/skills -> Why this company is your logical next step).',
    starBreakdown: {
      situation: 'Introduction of degree, major at Jeppiaar University, and primary technical specialization.',
      task: 'Key academic and project initiatives you led (e.g. Full Stack, AI, Cloud, Embedded Systems).',
      action: 'Practical internships, hackathon milestones, or certifications earned.',
      result: 'Clear alignment on why your skills solve the company’s hiring needs.',
    },
    sampleAnswer: `Good morning/afternoon. My name is [Your Name], and I am currently pursuing my B.Tech in Computer Science and Engineering at Jeppiaar University with an aggregate CGPA of 8.9.

Over the past four years, I have built a strong foundation in core Data Structures, Algorithms, Full Stack Development, and relational database systems. Recently, I built a Campus Recruitment Automation Portal using React and Node.js that handled applicant tracking and automated resume screening for university placement drives. Additionally, during my summer internship at Cognizant, I worked on modular component design and database query optimization, which reduced API response latency by 32%.

Beyond coursework, I am an active competitive coder and Smart India Hackathon finalist. Having tracked [Company Name]’s engineering excellence in cloud and distributed systems, I am eager to apply my problem-solving skills to your core engineering team as a Software Engineer.`,
    mistakesToAvoid: [
      'Do not recount your entire life story, schooling details, or family tree.',
      'Avoid reading your resume verbatim without emphasizing practical project impact.',
      'Never exceed 2 minutes or speak with a flat, hesitant monotone.',
    ],
    proTip: 'End your pitch with a bridge connecting your skill set directly to the role you are interviewing for.',
  },
  {
    id: 'hr-2',
    category: 'Strengths & Self-Awareness',
    title: 'What is your greatest weakness, and how are you working to overcome it?',
    frequency: '85% of Campus Interviews',
    difficulty: 'Intermediate',
    targetTime: '60 – 75 Seconds',
    intent: 'Evaluates emotional intelligence, genuine self-reflection, and proactive corrective actions. Interviewers reject fake weaknesses like "I work too hard".',
    framework: 'Real Technical/Soft Skill Area -> Trigger/Realization -> Actionable Remediation Habit -> Measurable Progress.',
    starBreakdown: {
      situation: 'Identified an area where initial performance was sub-optimal.',
      task: 'Recognized the need for structured improvement.',
      action: 'Implemented a concrete system (e.g., calendar time-blocking, peer review, public speaking).',
      result: 'Demonstrated positive behavioral change in recent college projects.',
    },
    sampleAnswer: `Earlier in my college tenure, I found it difficult to delegate project tasks during hackathons because I felt personally responsible for every line of code. This often resulted in late-night bottlenecks right before submission deadlines.

Recognizing this, I started using Jira and GitHub Projects for sprint planning during our final-year capstone project. I established clear interface contracts between backend and frontend sub-teams and held brief daily syncs. Learning to trust my team not only improved our overall delivery velocity by 40%, but also allowed me to focus on architecture and core API testing.`,
    mistakesToAvoid: [
      'Avoid cliché answers like "I am a perfectionist" or "I am a workaholic".',
      'Never list a disqualifying core competency (e.g. "I dislike coding" for a Software Engineering role).',
      'Never mention a weakness without showing the active steps you are taking to fix it.',
    ],
    proTip: 'Frame the weakness in the past tense and the solution/improvement in the present continuous tense.',
  },
  {
    id: 'hr-3',
    category: 'Situational & Conflict Resolution',
    title: 'Describe a situation where you had a disagreement with a team member. How did you resolve it?',
    frequency: '78% of Campus Interviews',
    difficulty: 'Advanced',
    targetTime: '90 – 120 Seconds',
    intent: 'Tests interpersonal maturity, diplomacy, focus on objective data over ego, and team cohesion.',
    framework: 'STAR Method (Situation -> Task -> Action -> Result) focused on consensus and data-driven decisions.',
    starBreakdown: {
      situation: 'During our 3rd-year web development project, our team of 4 was divided on whether to use MongoDB or PostgreSQL for storing student financial ledger data.',
      task: 'As the database lead, I needed to help the team reach a technical consensus without delaying our milestone deadline.',
      action: 'Instead of arguing preferences, I created a quick benchmark matrix comparing ACID compliance, relational integrity constraints, and query complexity for our transactional schema.',
      result: 'The team objectively agreed on PostgreSQL, and our final audit passed with zero transactional anomalies.',
    },
    sampleAnswer: `During our 3rd-year database project, our team of four had a strong disagreement regarding the storage architecture for an e-commerce inventory system. Two team members preferred MongoDB for rapid prototyping, while another teammate and I advocated for PostgreSQL due to transactional consistency and relational integrity.

To resolve the impasse objectively, I proposed building a proof-of-concept matrix. We spent two hours benchmarking both databases against our specific requirements: multi-table joins, atomic payment updates, and rollback support. When the data clearly showed that relational constraints prevented orphaned order records, the entire team aligned on PostgreSQL. 

We delivered the module three days ahead of schedule, and the experience reinforced that technical disagreements are best resolved through data, prototype validation, and mutual respect.`,
    mistakesToAvoid: [
      'Never blame or speak negatively about former teammates or professors.',
      'Do not say "I have never had any disagreements"; this signals lack of team project experience.',
      'Never claim you simply forced your way without listening to counter-arguments.',
    ],
    proTip: 'Highlight how the conflict actually produced a better engineering outcome for the overall project.',
  },
  {
    id: 'hr-4',
    category: 'Company Fit & Motivation',
    title: 'Why do you want to join our company, and what sets us apart from other recruiters?',
    frequency: '92% of Campus Interviews',
    difficulty: 'Intermediate',
    targetTime: '60 – 90 Seconds',
    intent: 'Detects whether you researched the company’s actual products, tech stack, and values, or if you are giving a generic answer.',
    framework: 'Company Innovation Hook -> Personal Technical Alignment -> Value Contribution.',
    starBreakdown: {
      situation: 'Awareness of company’s flagship systems, market leadership, and engineering culture.',
      task: 'Aligning your skills and aspirations with their engineering vision.',
      action: 'Connecting your academic background to their ongoing technology initiatives.',
      result: 'Mutual long-term value creation.',
    },
    sampleAnswer: `I have closely followed [Company Name]’s engineering innovations, particularly your recent migration to microservices and enterprise cloud scalability. Unlike traditional service firms, your emphasis on end-to-end ownership—where engineers design, deploy, and monitor their own production microservices—strongly resonates with how I like to build software.

During my engineering at Jeppiaar University, I focused extensively on containerization with Docker, REST API design, and asynchronous worker queues. Joining your associate engineering cohort provides the ideal platform where I can contribute to high-throughput client systems under seasoned mentors while continuously raising the engineering bar.`,
    mistakesToAvoid: [
      'Do not say generic statements like "Your company is a Fortune 500 company and offers good salary".',
      'Avoid reciting the "About Us" section off Wikipedia without personal technical connection.',
      'Do not confuse the company’s business model with a competitor.',
    ],
    proTip: 'Mention a specific product, recent tech blog post, open-source library, or client initiative of the company.',
  },
  {
    id: 'hr-5',
    category: 'Career Goals & Commitment',
    title: 'Where do you see yourself in 3 to 5 years?',
    frequency: '88% of Campus Interviews',
    difficulty: 'Standard',
    targetTime: '60 Seconds',
    intent: 'Tests career ambition, realism, stability, and whether your aspirations align with the growth path offered by the company.',
    framework: 'Technical Mastery (Years 1-2) -> System Ownership & Mentorship (Years 3-5).',
    starBreakdown: {
      situation: 'Entering as an enthusiastic Graduate Trainee / Associate Engineer.',
      task: 'Achieving complete domain independence and codebase mastery in Years 1–2.',
      action: 'Taking on architectural design, performance tuning, and peer onboarding in Years 3–5.',
      result: 'Becoming a trusted Senior Software Engineer / Module Lead.',
    },
    sampleAnswer: `In the next two to three years, my primary goal is to become an indispensable and autonomous contributor within my engineering squad. I want to achieve deep mastery over [Company Name]’s codebase, CI/CD deployment pipelines, and operational excellence standards.

Looking ahead to the 5-year horizon, I envision myself growing into a Senior Engineer or Technical Module Lead. I aim to take ownership of complex architectural decisions, mentor junior recruits from university campuses, and spearhead initiatives that drive system performance and customer value.`,
    mistakesToAvoid: [
      'Do not say "I want to be in your chair" or "I want to start my own startup in 2 years".',
      'Do not say "I plan to pursue higher studies (MS/MBA) immediately after one year".',
      'Avoid vague answers like "I just want to be happy and rich".',
    ],
    proTip: 'Focus on technical depth, domain mastery, and expanding scope of responsibility.',
  },
  {
    id: 'hr-6',
    category: 'Workplace Adaptability & Relocation',
    title: 'Are you comfortable with night shifts, variable project domains, and relocating to other cities?',
    frequency: '95% for IT/Service/Product Drives',
    difficulty: 'Essential',
    targetTime: '30 – 45 Seconds',
    intent: 'Confirms operational flexibility and eliminates onboarding friction.',
    framework: 'Enthusiastic Confirmation -> Adaptability Backing -> Professional Commitment.',
    starBreakdown: {
      situation: 'Global client operational needs across multiple time zones and campus delivery centers.',
      task: 'Demonstrating readiness for cross-location and flexible work schedules.',
      action: 'Citing personal adaptability and excitement for geographical exposure.',
      result: 'Unambiguous clearance for HR placement processing.',
    },
    sampleAnswer: `Yes, absolutely. As a fresher starting my professional career, I view relocation and project domain versatility as fantastic opportunities to expand my professional network, understand diverse client operations, and gain multi-regional exposure.

I am completely open to relocating to any of [Company Name]’s development centers across India, and I am comfortable working in rotational shift schedules as required by project deliverables.`,
    mistakesToAvoid: [
      'Do not express hesitation or conditional demands during the campus HR round.',
      'Never answer with ambiguity like "Maybe, depends on where my friends go".',
    ],
    proTip: 'Give a clear, crisp, and enthusiastic affirmation without unnecessary caveats.',
  },
  {
    id: 'hr-7',
    category: 'Failure & Resilience',
    title: 'Tell me about a time you failed or made a significant mistake. What did you learn?',
    frequency: '72% of Campus Interviews',
    difficulty: 'Advanced',
    targetTime: '75 – 90 Seconds',
    intent: 'Measures psychological safety, accountability, post-mortem methodology, and resilience under setbacks.',
    framework: 'Genuine Technical Setback -> Ownership (no excuse) -> Root Cause Fix -> Long-term Prevention.',
    starBreakdown: {
      situation: 'Accidentally deployed an untested database migration script during an academic portal deadline.',
      task: 'Take immediate responsibility and restore database consistency.',
      action: 'Implemented automated schema rollback scripts and introduced pre-merge automated linting.',
      result: 'Zero downtime achieved in subsequent live project releases.',
    },
    sampleAnswer: `During the beta deployment of our university departmental portal, I pushed a database schema migration script without testing it against an empty staging environment. The script assumed foreign keys were pre-populated, which caused the user onboarding endpoint to throw 500 server errors for 45 minutes.

Instead of deflecting, I immediately notified the faculty coordinator, reverted the migration using our backup snapshot, and fixed the relational constraint issue within an hour. More importantly, I introduced a mandatory CI pipeline check with automated staging integration tests before any code reached master branch. That experience taught me that thorough automated verification always precedes speed in software delivery.`,
    mistakesToAvoid: [
      'Do not claim "I have never failed in my life".',
      'Never blame team members, server crashes, or power cuts.',
      'Do not pick a catastrophic ethical failure.',
    ],
    proTip: 'Spend 20% of your time on what went wrong, and 80% on the corrective engineering system you built.',
  },
];

const SPEAKING_ASSESSMENTS = [
  {
    id: 'spk-1',
    type: 'Read-Aloud & Sentence Mastery',
    title: 'Corporate Executive Read-Aloud Practice',
    category: 'Pronunciation & Intonation',
    targetPace: '130 – 145 words per minute',
    audioText: `Cloud-native enterprise architecture leverages distributed microservices, containerization with Docker and Kubernetes, and automated Continuous Integration and Continuous Deployment pipelines. By decoupling monolithic applications into independent services, modern engineering teams achieve horizontal scalability, high fault tolerance, and rapid software iteration cycles with minimal production downtime.`,
    phoneticFocus: [
      { word: 'Architecture', phonetic: '/ˈɑːrkɪtɛktʃər/', tip: 'Stress the first syllable: AR-ki-tek-chur' },
      { word: 'Distributed', phonetic: '/dɪˈstrɪbjuːtɪd/', tip: 'Crisp T sound: dis-TRIB-yoo-ted' },
      { word: 'Kubernetes', phonetic: '/ˌkuːbərˈnɛtiːz/', tip: 'Koo-ber-NET-eez' },
      { word: 'Monolithic', phonetic: '/ˌmɒnəˈlɪθɪk/', tip: 'Soft th sound: mah-nuh-LITH-ik' },
    ],
    tips: 'Maintain natural rhythm. Pause at commas for 0.5s and periods for 1s. Do not rush through technical jargon.',
  },
  {
    id: 'spk-2',
    type: 'Read-Aloud & Sentence Mastery',
    title: 'Client Communication & Problem Solving',
    category: 'Voice Modulation & Clarity',
    targetPace: '135 – 150 words per minute',
    audioText: `Good communication in software engineering is just as critical as writing clean code. When explaining complex architectural bottlenecks or security vulnerabilities to business stakeholders, engineers must translate technical jargon into quantifiable business impact, such as latency reduction, cost optimization, and user retention.`,
    phoneticFocus: [
      { word: 'Vulnerabilities', phonetic: '/ˌvʌlnərəˈbɪlətiz/', tip: 'vul-nuh-ruh-BIL-ih-teez' },
      { word: 'Quantifiable', phonetic: '/ˈkwɒntɪfaɪəbl/', tip: 'KWAN-tih-fye-uh-bul' },
      { word: 'Stakeholders', phonetic: '/ˈsteɪkhoʊldərz/', tip: 'STAYK-hohl-derz' },
    ],
    tips: 'Emphasize key verbs (translate, achieve, optimize) to sound assertive and authoritative.',
  },
  {
    id: 'spk-3',
    type: 'Extempore (JAM - Just A Minute)',
    title: 'Impact of Generative AI on Entry-Level Engineering Careers',
    category: 'Spontaneous Speaking',
    prepTime: '30 Seconds',
    speakingTime: '60 Seconds',
    overview: 'Frequently asked in Versant, AMCAT, Wipro, and TCS Digital speaking rounds. Tests structured spontaneous delivery without filler words (uh, um, like).',
    bulletStructure: [
      'Introduction: Define AI as an engineering accelerator rather than a replacement.',
      'Core Argument 1: AI automates boilerplate code, requiring developers to focus on architecture, logic, and security.',
      'Core Argument 2: Human creativity, domain knowledge, and ethical validation remain irreplaceable.',
      'Conclusion: Engineers who learn to pair-program with AI will outperform those who resist adoption.',
    ],
    idealScript: `Generative AI is fundamentally reshaping modern software engineering from syntax generation to high-level system design. Rather than replacing entry-level developers, AI tools like Copilot are acting as productivity accelerators by automating repetitive boilerplate code and standard unit tests.

Consequently, the core expectation for fresh engineering graduates is shifting. Memorizing syntax is no longer sufficient; instead, recruiters prioritize problem-solving, architectural thinking, API security, and the ability to critically validate AI-generated logic. 

In conclusion, AI will not replace software engineers, but software engineers who master AI-assisted workflows will inevitably replace those who do not.`,
    fillerWordWatchlist: ['Basically', 'You know', 'Like', 'Actually', 'Um / Uh'],
  },
  {
    id: 'spk-4',
    type: 'Extempore (JAM - Just A Minute)',
    title: 'Hybrid Work Culture: Remote Flexibility vs Office Collaboration',
    category: 'Spontaneous Speaking',
    prepTime: '30 Seconds',
    speakingTime: '60 Seconds',
    overview: 'Tests balanced reasoning, structured pros-and-cons presentation, and professional perspective.',
    bulletStructure: [
      'Introduction: Hybrid work as the new post-pandemic enterprise standard.',
      'Benefit of Remote: Deep focus time, reduced commute fatigue, and higher developer productivity.',
      'Benefit of Office: Spontaneous whiteboarding, team culture, and rapid fresher mentorship.',
      'Conclusion: Hybrid model offers the golden mean for sustainable engineering performance.',
    ],
    idealScript: `The global corporate landscape has evolved significantly toward the hybrid work model, balancing individual flexibility with collaborative synergy. 

On one hand, remote work eliminates long commuting hours, granting engineers dedicated blocks of uninterrupted deep-work time for complex coding and algorithm design. On the other hand, in-person office days are vital for spontaneous architectural whiteboarding, cross-team brainstorming, and essential mentorship for campus freshers.

Therefore, an optimal 3-days in office and 2-days remote model provides the ideal equilibrium, driving high employee satisfaction alongside robust organizational teamwork.`,
    fillerWordWatchlist: ['Kind of', 'Sort of', 'Literally', 'I mean'],
  },
  {
    id: 'spk-5',
    type: 'Story Retelling & Scenario Explanation',
    title: 'Explaining a Production Bug to a Non-Technical Manager',
    category: 'Client Empathy & Translation',
    prepTime: '45 Seconds',
    speakingTime: '90 Seconds',
    overview: 'Tests your ability to de-escalate crisis, eliminate jargon, and explain technical causality in clear business terms.',
    bulletStructure: [
      'The Incident: What went wrong from the customer’s perspective.',
      'The Cause: Analogy-based explanation without confusing code terms.',
      'The Immediate Fix: What the team did to restore operations.',
      'Long-Term Prevention: Automated safeguards established.',
    ],
    idealScript: `Earlier today at 10 AM, our payment processing page experienced a 15-minute slowdown, affecting approximately 200 customer transactions. 

To give a simple analogy: imagine a four-lane highway where suddenly three lanes are blocked by maintenance work, causing a traffic backlog. In our application, our third-party banking verification service was taking 10 times longer than usual to respond, causing pending requests to queue up on our server.

Our team immediately rerouted all traffic to our secondary backup payment gateway, fully resolving customer checkout delays within 12 minutes. Moving forward, we have added automatic circuit-breakers that will instantly divert traffic without any human intervention whenever a vendor experiences lag.`,
    fillerWordWatchlist: ['Bro', 'Stuff', 'Things', 'So yeah'],
  },
];

// ── GET /api/interview-bank ──────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category, type, search } = req.query;

  let hrList = [...HR_QUESTIONS];
  let spkList = [...SPEAKING_ASSESSMENTS];

  if (category && category !== 'All') {
    hrList = hrList.filter((q) => q.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (type && type !== 'All') {
    spkList = spkList.filter((s) => s.type.toLowerCase().includes(type.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    hrList = hrList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sampleAnswer.toLowerCase().includes(q)
    );
    spkList = spkList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.audioText && item.audioText.toLowerCase().includes(q)) ||
        (item.idealScript && item.idealScript.toLowerCase().includes(q))
    );
  }

  res.json({
    status: 'ok',
    data: {
      hrQuestions: hrList,
      speakingAssessments: spkList,
      totalCount: hrList.length + spkList.length,
      categories: [
        'All',
        'Self Introduction & Foundation',
        'Strengths & Self-Awareness',
        'Situational & Conflict Resolution',
        'Company Fit & Motivation',
        'Career Goals & Commitment',
        'Workplace Adaptability & Relocation',
        'Failure & Resilience',
      ],
      speakingTypes: [
        'All',
        'Read-Aloud & Sentence Mastery',
        'Extempore (JAM - Just A Minute)',
        'Story Retelling & Scenario Explanation',
      ],
    },
  });
});

// ── POST /api/interview-bank/evaluate-speech ─────────────────────────────────
// Analyzes student practice answer text or transcript for HR & Speaking feedback
router.post('/evaluate-speech', (req, res) => {
  const { practiceText, questionId, targetType } = req.body;

  if (!practiceText || practiceText.trim().length < 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide at least 20 words for AI speech and content analysis.',
    });
  }

  const text = practiceText.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Detect filler words
  const fillers = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'literally', 'kind of', 'sort of', 'i mean'];
  let fillerCount = 0;
  const lowerText = text.toLowerCase();
  fillers.forEach((f) => {
    const regex = new RegExp(`\\b${f}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) fillerCount += matches.length;
  });

  // Calculate metrics
  const fillerRatio = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;
  const clarityScore = Math.max(30, Math.min(98, Math.round(95 - fillerRatio * 5 + (wordCount >= 60 ? 5 : -10))));
  const paceScore = wordCount >= 70 && wordCount <= 160 ? 92 : wordCount >= 40 ? 78 : 62;

  // Structural checks for STAR
  const hasSituation = /(during|when|in my|at jeppiaar|while working|project)/i.test(text);
  const hasAction = /(i implemented|i created|i built|i designed|i optimized|i led|i decided)/i.test(text);
  const hasResult = /(result|reduced|increased|achieved|improved|delivered|velocity|accuracy|passed)/i.test(text);

  let starScore = 0;
  if (hasSituation) starScore += 33;
  if (hasAction) starScore += 34;
  if (hasResult) starScore += 33;

  const overallScore = Math.round(clarityScore * 0.4 + paceScore * 0.3 + (targetType === 'hr' ? starScore : clarityScore) * 0.3);

  const strengths = [];
  const improvements = [];

  if (fillerCount === 0) strengths.push('Excellent fluency: Zero filler words detected.');
  else if (fillerCount <= 2) strengths.push('Clean delivery: Minimal filler word usage.');
  else improvements.push(`Reduce filler words: Detected ${fillerCount} filler word(s) (${fillers.filter(f => lowerText.includes(f)).slice(0, 3).join(', ')}). Practice pausing silently instead of saying "um" or "like".`);

  if (wordCount >= 70 && wordCount <= 150) strengths.push('Optimal length: Answer fits the 60-90 second recruitment sweet spot.');
  else if (wordCount < 50) improvements.push('Answer is too brief: Expand on your technical action and measurable outcome.');
  else if (wordCount > 200) improvements.push('Answer is too lengthy: Avoid over-explaining and keep within 120-150 words.');

  if (targetType === 'hr') {
    if (hasAction && hasResult) strengths.push('Action-oriented: Clearly highlights personal contribution and outcome.');
    else improvements.push('Strengthen STAR structure: Clearly state your personal Action (what you built/did) and measurable Result (% improvement).');
  }

  res.json({
    status: 'ok',
    data: {
      overallScore,
      wordCount,
      fillerCount,
      clarityScore,
      paceScore,
      starScore: targetType === 'hr' ? starScore : 90,
      strengths: strengths.length ? strengths : ['Good baseline articulation and subject relevance.'],
      improvements: improvements.length ? improvements : ['Great response! Maintain this steady pace and confidence in live interviews.'],
      verdict: overallScore >= 80 ? 'Interview Ready (Strong Clear)' : overallScore >= 65 ? 'Good Foundation (Minor Refinements)' : 'Needs Practice (Structure & Pace)',
    },
  });
});

export default router;
