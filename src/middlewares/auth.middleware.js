import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";


export const authMiddleware = async (req, __, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
   
    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decodeToken)
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }
    req.user = user;

    next();
  } catch (error) {
    console.error(error)
    throw new apiError(401, "Invalid access Token");
  }
};
