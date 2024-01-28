const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/employeesController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), employeeController.getAllEmployees)
    .put(verifyRoles(ROLES_LIST.Admin), employeeController.updateEmployee)
    .delete(verifyRoles(ROLES_LIST.Admin), employeeController.deleteEmployee)

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), employeeController.getEmployee)
    .put(verifyRoles(ROLES_LIST.Admin), employeeController.updateEmployee)
    .delete(verifyRoles(ROLES_LIST.Admin), employeeController.deleteEmployee)

module.exports = router;