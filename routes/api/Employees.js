const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/employeesController');

router.route('/')
    .get(employeeController.getAllEmployees)
    .put(employeeController.updateEmployee)
    .delete(employeeController.deleteEmployee)

router.route('/:id')
    .get(employeeController.getEmployee)
    .put(employeeController.updateEmployee)
    .delete(employeeController.deleteEmployee)

module.exports = router;