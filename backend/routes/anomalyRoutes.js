const express = require('express');
const router = express.Router();

const anomalyController = require('../controllers/anomalyController'); 

router.post('/anomaly-detection', anomalyController.detectAnomaly);

router.post('/failure-prediction', anomalyController.predictFailure);

module.exports = router;