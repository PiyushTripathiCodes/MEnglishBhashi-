const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from database
      const user = await User.findById(decoded.userId).select("-password")

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid - user not found",
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        })
      }

      // Add user to request object
      req.user = user
      next()
    } catch (tokenError) {
      console.error("Token verification error:", tokenError)
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    })
  }
}

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          const user = await User.findById(decoded.userId).select("-password")

          if (user && user.isActive) {
            req.user = user
          }
        } catch (tokenError) {
          // Silently fail for optional auth
          console.log("Optional auth token invalid:", tokenError.message)
        }
      }
    }

    next()
  } catch (error) {
    console.error("Optional auth middleware error:", error)
    next() // Continue even if there's an error
  }
}

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      })
    }

    next()
  }
}

module.exports = { auth, optionalAuth, authorize }
