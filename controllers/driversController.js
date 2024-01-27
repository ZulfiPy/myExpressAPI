const Driver = require('../model/driver');

const getAllDrivers = async (req, res) => {
    // find all drivers
    const drivers = await Driver.find();

    // no drivers found
    if (drivers.length === 0) return res.status(404).json({ 'message': 'No drivers found' });

    // found
    return res.json(drivers);
}

const createDriver = async (req, res) => {
    const requiredFields = ['firstname', 'lastname', 'isikukood', 'driverLicenseNumber', 'address', 'email', 'phone'];

    // check if some of required fields are missing
    for (let field of requiredFields) {
        if (!req?.body?.[field]) {
            return res.status(400).json({ 'message': `${field} is missing` })
        }
    }

    // destruct the data from body
    const { firstname, lastname, isikukood, driverLicenseNumber, address, email, phone, vehicle } = req.body;

    // create record in the database
    try {
        const result = await Driver.create({
            firstname,
            lastname,
            isikukood,
            driverLicenseNumber,
            address,
            email,
            phone,
            vehicle
        });

        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}

const getDriver = async (req, res) => {
    const {id} = req.params;

    try {
        // find driver
        const driver = await Driver.findOne({ _id: id });

        // driver not found
        if (!driver) return res.status(404).json({ 'message': 'driver not found. check the provided id' });

        // driver found
        return res.json(driver);
    } catch (err) {
        // Server Error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const updateDriver = async (req, res) => {
    // destruct id
    const { id } = req.params;
    // no id provided in API endpoint
    if (!id) return res.status(400).json({ 'message': 'provide full API endpoint with driver id for further updating' });

    // no body provided(empty)
    if (!req?.body || Object.keys(req.body).length === 0) return res.status(400).json({ 'message': `the body of your request is empty - req.body: ${req.body.firstname}` });

    try {
        // find driver
        const driverToUpdate = await Driver.findOne({ _id: id }).exec();

        // driver not found
        if (!driverToUpdate) return res.status(404).json({ 'message': `driver not found by provided id ${id}` });

        // driver found
        for (key of Object.keys(req.body)) {
            driverToUpdate[key] = req.body[key]
        }
        // save update record to the database
        driverToUpdate.save();
        return res.json({ 'message': driverToUpdate });
    } catch (err) {
        // server error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const deleteDriver = async (req, res) => {
    // desctruct id
    const { id } = req.params;
    // no id provided in API endpoint
    if (!id) return res.status(400).json({ 'message': 'provide full API endpoint with driver id for further deletion' });

    try {
        // find driver
        const driverToDelete = await Driver.findOne({ _id: id });

        // driver not found
        if (!driverToDelete) return res.status(404).json({ 'message': `driver not found with provided id ${id}` });
        
        // driver found and deleted
        await Driver.deleteOne({ _id: id });
        return res.json({ 'message': `driver deleted with id ${id}` });
    } catch (err) {
        // server error
        console.error(err);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

module.exports = {
    getAllDrivers,
    createDriver,
    getDriver,
    updateDriver,
    deleteDriver
}