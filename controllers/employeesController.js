const Employee = require('../model/employee');

const getAllEmployees = async (req, res) => {
    // find all employees
    const employees = await Employee.find();

    // employees not found
    if (employees.length === 0) return res.status(404).json({ 'message': 'no employees found for further reading' });

    // employees found
    res.json({ employees })
};


const getEmployee = async (req, res) => {
    // destruct id
    const { id } = req.params;

    try {
        // find employee
        const employee = await Employee.findOne({ _id: id }).exec();

        // employee not found
        if (!employee) {
            console.log('employee not found')
            return res.status(404).json({ 'message': `No employee found by id ${id} for further reading` });
        }
        // employee found
        return res.json(employee);
    } catch (err) {
        // server error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const updateEmployee = async (req, res) => {
    // destruct id
    const { id } = req.params;
    // no ID provided in API endpoint
    if (!id) return res.status(400).json({ 'message': 'provide a full API endpoint with employee id for further update' })
    // empty request body
    if (Object.keys(req.body).length < 1) return res.status(400).json({ 'message': 'request body is empty - nothing to update' })
 
    try {
        // find employee
        const employeeToUpdate = await Employee.findOne({ _id: id }).exec();
        // employee not found
        if (!employeeToUpdate) return res.status(404).json({ 'message': `No employee found by id ${id} for further update` });

        // update
        for (let field of Object.keys(req.body)) {
            employeeToUpdate[field] = req.body[field]
        }
        // save
        employeeToUpdate.save();

        return res.json(employeeToUpdate);
    } catch (err) {
        // server error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const deleteEmployee = async (req, res) => {
    // destruct id
    const { id } = req.params;

    // no ID provided in API endpoint
    if (!id) return res.status(400).json({ 'message': 'provide a full API endpoint with employee id for further deletion' });

    try {
        // find employee
        const employeeToDelete = await Employee.findOne({ _id: id }).exec();
        // employee not found
        if (!employeeToDelete) return res.status(404).json({ 'message': `No employee found by id ${id} for furthe deletion` });

        // delete employee
        await Employee.deleteOne({ _id: id });

        return res.status(200).json({ 'message': `Employee by id ${id} is deleted` });
    } catch (err) {
        // server error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
}


module.exports = {
    getAllEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
}