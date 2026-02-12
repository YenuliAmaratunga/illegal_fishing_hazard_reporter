const express = require('express');
const router = express.Router();
const Checklist = require('../models/Checklist');
const { validateChecklist } = require('../controllers/checklistController');

// Placeholder for your actual QR generator
async function generateQR(checklist) {
  // Replace this with actual QR generation logic
  console.log('✅ Generating QR for checklist:', checklist._id);
}

router.post('/submit-checklist', async (req, res) => {
  try {
    const checklistData = req.body;

    // Validate input
    const isValid = validateChecklist(checklistData);
    checklistData.status = isValid ? 'Approved' : 'Rejected';

    // Calculate a dummy riskScore (you can customize this later)
    checklistData.riskScore = Math.random() * 100;

    // Save to DB
    const checklist = new Checklist(checklistData);
    await checklist.save();

    // If approved, generate QR
    if (checklist.status === 'Approved') {
      await generateQR(checklist); // Your QR function goes here
    }

    res.status(200).json({
      message: `Checklist ${checklist.status.toLowerCase()}`,
      status: checklist.status,
      checklistId: checklist._id,
    });
  } catch (error) {
    console.error('❌ Error submitting checklist:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
