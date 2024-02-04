const Employee = require('../model/employee');

const handleLogout = async (req, res) => {
    // extract the cookies
    const cookies = req?.cookies;
    console.log('cookies for logout', cookies)
    // check if the jwt stored into the cookie
    if (!cookies.jwt) return res.status(204).json({'message': "you don't have any cookies stored"});
    // stored the jwt cookie
    const refreshToken = cookies?.jwt;
    
    // find employee with refresh token gathered from cookie
    const foundEmployee = await Employee.findOne({ refreshToken }).exec();
    
    // not found employee
    if (!foundEmployee) {
        // clear the cookie
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // , secure: true
        return res.status(204).json({ 'message': 'no employee found by the stored jwt cookie' });
    }

    // filter out the old refresh token from record and save it
    foundEmployee.refreshToken = foundEmployee.refreshToken.filter(rt => rt != cookies.jwt);
    const result = await foundEmployee.save();

    // clear the cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // , secure: true

    return res.json({ "message": "jwt cookie cleared. employee record updated." });
}

module.exports = {
    handleLogout
}