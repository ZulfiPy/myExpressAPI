const Employee = require('../model/employee');
const bcrypt = require('bcrypt');

const registerEmployee = async (req, res ) => {
    const { username, password, firstname, lastname, birthDate, roles } = req.body;
    const requiredFields = ['username', 'password', 'firstname', 'lastname', 'birthDate'];

    for (let field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ 'message': `${field} is missing` })
        }
    }

    const duplicate = await Employee.findOne({ username }).exec();
    if (duplicate) return res.status(409).json({ 'message': 'Username is taken' });

    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        
        const newEmployee = await Employee.create({
            username,
            "password": hashedPwd,
            firstname,
            lastname,
            birthDate,
            roles
        });

        return res.json(newEmployee);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 'message':  'Internal Server Error'});
    }
}

module.exports = {
    registerEmployee
}