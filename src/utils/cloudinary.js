import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { apiError } from "../utils/apiError.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, option) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, option);

    return uploadResult;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (url, option) => {
  try {
    if (!url) {
      throw new apiError(
        400,
        "image url is require by deleting cloudinary old image"
      );
    }
    const publicId = url.split("/").pop().split(".")[0];
    if (!publicId) {
      throw new apiError(400, "Cloudinary publicId is required");
    }
    const res = await cloudinary.uploader.destroy(publicId, option);
    return res;
  } catch (error) {
    return error;
  }
};

const deleteOnCloudinaryByPublicId = async (public_id, option) => {
  try {
    if (!public_id) {
      throw new apiError(400, "public id not found");
    }
    const res = await cloudinary.uploader.destroy(public_id, option);
    return res;
  } catch (error) {
    return error;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary, deleteOnCloudinaryByPublicId };
