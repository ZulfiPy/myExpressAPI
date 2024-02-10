const Employee = require('../model/employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    console.log('handleLogin')

    // Extract cookies from the request, which may contain a JWT token from a previous session
    const cookies = req.cookies;
    console.log(`cookies avaiable at`, JSON.stringify(cookies));

    // destruct username and password
    const { username, password } = req.body;

    // Return a 400 Bad Request if username or password is not provided
    if (!username || !password) return res.status(400).json({ 'message': 'some of data is missing.' })

    // Find an employee in the database by the provided username
    const foundEmployee = await Employee.findOne({ username }).exec();

    // If the employee is not found, return a 401 Unauthorized status
    if (!foundEmployee) return res.status(401).json({ 'message': `Employee by username ${username} is not found in the database` });

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, foundEmployee.password);

    // If the password matches
    if (match) {
        // Extract roles from the employee's record
        const roles = Object.values(foundEmployee.roles).filter(Boolean);

        // Create an access token with the employee's username and roles, set to expire in 5 minutes
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

        // Create a refresh token with the employee's username, set to expire in 1 hour
        const newRefreshToken = jwt.sign(
            {
                "username": foundEmployee.username

            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        // Prepare an array of refresh tokens, excluding any existing JWT token in the cookies
        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundEmployee.refreshToken
                : foundEmployee.refreshToken.filter(rt => rt !== cookies.jwt);
        console.log('newRefreshTokenArray', newRefreshTokenArray);

        // If a JWT cookie exists, verify its validity in the database
        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const foundToken = await Employee.findOne({ refreshToken }).exec();
            // If the JWT cookie doesn't match any record in the database, clear all refresh tokens (indicating potential misuse)
            if (!foundToken) {
                newRefreshTokenArray = [];
            }
            // Clear the old JWT cookie from the client
            // when you test backend with Thunder Client or Postman, comment or clear secure: true
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // , secure: true
        }

        // Update the employee's record with the new set of refresh tokens and save it
        foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundEmployee.save();
        console.log("result", result);

        // Set the new refresh token in the client's cookie
        // when you test backend with Thunder Client or Postman, comment or clear secure: true
        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 }); // secure: true, 

        // Return the new access token and roles to the client
        return res.json({ accessToken });
    } else {
        // If the password doesn't match, return a 401 Unauthorized status
        return res.status(401).json({ 'message': 'incorrect password, please try again' });
    }
}

module.exports = {
    handleLogin
}