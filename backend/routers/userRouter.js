/** @format */

// /** @format */

import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/UserModel";
import UserVerification from "../models/UserVerification";
import Teacher from "../models/TeacherModel";
import ClassRoom from "../models/ClassRoomModel";
import bcrypt from "bcryptjs";
// import bcryptVerification from "bcrypt";
import { generateToken } from "../utils";
import dotenv from "dotenv";

dotenv.config();

const userRouter = express.Router();

// path for static verified page
import path from "path";
const __dirname = path.resolve();

// email handle
import nodemailer from "nodemailer";

// uniquestring
import { v4 as uuidv4 } from "uuid";

// nodemailer stuff

let transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  service: process.env.SMPT_SERVICE,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_PASSWORD,
  },
});

// testing success
// transporter.verify((error, success) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Ready for messages");
//     console.log(success);
//   }
// });

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).populate("role");
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        function isKeyExists(obj, key) {
          if (obj[key] == undefined) {
            return false;
          } else {
            return true;
          }
        }

        let userDatas = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          role: user.role,
          token: generateToken(user),
        };

        if (isKeyExists(user, "teacher")) {
          const teacher = await Teacher.findOne(user.teacher).populate(
            "matter establishment"
          );

          if (teacher) {
            userDatas.teacherDatas = teacher;
          }
        }

        res.send(userDatas);
      }
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  })
);

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    let userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
      password: bcrypt.hashSync(req.body.password, 8),
    };

    let classRooms = [];

    if (req.body.classRoom) {
      for (let index = 0; index < req.body.classRoom.length; index++) {
        const element = req.body.classRoom[index];
        let classRoom = await ClassRoom.findById(element);

        if (classRoom) {
          classRooms.push(classRoom);
        }
      }
    }

    if (req.body.isTeacher) {
      const teacher = new Teacher({
        establishment: req.body.establishment,
        matter: req.body.matter,
        classRoom: classRooms,
      });

      const createdTeacher = await teacher.save();
      userData.teacher = createdTeacher._id;
    }

    const user = new User(userData);
    const createdUser = await user.save();
    sendVerificationEmail(createdUser, res);
  })
);

userRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();
      res.send({ message: "Updated User", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

// send verification email
const sendVerificationEmail = ({ _id, email }, res) => {
  // url to be used in the email
  const currentUrl = "http://localhost:5000/";

  const uniqueString = uuidv4() + _id;

  // mail options
  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete </p> <p>Press <a href=${
      currentUrl + "api/users/verify/" + _id + "/" + uniqueString
    }>here</a> to proceed </p>`,
  };

  // hash the uniqueString
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      // set values in userVerification collection
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.json({
                status: "PENDING",
                message: "Verification email sent",
              });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "Verification email failed",
              });
            });
        })
        .catch((err) => {
          res.json({
            status: "FAILED",
            message: "Couldn't save verification email data!",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occurred while hashing email detail.",
      });
    });
};

// verify email
userRouter.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        // user verification record exists so we proceed
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        // checking for expired unique string
        if (expiresAt < Date.now()) {
          // record has expired so we delete it

          UserVerification.deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again.";
                  res.redirect(
                    `/api/users/verified?error=true&message=${message}`
                  );
                })
                .catch((err) => {
                  console.log(err);

                  let message =
                    "Clearing user with expired unique string failed";
                  res.redirect(`/api/users?error=true&message=${message}`);
                });
            })
            .catch((err) => {
              console.log(err);

              let message =
                "An error occurred while clearing expired user verification record";
              res.redirect(`/api/users?error=true&message=${message}`);
            });
        } else {
          // valid record exists so we validate the user string
          // First compare the hashed unique string

          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                // string match

                User.updateOne({ _id: userId }, { verified: true })
                  .then(() => {
                    UserVerification.deleteOne({ userId })
                      .then(() => {
                        res.sendFile(
                          path.join(__dirname, "./views/verified.html")
                        );
                      })
                      .catch((err) => {
                        let message =
                          "An error occurred while finalizing successful verification.";
                        res.redirect(
                          `/user/verified?error=true&message=${message}`
                        );
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    let message =
                      "An error occurred while updating user record to show verified.";
                    res.redirect(
                      `/user/verified?error=true&message=${message}`
                    );
                  });
              } else {
                // existing record but incorrect verification details passed
                let message =
                  "Invalid verification details passed. Check your inbox.";
                res.redirect(
                  `/api/users/verified?error=true&message=${message}`
                );
              }
            })
            .catch((err) => {
              console.log(err);

              let message = "An error occurred while comparing unique strings.";
              res.redirect(`/api/users/verified?error=true&message=${message}`);
            });
        }
      } else {
        // user verification ecord doesn't exist
        let message =
          "Account record doesn't exist or has been verified alredy. Please sign up or log in";
        res.redirect(`/api/users/verified?error=true&message=${message}`);
      }
    })
    .catch((err) => {
      console.log(err);
      let message =
        "An error occurred while checking for existing user verification record";
      res.redirect(`/api/users/verified?error=true&message=${message}`);
    });
});

// verify email
userRouter.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/verified.html"));
});

export default userRouter;
