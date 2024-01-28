const Employee = require('../model/employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    console.log('handleLogin')
    // extract the cookies from req.cookies
    const cookies = req.cookies;
    console.log(`cookies avaiable at`, JSON.stringify(cookies));
    // destruct username and password
    const { username, password } = req.body;

    // username or password not provided
    if (!username || !password) return res.status(400).json({ 'message': 'some of data is missing.' })

    // find employee by the username
    const foundEmployee = await Employee.findOne({ username }).exec();

    // employee not found
    if (!foundEmployee) return res.status(401).json({ 'message': `Employee by username ${username} is not found in the database` });

    // compare password with hashed password
    const match = await bcrypt.compare(password, foundEmployee.password);

    // correct username and password provided
    if (match) {
        // extract the values(roles) and stored them into the list
        const roles = Object.values(foundEmployee.roles).filter(Boolean);

        // create accessToken
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundEmployee.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "5m" }
        );

        // create refreshToken
        const newRefreshToken = jwt.sign(
            {
                "username": foundEmployee.username

            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        // Check for existing JWT in cookies (first login/new device || 1++ login/old device)
        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundEmployee.refreshToken
                : foundEmployee.refreshToken.filter(rt => rt !== cookies.jwt);
       console.log('newRefreshTokenArray', newRefreshTokenArray)
        // if JWT cookie exists, check its validity in the DB
        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const foundToken = await Employee.findOne({ refreshToken }).exec();
            // if JWT cookie doesn't exist in the database, clear the array of refresh tokens (indicating potential misuse)
            if (!foundToken) {
                newRefreshTokenArray = [];
            }
            // clear old JWT cookie
            // when you test backend with Thunder Client or Postman, comment or clear secure: true
            res.clearCookie('jwt', { httpOnly: true,  sameSite: 'none' }); // secure: true
        }

        // update employee refreshToken array and save the record
        foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundEmployee.save();
        console.log("result", result);

        // Set new JWT refreshToken to cookies
        // when you test backend with Thunder Client or Postman, comment or clear secure: true
        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 }); // secure: true, 

        // return new accessToken to the client
        return res.json({accessToken});
    } else {
        // incorrect password provided
        return res.status(401).json({ 'message': 'incorrect password, please try again' });
    }
}

module.exports = {
    handleLogin
}