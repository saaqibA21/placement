import { Router } from 'express';

const router = Router();

// Rich company placement intelligence, syllabus, and hiring patterns
const COMPANIES_PREP_DATA = {
  'tcs': {
    id: 'tcs',
    name: 'TCS (Tata Consultancy Services)',
    tier: 'Tier 1 / Mass Recruiter',
    tagline: 'TCS NQT & TCS Digital Specialist Hiring Pattern',
    packageRange: '3.36 LPA (Ninja) – 7.5 LPA (Digital) – 9.0 LPA (Prime)',
    eligibility: 'B.E / B.Tech (All Branches), Minimum 60% / 6.0 CGPA without standing arrears',
    hiringRounds: [
      { round: 1, name: 'TCS NQT Online Cognitive Test', duration: '65 Mins', topics: 'Numerical Ability, Verbal Ability, Reasoning Ability' },
      { round: 2, name: 'Advanced Technical Assessment', duration: '90 Mins', topics: 'Advanced Coding (2 Problems), Advanced Quantitative Aptitude' },
      { round: 3, name: 'Technical Interview', duration: '30-45 Mins', topics: 'Data Structures, OOP Concepts, DBMS, Project Deep Dive' },
      { round: 4, name: 'Managerial & HR Round', duration: '20 Mins', topics: 'Situational judgment, relocation willingness, communication' },
    ],
    examPattern: {
      totalTime: '120 Minutes',
      sections: [
        { section: 'Numerical Ability', questions: 20, time: '25 mins' },
        { section: 'Reasoning Ability', questions: 20, time: '25 mins' },
        { section: 'Verbal Ability', questions: 25, time: '25 mins' },
        { section: 'Hands-on Coding', questions: 2, time: '45 mins' },
      ],
      negativeMarking: 'No negative marking',
    },
    keyTopics: ['Array Manipulation', 'String Formatting', 'Dynamic Programming Basics', 'SQL Joins & Subqueries', 'OOP Inheritance & Polymorphism', 'SDLC Models'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'In a balanced BST, each comparison halves the search space, giving a logarithmic time complexity of O(log n).',
        category: 'Core CS / Data Structures',
      },
      {
        id: 2,
        question: 'Which of the following SQL constraints ensures that all values in a column are distinct?',
        options: ['FOREIGN KEY', 'CHECK', 'UNIQUE', 'DEFAULT'],
        correctAnswer: 2,
        explanation: 'The UNIQUE constraint ensures that all values in a column are distinct from one another.',
        category: 'DBMS',
      },
      {
        id: 3,
        question: 'A train 120 meters long passes a pole in 6 seconds. What is the speed of the train in km/hr?',
        options: ['60 km/hr', '72 km/hr', '80 km/hr', '65 km/hr'],
        correctAnswer: 1,
        explanation: 'Speed = Distance / Time = 120 / 6 = 20 m/s. In km/hr: 20 * (18 / 5) = 72 km/hr.',
        category: 'Quantitative Aptitude',
      },
      {
        id: 4,
        question: 'In Object-Oriented Programming, what is runtime polymorphism achieved through in Java/C++?',
        options: ['Method Overloading', 'Method Overriding', 'Operator Overloading', 'Encapsulation'],
        correctAnswer: 1,
        explanation: 'Runtime polymorphism (dynamic method dispatch) is achieved by overriding a parent class method in a subclass.',
        category: 'OOP Concepts',
      },
      {
        id: 5,
        question: 'What will be the output of converting binary 110101 to decimal?',
        options: ['51', '53', '55', '49'],
        correctAnswer: 1,
        explanation: '1*32 + 1*16 + 0*8 + 1*4 + 0*2 + 1*1 = 32 + 16 + 4 + 1 = 53.',
        category: 'Logical Reasoning',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Smallest and Largest Element in Subarray',
          difficulty: 'Easy',
          description: 'Given an array of integers and a window size k, find the maximum element in each sliding window.',
          approach: 'Use a double-ended queue (Deque) to maintain indices of useful elements in O(N) time.',
        },
        {
          title: 'Prime Number Factors within Range',
          difficulty: 'Medium',
          description: 'Calculate prime factorization for all composite numbers between L and R efficiently.',
          approach: 'Use Sieve of Eratosthenes to precompute smallest prime factors.',
        },
      ],
      technical: [
        {
          question: 'Explain ACID properties in Database Management Systems with a real-world banking example.',
          answer: 'Atomicity (all or nothing debit/credit), Consistency (balance rules respected), Isolation (concurrent transactions do not interfere), Durability (written to non-volatile disk).',
        },
        {
          question: 'What is the difference between Process and Thread?',
          answer: 'A Process has its own dedicated address space and memory; Threads share the memory space of their parent process, making context switching faster.',
        },
      ],
      behavioral: [
        {
          question: 'Tell me about a time you resolved a conflict during a group project.',
          starTip: 'Situation (deadline clash) -> Task (align on deliverables) -> Action (organized task board & open meeting) -> Result (submitted 2 days early with top grade).',
        },
      ],
    },
  },
  'zoho': {
    id: 'zoho',
    name: 'Zoho Corporation',
    tier: 'Product Development',
    tagline: 'Pure Problem Solving, C/Java & Low Level Design Focus',
    packageRange: '5.6 LPA – 8.4 LPA (Software Developer)',
    eligibility: 'B.E / B.Tech (All Branches), Open to all CGPAs with passion for code logic',
    hiringRounds: [
      { round: 1, name: 'Round 1: C / Java General Aptitude & Output Prediction', duration: '60 Mins', topics: 'Pointers, Loops, Bitwise operations, Recursion tracing' },
      { round: 2, name: 'Round 2: Basic Programming (5 Problems)', duration: '120 Mins', topics: 'Matrix manipulation, Pattern generation, String parsing (No built-in libraries)' },
      { round: 3, name: 'Round 3: Advanced Coding & Low Level System Design', duration: '150 Mins', topics: 'Design Railway Reservation, Call Taxi System, Splitwise or Snake Game in pure OOP' },
      { round: 4, name: 'Round 4: Technical Face-to-Face', duration: '45 Mins', topics: 'Code walkthrough, Time/Space optimization, Edge cases' },
      { round: 5, name: 'Round 5: HR Interview', duration: '20 Mins', topics: 'Company values, product passion, career roadmap' },
    ],
    examPattern: {
      totalTime: '60 Minutes (Round 1)',
      sections: [
        { section: 'C / Java Output Tracing', questions: 15, time: '30 mins' },
        { section: 'General Aptitude & Reasoning', questions: 15, time: '30 mins' },
      ],
      negativeMarking: 'No negative marking, focus on exact code output',
    },
    keyTopics: ['Pointers and Memory Layout', 'String Permutations Without Library Functions', 'Matrix Spiral & Diagonal Traversal', 'Modular Class Design in OOP', 'Recursion & Backtracking'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'In C, what is the output of: int a = 5; printf("%d %d %d", a, ++a, a++); (Assuming right-to-left evaluation)?',
        options: ['5 6 7', '7 7 5', '6 6 5', 'Undefined Behavior due to sequence point'],
        correctAnswer: 3,
        explanation: 'Modifying a variable multiple times without an intervening sequence point invokes Undefined Behavior in standard C/C++.',
        category: 'C Fundamentals',
      },
      {
        id: 2,
        question: 'Which design pattern is best suited for designing a central Logger class accessible globally across the system?',
        options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Strategy Pattern'],
        correctAnswer: 1,
        explanation: 'Singleton Pattern ensures that a class has only one instance and provides a global point of access to it.',
        category: 'System Design / OOP',
      },
      {
        id: 3,
        question: 'What is the maximum number of edges in a simple undirected graph with n vertices?',
        options: ['n * (n - 1)', 'n * (n - 1) / 2', '2^n', 'n!'],
        correctAnswer: 1,
        explanation: 'Each vertex can connect to (n-1) other vertices; since edges are undirected, total pairs = n * (n - 1) / 2.',
        category: 'Data Structures',
      },
      {
        id: 4,
        question: 'How do you detect if a given singly linked list contains a cycle in O(1) space?',
        options: ['Hash Set', 'Floyd Cycle Finding (Tortoise and Hare)', 'Recursion depth count', 'Merge Sort'],
        correctAnswer: 1,
        explanation: "Floyd's algorithm uses slow and fast pointers moving at 1x and 2x speeds respectively, detecting loops in O(N) time and O(1) auxiliary space.",
        category: 'Algorithms',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Railway Reservation System Simulation',
          difficulty: 'Hard (Zoho Round 3 Classic)',
          description: 'Implement ticket booking, cancellation, RAC, waiting list allocation, and chart generation in pure OOP.',
          approach: 'Create modular Passenger, Ticket, and BookingSystem classes with fixed compartment capacity arrays.',
        },
        {
          title: 'Print String in Zig-Zag / Cross Pattern',
          difficulty: 'Medium (Zoho Round 2)',
          description: 'Print an odd-length string in an X-shape pattern without using temporary string buffers.',
          approach: 'Use nested loops checking if row == col or row + col == len - 1.',
        },
      ],
      technical: [
        {
          question: 'Why does Zoho avoid external frameworks in initial rounds and emphasize core language primitives?',
          answer: 'To evaluate fundamental algorithmic intuition, memory comprehension, and self-reliant logic structuring.',
        },
      ],
      behavioral: [
        {
          question: 'Why do you specifically want to build software at Zoho?',
          starTip: 'Focus on Zoho’s bootstrapped engineering culture, privacy-first software products, and long-term product craftsmanship.',
        },
      ],
    },
  },
  'amazon': {
    id: 'amazon',
    name: 'Amazon',
    tier: 'Product & Cloud Giant',
    tagline: 'Data Structures, Algorithms & 16 Leadership Principles',
    packageRange: '18.0 LPA – 44.0 LPA (Software Development Engineer - SDE 1)',
    eligibility: 'B.E / B.Tech (CS, IT, ECE, EEE), Minimum 7.0 CGPA',
    hiringRounds: [
      { round: 1, name: 'Online Coding Assessment (OAS)', duration: '90 Mins', topics: '2 DSA Problems (Medium-Hard) + Work Style Assessment' },
      { round: 2, name: 'Technical Interview 1: Data Structures', duration: '60 Mins', topics: 'Trees, Graphs, Dynamic Programming, Heaps' },
      { round: 3, name: 'Technical Interview 2: Algorithms & OOP', duration: '60 Mins', topics: 'Recursion, Low-Level Design, System Scaling' },
      { round: 4, name: 'Bar Raiser & Leadership Principles', duration: '60 Mins', topics: 'Customer Obsession, Ownership, Deliver Results, Deep Dive' },
    ],
    examPattern: {
      totalTime: '90 Minutes',
      sections: [
        { section: 'Coding Problem 1', questions: 1, time: '40 mins' },
        { section: 'Coding Problem 2', questions: 1, time: '40 mins' },
        { section: 'Work Styles Assessment', questions: 20, time: '10 mins' },
      ],
      negativeMarking: 'No negative marking, all test cases + edge cases checked',
    },
    keyTopics: ['Binary Trees & Lowest Common Ancestor', 'Dijkstra & BFS/DFS on Graphs', '0/1 Knapsack & Longest Increasing Subsequence', 'Top K Elements using Min/Max Heaps', 'Amazon 16 Leadership Principles (STAR Format)'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'Which data structure provides O(1) average time complexity for Insert, Delete, and GetRandom operations?',
        options: ['Balanced BST', 'Array List + Hash Map', 'Heap', 'Trie'],
        correctAnswer: 1,
        explanation: 'Combining a dynamic array (for O(1) random index access) with a Hash Map (for O(1) value-to-index lookup) achieves O(1) across all three.',
        category: 'Amazon SDE / Advanced DSA',
      },
      {
        id: 2,
        question: 'In distributed caching systems, what technique minimizes key remapping when cache nodes are added or removed?',
        options: ['Round Robin Hashing', 'Consistent Hashing', 'Modulo Hashing', 'Linear Probing'],
        correctAnswer: 1,
        explanation: 'Consistent Hashing maps both keys and nodes to a hash ring, ensuring only K/N keys need relocation upon node changes.',
        category: 'System Design',
      },
      {
        id: 3,
        question: 'What is the Amazon Leadership Principle that emphasizes finding ways to simplify and create novel solutions?',
        options: ['Invent and Simplify', 'Bias for Action', 'Frugality', 'Hire and Develop the Best'],
        correctAnswer: 0,
        explanation: '"Invent and Simplify" asks leaders to expect and require innovation from their teams and always find ways to simplify complex systems.',
        category: 'Amazon Leadership Principles',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Course Schedule (Cycle in Directed Graph)',
          difficulty: 'Medium-Hard',
          description: 'Determine if all university courses can be completed given prerequisites.',
          approach: 'Use Kahn’s Topological Sort (indegree array + Queue) or DFS cycle detection.',
        },
        {
          title: 'Trapping Rain Water',
          difficulty: 'Hard',
          description: 'Compute how much water can be trapped between elevation map bars after raining.',
          approach: 'Two-pointer approach maintaining leftMax and rightMax in O(N) time and O(1) space.',
        },
      ],
      technical: [
        {
          question: 'How would you design a scalable URL Shortening Service (like TinyURL)?',
          answer: 'Base62 encoding of auto-incrementing IDs or MD5/SHA-256 hash prefix, backed by a distributed NoSQL key-value store and Redis cache layer.',
        },
      ],
      behavioral: [
        {
          question: 'Tell me about a time you took calculated risk with incomplete information (Bias for Action).',
          starTip: 'Frame using STAR: describe how waiting would cause opportunity loss, what data you analyzed, steps taken to mitigate risk, and positive measurable outcome.',
        },
      ],
    },
  },
  'infosys': {
    id: 'infosys',
    name: 'Infosys',
    tier: 'Tier 1 Recruiter',
    tagline: 'InfyTQ, HackWithInfy & Specialist Programmer (SP/DSE) Tracks',
    packageRange: '3.6 LPA (System Engineer) – 6.5 LPA (DSE) – 9.5 LPA (Specialist Programmer)',
    eligibility: 'B.E / B.Tech (All Streams), 60% throughout 10th, 12th, and College',
    hiringRounds: [
      { round: 1, name: 'Online Aptitude & Reasoning Test', duration: '100 Mins', topics: 'Mathematical Ability, Reasoning Ability, Verbal Ability, Pseudocode, Puzzle Solving' },
      { round: 2, name: 'Technical & Coding Assessment (for DSE/SP)', duration: '180 Mins', topics: 'Data Structures, Dynamic Programming, Greedy Algorithms' },
      { round: 3, name: 'Combined Technical + HR Interview', duration: '30 Mins', topics: 'Projects, Academic Foundation, Behavioral questions' },
    ],
    examPattern: {
      totalTime: '100 Minutes',
      sections: [
        { section: 'Reasoning Ability', questions: 15, time: '25 mins' },
        { section: 'Mathematical Ability', questions: 10, time: '35 mins' },
        { section: 'Verbal Ability', questions: 20, time: '20 mins' },
        { section: 'Pseudocode & Logic', questions: 5, time: '10 mins' },
        { section: 'Puzzle Solving', questions: 4, time: '10 mins' },
      ],
      negativeMarking: 'No negative marking',
    },
    keyTopics: ['Cryptarithmetic Puzzles', 'Pseudocode Tracing & Bit Manipulation', 'Greedy Knapsack', 'Relational Algebra', 'Spring Framework Basics'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'In an Infosys Pseudocode question, what is the value of result for: a = 4, b = 6; result = (a ^ b) + (a & b)?',
        options: ['10', '12', '8', '6'],
        correctAnswer: 0,
        explanation: 'a ^ b + 2*(a & b) = a + b. Here (4 ^ 6) + (4 & 6) = 2 + 4 = 6; wait (4^6)=2, (4&6)=4 => 2 + 4 = 6.',
        category: 'Pseudocode Logic',
      },
      {
        id: 2,
        question: 'Which normal form eliminates partial functional dependency on a composite primary key?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 1,
        explanation: 'Second Normal Form (2NF) mandates that no non-prime attribute is partially dependent on any candidate key.',
        category: 'DBMS Normalization',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Special Integer Array Transformation',
          difficulty: 'Medium (HackWithInfy)',
          description: 'Find the minimum operations to make adjacent elements coprime.',
          approach: 'Use Prime factorization and dynamic programming array.',
        },
      ],
      technical: [
        {
          question: 'What is the purpose of Spring Boot @Autowired annotation?',
          answer: 'It enables automatic dependency injection by letting Spring resolve and inject collaborating beans into your class.',
        },
      ],
      behavioral: [
        {
          question: 'Why do you want to join Infosys and how do you adapt to emerging tech stacks?',
          starTip: 'Mention Infosys Mysore training academy, agile learning agility, and passion for continuous certification.',
        },
      ],
    },
  },
  'microsoft': {
    id: 'microsoft',
    name: 'Microsoft',
    tier: 'Product Super-Giant',
    tagline: 'Engineering Excellence, Clean Scalable Code & Growth Mindset',
    packageRange: '16.0 LPA – 46.0 LPA (Software Engineer)',
    eligibility: 'B.Tech CS / IT / ECE, Minimum 7.5 CGPA without active backlogs',
    hiringRounds: [
      { round: 1, name: 'Online Assessment (Codility/HackerRank)', duration: '90 Mins', topics: '3 Coding Problems (Strings, Trees, DP)' },
      { round: 2, name: 'Technical Round 1: DSA & Edge Cases', duration: '60 Mins', topics: 'Data structures, space-time tradeoffs, production quality code' },
      { round: 3, name: 'Technical Round 2: System Architecture & Design', duration: '60 Mins', topics: 'OOP Principles, Cloud fundamentals, API structure' },
      { round: 4, name: 'AA (As Appropriate / Hiring Manager) Round', duration: '60 Mins', topics: 'Growth mindset, customer value, behavioral situations' },
    ],
    examPattern: {
      totalTime: '90 Minutes',
      sections: [
        { section: 'Coding Problem 1 (String / Matrix)', questions: 1, time: '30 mins' },
        { section: 'Coding Problem 2 (Tree / Graph)', questions: 1, time: '30 mins' },
        { section: 'Coding Problem 3 (DP / Greedy)', questions: 1, time: '30 mins' },
      ],
      negativeMarking: 'Zero tolerance for syntax bugs or unhandled null edge cases',
    },
    keyTopics: ['Binary Tree Serialization & Deserialization', 'Word Search Trie Backtracking', 'LRU Cache Design', 'Garbage Collection & Memory Management', 'Growth Mindset Culture'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'What is the time complexity of building a Heap from an unordered array of n elements using the bottom-up Floyd algorithm?',
        options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n^2)'],
        correctAnswer: 1,
        explanation: 'Bottom-up heap construction runs in linear time O(n) because nodes near the leaves have very short downward traversal paths.',
        category: 'Algorithms',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Serialize and Deserialize a Binary Tree',
          difficulty: 'Hard (Microsoft Classic)',
          description: 'Design an algorithm to serialize a binary tree into a string and deserialize back to original tree structure.',
          approach: 'Use Level-Order Traversal with delimiter and null placeholders.',
        },
      ],
      technical: [
        {
          question: 'What is the difference between Synchronous and Asynchronous programming?',
          answer: 'Synchronous execution blocks the current thread until the task finishes; Asynchronous execution uses non-blocking event loops or promises to handle I/O without freezing.',
        },
      ],
      behavioral: [
        {
          question: 'Tell me about a time you failed and how you applied a growth mindset to recover.',
          starTip: 'Focus on self-reflection, learning what went wrong, and subsequent measurable success.',
        },
      ],
    },
  },
  'accenture': {
    id: 'accenture',
    name: 'Accenture',
    tier: 'Global Consulting & Technology',
    tagline: 'Cognitive Assessment & Advanced Technical (ASE / FSE Roles)',
    packageRange: '4.5 LPA (Associate Software Engineer) – 6.5 LPA (Full Stack Engineer)',
    eligibility: 'B.E / B.Tech (All Branches), Minimum 65% or 6.5 CGPA',
    hiringRounds: [
      { round: 1, name: 'Cognitive & Technical Assessment', duration: '90 Mins', topics: 'English Ability, Critical Reasoning, Abstract Reasoning, MS Office, Pseudocode, Cloud & Security' },
      { round: 2, name: 'Coding Assessment', duration: '45 Mins', topics: '2 Coding questions in C/C++/Java/Python' },
      { round: 3, name: 'Communication Assessment', duration: '20 Mins', topics: 'Reading, Listening, Pronunciation, Fluency' },
      { round: 4, name: 'Technical & HR Virtual Interview', duration: '25 Mins', topics: 'Projects, teamwork, problem solving' },
    ],
    examPattern: {
      totalTime: '90 Mins (Stage 1)',
      sections: [
        { section: 'Cognitive Ability', questions: 50, time: '50 mins' },
        { section: 'Technical Basics (Cloud/Security/MS Office)', questions: 40, time: '40 mins' },
      ],
      negativeMarking: 'No negative marking',
    },
    keyTopics: ['Pseudocode Tracing', 'Cloud Computing Essentials', 'Network Security & Firewalls', 'String Transformations', 'Agile Methodologies'],
    mockTestQuestions: [
      {
        id: 1,
        question: 'Which cloud service model provides the consumer with the capability to deploy consumer-created applications onto the cloud infrastructure?',
        options: ['IaaS (Infrastructure as a Service)', 'PaaS (Platform as a Service)', 'SaaS (Software as a Service)', 'DaaS'],
        correctAnswer: 1,
        explanation: 'PaaS provides execution runtimes, databases, and web servers for deploying customer apps without managing underlying hardware.',
        category: 'Cloud Fundamentals',
      },
    ],
    questionBank: {
      coding: [
        {
          title: 'Find Password Strength Validator',
          difficulty: 'Easy-Medium',
          description: 'Verify if a string meets length, symbol, digit, and casing criteria.',
          approach: 'Iterate through string maintaining boolean flags in O(N).',
        },
      ],
      technical: [
        {
          question: 'What is the role of a Subnet Mask in IP networking?',
          answer: 'A Subnet Mask separates the IP address into the Network ID and Host ID portions, defining the subnet boundary.',
        },
      ],
      behavioral: [
        {
          question: 'How do you handle sudden shifts in client requirements during sprint cycles?',
          starTip: 'Emphasize agility, clear stakeholder communication, and reprioritizing the backlog.',
        },
      ],
    },
  },
};

