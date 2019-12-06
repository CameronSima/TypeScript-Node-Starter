import passport from "passport"
import passportLocal from "passport-local"

import User from "../db/entities/User"
import { Request, Response, NextFunction } from "express"

const LocalStrategy = passportLocal.Strategy

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id)
})

passport.deserializeUser(async (id: any, done: Function) => {
    console.log("ID " , id)
    try {
        const user = await User.findOne(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase()})
        if (!user) {
            return done(null, false, { message: `Email ${email} not found.` })
        }
        const isMatch = await user.comparePassword(password)
        if (isMatch) {
            return done(null, user)
        }
        return done(null, false, { message: "Invalid email or password." })
    } catch (err) {
        return done(err)
    }
}))

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

