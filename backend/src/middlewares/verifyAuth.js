import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);  
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa" });
  }
};
