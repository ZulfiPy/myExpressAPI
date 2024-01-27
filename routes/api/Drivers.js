const express = require('express');
const router = express.Router();

const driversController = require('../../controllers/driversController');

router.route('/')
    .get(driversController.getAllDrivers)
    .post(driversController.createDriver)
    .put(driversController.updateDriver)
    .delete(driversController.deleteDriver)

router.route('/:id')
    .get(driversController.getDriver)
    .put(driversController.updateDriver)
    .delete(driversController.deleteDriver)
module.exports = router;