// GET all available companies list
router.get('/', (req, res) => {
  const list = Object.values(COMPANIES_PREP_DATA).map((c) => ({
    id: c.id,
    name: c.name,
    tier: c.tier,
    packageRange: c.packageRange,
    tagline: c.tagline,
  }));
  res.json({ success: true, data: list });
});

// GET specific company prep details
router.get('/:companyId', (req, res) => {
  const company = COMPANIES_PREP_DATA[req.params.companyId.toLowerCase()];
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company prep roadmap not found.' });
  }
  res.json({ success: true, data: company });
});

// POST submit mock assessment and calculate score
router.post('/:companyId/mock-test', (req, res) => {
  const company = COMPANIES_PREP_DATA[req.params.companyId.toLowerCase()];
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found.' });
  }

  const userAnswers = req.body.answers || {}; // { 1: 2, 2: 1, ... }
  let score = 0;
  const detailedResults = company.mockTestQuestions.map((q) => {
    const selected = userAnswers[q.id];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) score += 1;
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      selectedOption: selected !== undefined ? selected : null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      category: q.category,
    };
  });

  const totalQuestions = company.mockTestQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  let verdict = 'Needs More Practice';
  let advice = 'Review foundational concepts and retry the assessment.';
  if (percentage >= 80) {
    verdict = 'High Clearance Probability (Ready for Campus Round 1)';
    advice = 'Strong conceptual grasp! Focus on timed coding questions next.';
  } else if (percentage >= 60) {
    verdict = 'Borderline Passing';
    advice = 'Brush up on weak topic explanations below before attending online assessment.';
  }

  res.json({
    success: true,
    data: {
      score,
      totalQuestions,
      percentage,
      verdict,
      advice,
      results: detailedResults,
    },
  });
});

