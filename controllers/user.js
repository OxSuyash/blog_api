import { User } from "../models/user.js";
import bcrypt from "bcrypt"
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";
import { json } from "express";
import { sendMail } from "../middlewares/sendMail.js";



export const login = async (req, res, next) => {
    try {

        const {email, password} = req.body

        const user = await User.findOne({email}).select("+password")

        if(!user) {
            return next(new ErrorHandler("Invalid Email or Password", 400))
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return next(new ErrorHandler("Invalid Email or Password", 400))
        }

        sendCookie(user, res, `Welcome back , ${user.name}`, 200)

        
    } catch (error) {
        next(error)
        
    }
}

export const signUp = async (req, res, next) => {
    try {
        const {name, email, password} = req.body

        let user = await User.findOne({email})

        if(user) {
            return next(new ErrorHandler("user already exists", 400))
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        sendCookie(user, res, "User is registered successfully", 201)

        
    } catch (error) {
        next(error)
        
    }
}

export const logout = (req, res)=> {

    res.status(200).cookie("token", "" , {
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }).json({
        success: true,
        message: "logout successful",
    })
}

export const getMyProfile = (req, res) => {

    res.status(200).json({
        success: true,
        user: req.user,
    })
}




export const contact = async (req, res, next) => {
    try {
        
           const {name, email, message} = req.body

           const userMessage = `Hey, I am ${name}. My email is ${email}. My message is ${message}.`

           await sendMail(userMessage)

           return res.status(200).json({
            success: true,
            message: "Message sent successfully"
           })
        
    } catch (error) {
        next(error)
        
    }
}