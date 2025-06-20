import db from '../db/db-connection.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
export const User = asyncHandler( async (req, res)=>{
    const { username, password, email } = req.body;
    if( !(username || password || email) ){
        return new ApiError(400, "Username, password and email are required");
    }
    try {
         const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
         const params = [username, email, password];

         db.run(sql, params, function(err) {
           if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          const field = err.message.includes('username') ? 'username' : 'email';
          return res.status(409).json({ error: `${field} already exists` });
        }
        return res.status(500).json({ error: 'Database error' });
         }
        })

        return res.status(200).json (new ApiResponse(200, {userId : this.lastID}, "User Created Successfully"));

    } catch (error) {
        throw new ApiError(500, "Something Went Wrong")
    }
})