const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const normalizedId = decoded.id || decoded.userId || decoded._id;

    if (!normalizedId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = {
      ...decoded,
      id: normalizedId
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;