const express = require('express');
const router = express.Router();
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');

const driversController = require('../../controllers/driversController');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), driversController.getAllDrivers)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), driversController.createDriver)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), driversController.updateDriver)
    .delete(verifyRoles(ROLES_LIST.Admin), driversController.deleteDriver)

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), driversController.getDriver)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), driversController.updateDriver)
    .delete(verifyRoles(ROLES_LIST.Admin), driversController.deleteDriver)
module.exports = router;