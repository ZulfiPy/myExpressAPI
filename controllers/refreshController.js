const Employee = require('../model/employee');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    // Extract cookies from the request object. This is where the refresh token is expected to be stored.
    const cookies = req?.cookies;
    console.log(`cookies available at refresh :${JSON.stringify(cookies)}`);

    // If the JWT cookie is not present, return a 403 Forbidden status. 
    // This scenario occurs when the refresh token is expected but not found in the client's request.
    if (!cookies?.jwt) return res.status(403).json({ 'message': 'not found cookies.jwt' });

    // Store the value of the JWT cookie, which is the current refresh token.
    const refreshToken = cookies.jwt;
    // Clear the JWT cookie from the client. This is a security measure to ensure that the old refresh token is no longer usable.
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true }); // secure: true

    // Attempt to find the employee in the database whose record contains the refresh token.
    const foundEmployee = await Employee.findOne({ refreshToken }).exec();

    // Scenario: The refresh token is not associated with any employee in the database.
    // This could happen if the token is invalid, if it belonged to a deleted user, or if there's a token misuse.
    if (!foundEmployee) {
        // Verify the validity of the refresh token.
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                // If the token verification fails (e.g., token is expired), respond with a 401 Unauthorized status.
                if (err) return res.sendStatus(401);

                // If the token is valid, find the employee(hacked) by the username encoded in the token.
                const hackedEmployee = await Employee.findOne({ username: decoded.username }).exec();

                // Clear all refresh tokens from this employee's record as a security measure, 
                // because the refresh token was found to be valid but wasn't associated with any employee.
                hackedEmployee.refreshToken = [];
                const result = await hackedEmployee.save();
                console.log('hachedEmployee', result);
            }
        )
        // Since the token wasn't found associated with any user, respond with a 403 Forbidden status.
        return res.sendStatus(403);
    }

    // If the employee is found, filter out the current refresh token from their list of tokens.
    // This is part of the token rotation strategy to ensure that each refresh token can only be used once.
    const newRefreshTokenArray = foundEmployee.refreshToken.filter(rt => rt !== refreshToken);

    // Re-verify the refresh token to ensure it's still valid and hasn't expired.
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            // If there's an error (token expired or invalid), update the employee's tokens in the database
            // by removing the expired token and saving the change.
            if (err) {
                foundEmployee.refreshToken = newRefreshTokenArray;
                const result = await foundEmployee.save();
                console.log('token expired', result)
                console.log(err)
            }

            // Verify that the username in the decoded token matches the employee's username.
            // If there's a mismatch, it's a security issue, and the process should be aborted with a 403 Forbidden status.
            if (err || foundEmployee.username !== decoded.username) return res.sendStatus(403);

            // Everything checks out, so proceed to issue a new access token for the user.
            const roles = Object.values(foundEmployee.roles).filter(Boolean);

            // Create an access token with the employee's username and roles, set to expire in 5 minutes
            const newAccessToken = jwt.sign(
                {
                    "UserInfo": {
                        username: foundEmployee.username,
                        roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "5m" }
            );

            // Create a refresh token with the employee's username, set to expire in 1 hour
            const newRefreshToken = jwt.sign(
                { "username": foundEmployee.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1h" }
            );

            // Update the employee's record with the new refresh token and save it.
            foundEmployee.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundEmployee.save();
            console.log('everything is done', result);

            // Set the new refresh token in the client's cookie.
            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 }); // secure: true

            // Return the new access token in the response.
            return res.json({ "accessToken": newAccessToken });
        }
    )
}

module.exports = {
    handleRefreshToken
}