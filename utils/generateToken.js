import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  return res
    .status(200)
    .cookie(
      "token",
      token,
      { httpOnly: true, sameSite: "strict", maxAge: 72 * 60 * 60 * 1000 }
    )
    .json({
      success: true,
      message,
      user,
    });
};
