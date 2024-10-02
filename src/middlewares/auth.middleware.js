import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/ApiErrorRes.js";
import { searchProfByUsernameOrEmailQuery } from "../queries/profs.queries.js";
import { pool } from "../db/index.js";

dotenv.config({ path: "././.env" });

export const verifyProfJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).send(new ApiResponse(401, "No access token provided", "Unauthorized request"));

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return res.status(401).send(new ApiResponse(401, err, "Unauthorized request"));
    }

    const query = searchProfByUsernameOrEmailQuery;
    const values = [decodedToken.username, decodedToken.username];
    let user;
    try {
        const queryResponse = await pool.query(query, values);
        user = queryResponse.rows[0];
    } catch (err) {
        return res.status(500).send(new ApiResponse(500, err, "Unable to reach database, at this moment"));
    }

    if (!user || user.length === 0) {
        return res.status(404).send(new ApiResponse(404, null, "User not found"));
    }

    user.password = undefined;
    req.user = user;
    next();
});
