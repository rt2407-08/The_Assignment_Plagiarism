const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "veritext_super_secret_jwt_key_2026";

/**
 * Middleware to verify JSON Web Token from Authorization header.
 * Supports "Bearer <token>" format or "x-access-token".
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["x-access-token"] || "";

    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token is required."
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

/**
 * Optional token verification: extracts user if token exists,
 * but allows request through if not (for public/flexible routes).
 */
const optionalToken = (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["x-access-token"] || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (e) {
    // Ignore invalid optional token
  }
  next();
};

/**
 * Role-based access control middleware.
 * Example: requireRole("instructor") or requireRole(["instructor", "admin"])
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access role is required."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(", ")}] role.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalToken,
  requireRole
};
