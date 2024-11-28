const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require("../../models/User");
const TempUser = require("../../models/TempUser");


//register
// const registerUser = async (req, res) => {
//   const { userName, email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (checkUser)
//       return res.json({
//         success: false,
//         message: "User Already exists with the same email! Please try again",
//       });

//     const hashPassword = await bcrypt.hash(password, 12);
//     const newUser = new User({
//       userName,
//       email,
//       password: hashPassword,
//     });

//     await newUser.save();
//     res.status(200).json({
//       success: true,
//       message: "Registration successful",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured",
//     });
//   }
// };
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email, otp });

    if (!tempUser) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if the OTP has expired
    if (Date.now() > tempUser.otpExpiresAt) {
      return res.json({
        success: false,
        message: "OTP has expired. Please register again.",
      });
    }

    // Create the new user since OTP is valid
    const newUser = new User({
      userName: tempUser.userName,
      email: tempUser.email,
      password: tempUser.password,
    });

    await newUser.save();

    // Delete the temporary record
    await TempUser.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: "OTP verified, registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};


// OTP generation and email sending function
const sendOtpToEmail = async (email, otp) => {
  // const transporter = nodemailer.createTransport({
  //   service: process.env.Mail_Service,
  //   auth: {
  //     user: process.env.Mail_Service_ID, // Replace with your email
  //     pass: process.env.Mail_Service_Pass,  // Replace with your password
  //   },
  // });
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: 'sidhota54@gmail.com',
      pass: 'pdjl hkuu nbpm ctzo'
    }
  });


  const mailOptions = {
    // from: process.env.Mail_Service_ID,
    from: "sidhota54@gmail.com",
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });
    }
    // const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp)
    await sendOtpToEmail(email, otp);
    const checkTempUser = await TempUser.findOne({ email });
    if (!checkTempUser) {
      const tempUser = new TempUser({
        userName,
        email,
        password: await bcrypt.hash(password, 12),
        otp,
        otpExpiresAt: Date.now() + 300000, // OTP expires in 5 minutes (300,000 ms)
      });
      await tempUser.save();
    } else {
      await TempUser.findOneAndUpdate(
        { email },
        {
          userName,
          email,
          password: await bcrypt.hash(password, 12),
          otp,
          otpExpiresAt: Date.now() + 300000, // OTP expires in 5 minutes (300,000 ms)
        },
        { new: true }
      );
    }
    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify within 5 minutes.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};


//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.CLIENT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { 
      httpOnly: true,               // Prevent access from client-side scripts
      secure: true,         // Use secure cookies in production
      sameSite: "None",
      domain: ".vercel.app", // Strict for production, lax for local
      maxAge: 24 * 60 * 60 * 1000,  // Cookie expiration (1 day in ms)
      path: "/",                    // Make cookie available across the entire site
    }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        token: token,
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = (isAdmin = false) => {
  return async (req, res, next) => {
    const token = req.cookies.token || req?.body?.token;
    console.log("token", token)
    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorised user! (invalid token)",
      });
    try {
      const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY);
      req.user = decoded;
      if (!isAdmin) {
        next();
      }
      else if (isAdmin && decoded.role === "admin") {
        next();
      }
      else {
        return res.status(401).json({
          success: false,
          message: "Unauthorised user! (invalid role)",
        });
      }
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
    }
  };
};

module.exports = { registerUser, verifyOtp, loginUser, logoutUser, authMiddleware };
