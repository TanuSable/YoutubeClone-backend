import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    //get data from request body/frontend
    //validate data
    //check if user already exists : email or username
    //check for file uploads: avatar
    //upload files to cloudinary
    //hash password
    //create user
    //generate access token and refresh token
    //remove password from response
    //send response to frontend
   
   const {username, email, fullName, password} = req.body;
//    console.log(username, email, fullName, password);
// if(fullName === ""){
//     throw new ApiError(400, "Full name is required");
// }
// if(username === ""){
//     throw new ApiError(400, "Username is required");
// }
// if(email === ""){
//     throw new ApiError(400, "Email is required");
// }
// if(password === ""){
//     throw new ApiError(400, "Password is required");
// }
if (
    [fullName, username, email, password].some(field => field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required");
}

const existedUser = await User.findOne({$or: [{username}, {email}]});

if (existedUser) {
    throw new ApiError(400, "User already exists");
}

const avatarLocalPath = req.files?.avatar[0].path;
const coverImageLocalPath = req.files?.coverImage[0].path;

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
    throw new ApiError(400, "Avatar is required");
}

const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
    password,
});

const createdUser = await user.findOne({_id: user._id}).select(
    "-password -refreshToken"
);

if(!createdUser){
    throw new ApiError(500, "Something went wrong while creating user");
}

return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: createdUser,
});

});

export default registerUser;