/** @format */

import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verified: user.verified,
      isTeacher: user.isTeacher,
      isVerifiedCredentials: user.isVerifiedCredentials,
      teacherDatas: user.isTeacher ? user.teacherDatas : null,
    },
    process.env.JWT_SECRET || "somethingsecret",
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      process.env.JWT_SECRET || "somethingsecret",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Invalid Token" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const isVerified = (req, res, next) => {
  if (req.user && req.user.verified) {
    next();
  } else {
    res.status(401).send({ message: "The email is not verified" });
  }
};

export const isVerifiedAndIsVerifiedCredentials = (req, res, next) => {
  if (req.user && req.user.verified && req.user.isVerifiedCredentials) {
    next();
  } else {
    res.status(401).send({
      message: "The email is not verified or your credentials is not verified",
    });
  }
};

export const isTeacher = (req, res, next) => {
  if (req.user && req.user.isTeacher) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Enseignant Token" });
  }
};

export const isTeacherOrIsParent = (req, res, next) => {
  if (req.user && (req.user.isTeacher || !req.user.isTeacher)) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Enseignant Token" });
  }
};

export const isParent = (req, res, next) => {
  if (!req.user.isTeacher) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Parent Token" });
  }
};