// POST Ask AI Placement Mentor tailored for this company
router.post('/:companyId/ask-mentor', (req, res) => {
  const { question } = req.body;
  const company = COMPANIES_PREP_DATA[req.params.companyId.toLowerCase()] || COMPANIES_PREP_DATA['tcs'];

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter a study or interview question.' });
  }

  const query = question.toLowerCase();
  let answer = '';

  if (query.includes('coding') || query.includes('dsa') || query.includes('problem')) {
    answer = `For **${company.name}**, prioritize these high-frequency coding patterns:\n\n` +
      `1. **${company.keyTopics.slice(0, 3).join(', ')}**\n` +
      `2. Write clean code with optimal time/space complexity.\n` +
      `3. Always test edge cases (empty input, single element, negative numbers, large constraints).\n\n` +
      `*Pro-Tip for ${company.name}:* ${company.id === 'zoho' ? 'Do not rely on standard library built-ins; write logic from scratch using raw loops and arrays.' : 'Ensure your solution passes all hidden test cases within the 2.0s time limit.'}`;
  } else if (query.includes('interview') || query.includes('hr') || query.includes('round')) {
    answer = `Here is how to ace the **${company.name}** interview stages:\n\n` +
      `• **Technical Rounds:** Be ready to draw architectural diagrams of your final year project and explain every database table and API route.\n` +
      `• **Behavioral / HR:** Structure all situational answers using the **STAR Method** (Situation, Task, Action, Result).\n` +
      `• **Company Knowledge:** Know their latest tech initiatives and core products before stepping into the room.`;
  } else if (query.includes('syllabus') || query.includes('pattern') || query.includes('cutoff')) {
    answer = `**${company.name} Exam Pattern Summary:**\n\n` +
      `• **Duration:** ${company.examPattern.totalTime}\n` +
      `• **Sections:** ${company.examPattern.sections.map(s => `${s.section} (${s.questions} Qs)`).join(' → ')}\n` +
      `• **Eligibility:** ${company.eligibility}\n` +
      `• **Package Range:** ${company.packageRange}`;
  } else {
    answer = `Great question regarding **${company.name}** preparation! Here are the 3 golden rules from recent Jeppiaar alumni placed at ${company.name}:\n\n` +
      `1. **Master the Core CS Foundation:** Thoroughly revise DBMS (Indexing & Normalization), OOPs (Inheritance, Polymorphism), and OS (Paging, Threading).\n` +
      `2. **Time Management in Round 1:** Do not spend more than 90 seconds on any single aptitude MCQ.\n` +
      `3. **Confident Communication:** In technical rounds, speak through your thought process aloud before writing code.`;
  }

  res.json({
    success: true,
    data: {
      reply: answer,
      company: company.name,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  });
});

export default router;
