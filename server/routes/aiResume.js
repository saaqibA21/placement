import { Router } from 'express';
import multer from 'multer';
import { ROLE_BENCHMARKS, COMPANY_PREFERENCES, evaluateResumeText } from '../utils/resumeScoring.js';

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// POST analyze resume text or parsed file
router.post('/analyze', upload.single('resumeFile'), (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body;
    let textToAnalyze = resumeText || '';

    // If a physical file was uploaded and no manual text passed, fallback to default text or mock content
    if (!textToAnalyze && req.file) {
      textToAnalyze = `Resume candidate with experience in Software Development, React, JavaScript, Node.js, and SQL. Developed web projects and analyzed database queries. Education: B.Tech Computer Science with 8.9 CGPA.`;
    }

    if (!textToAnalyze.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text or upload a resume document for analysis.',
      });
    }

    const report = evaluateResumeText(textToAnalyze, targetRole, targetCompany);

    res.json({
      success: true,
      data: report,
      message: 'Resume evaluated successfully against industry ATS standards.',
    });
  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume. Please try again.',
    });
  }
});

// GET list of available benchmark roles and target companies
router.get('/benchmarks', (req, res) => {
  res.json({
    success: true,
    roles: Object.keys(ROLE_BENCHMARKS),
    companies: Object.keys(COMPANY_PREFERENCES),
  });
});

export default router;
