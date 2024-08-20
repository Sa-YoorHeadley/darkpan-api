const {
  InsertUser,
  QueryLogin,
  UpdateTokenById,
  QueryByRefreshToken,
} = require("../service/Authentication");
const {
  ValidateRegistration,
  ValidateLogin,
  ValidateResetPassword,
} = require("../service/Validation");
const {
  QueryUserByEmailAddress,
  UpdatePasswordById,
} = require("../service/Users");
const {
  FindResetTokenById,
  DeleteResetTokenById,
  InsertResetToken,
} = require("../service/ResetToken");
const {
  SendResetRequestEmail,
  sendResetSuccessfulEmail,
} = require("../utils/Email");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const createToken = async (_id, tokenType, age) => {
  return jwt.sign({ _id }, tokenType, { expiresIn: age });
};

const LoginUser = async (req, res) => {
  const userData = req.body;
  try {
    ValidateLogin(userData)
      .then(async (userData) => {
        const user = await QueryLogin(userData);
        const accessToken = await createToken(
          user._id.toString(),
          process.env.JWT_ACCESS_TOKEN,
          "15m"
        );
        const refreshToken = await createToken(
          user._id.toString(),
          process.env.JWT_REFRESH_TOKEN,
          "1d"
        );
        const update = await UpdateTokenById(user._id.toString(), refreshToken);

        //Options { maxAge: 1000 * 60 * 60 * 24, secure: true, httpOnly: true }
        res.cookie("jwt", refreshToken, {
          maxAge: 1000 * 60 * 60 * 24,
          secure: true,
          httpOnly: true,
          sameSite: "none",
        });
        res
          .status(202)
          .json({ user, accessToken, message: "Login successful" });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json(error);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const RegisterUser = async (req, res) => {
  const userData = req.body;
  try {
    ValidateRegistration(userData)
      .then(async (userData) => {
        try {
          const user = await InsertUser(userData);
          console.log(user);
          const accessToken = await createToken(
            user._id.toString(),
            process.env.JWT_ACCESS_TOKEN,
            "15m"
          );
          const refreshToken = await createToken(
            user._id.toString(),
            process.env.JWT_REFRESH_TOKEN,
            "1d"
          );
          const update = await UpdateTokenById(user._id, refreshToken);
          //Options { maxAge: 1000 * 60 * 60 * 24, secure: true, httpOnly: true }
          res.cookie("jwt", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            secure: true,
            httpOnly: true,
            sameSite: "none",
          });
          res.status(201).json({ user, accessToken, message: "User created" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ data: [error] });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json(error);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const LogoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json({ message: "Token not found" });
  }
  const refreshToken = cookies.jwt;

  const user = await QueryByRefreshToken(refreshToken);

  if (!user) {
    res.cookie("jwt", "", {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ user: null, message: "User logged out" });
  }

  const update = await UpdateTokenById(user._id.toString(), null);
  res.cookie("jwt", "", { maxAge: 1, httpOnly: true, sameSite: "none" });
  res.status(200).json({ user: null, message: "User logged out" });
};

const RefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Token not found" });
  }
  const refreshToken = cookies.jwt;
  const user = await QueryByRefreshToken(refreshToken);
  if (!user) {
    return res.status(403).json({ message: "Token not found" });
  }
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN,
    async (error, decodedToken) => {
      if (error || user._id.toString() !== decodedToken._id) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const accessToken = await createToken(
        user._id.toString(), 
        process.env.JWT_ACCESS_TOKEN,
        "15m" 
      );
      res.status(201).json({ accessToken });
    }
  );
};

const ForgotPassword = async (req, res) => {
  const { emailAddress } = req.body;
  QueryUserByEmailAddress(emailAddress)
    .then(async (user) => {
      if (!user) {
        return res
          .status(404)
          .json({ type: "User", message: "User not Found" });
      }
      const token = await FindResetTokenById(user._id);
      if (token) {
        await DeleteResetTokenById(user._id);
      }
      const resetToken = crypto.randomBytes(32).toString("hex");
      InsertResetToken(user._id, resetToken, Date.now())
        .then(async (token) => {
          const url = `127.0.0.1:5173/reset-password/${resetToken}/${user._id}`;
          SendResetRequestEmail(emailAddress, url)
            .then(() => {
              res.status(200).json({ message: "Reset request sent" });
            })
            .catch(() => {
              res.status(500).json({ message: "Reset request not sent" });
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: "Could not create reset token" });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ message: error });
    });
};

const ResetPassword = async (req, res) => {
  ValidateResetPassword(req.body)
    .then(async (resetData) => {
      UpdatePasswordById(resetData.userId, resetData.password)
        .then(async (user) => {
          await DeleteResetTokenById(user._id);
          sendResetSuccessfulEmail(user.emailAddress)
            .then(() => {
              return res
                .status(200)
                .json({ message: "Password reset successful and email sent" });
            })
            .catch(() => {
              return res
                .status(200)
                .json({ message: "Password reset successful" });
            });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ message: error });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ message: error });
    });
};
module.exports = {
  LoginUser,
  RegisterUser,
  LogoutUser,
  RefreshToken,
  ForgotPassword,
  ResetPassword,
};
