import async from "async"
import crypto from "crypto"
import nodemailer from "nodemailer"
import passport from "passport"

import User, { AuthToken } from "../db/entities/User"
import { Request, Response, NextFunction } from "express"
import { IVerifyOptions } from "passport-local"
import { check, sanitize, validationResult } from "express-validator"
import "../config/passport"
import { MoreThan } from "typeorm"

import { SENDGRID_PASSWORD, SENDGRID_USER } from "../util/secrets"

/**
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/")
    }
    res.render("account/login", {
        title: "Login"
    })
}

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Email is not valid").isEmail().run(req)
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req)
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "/login"
        })
    }

    passport.authenticate("local", (err: Error, user: User, info: IVerifyOptions) => {
        if (err) { console.log("ERR: ", err); return next(err) }
        if (!user) {
            return req.flashAndRedirect({
                type: "errors",
                message: { msg: info.message }, 
                redirectTo: "/login"
            })
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log("Error logging in: ", err)
                 return next(err) 
                }
            return req.flashAndRedirect({
                type: "success",
                message: { 
                    msg: "Success! You are logged in."
                }
            })  
        })
    })(req, res, next)
}

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
    req.session.destroy(err => {
        req.logout()
        if (err) {
            console.log("Error logging out")
        } 
        return res.redirect("/") 
    })
}

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/")
    }
    res.render("account/signup", {
        title: "Create Account"
    })
}

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Email is not valid").isEmail().run(req),
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req),
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req)

    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "/signup"
        })
    }

    const user = new User()
    user.email = req.body.email
    user.password = req.body.password
    
    try {
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
        return req.flashAndRedirect({
            type: "errors",
            message: {
                msg: "An account with that email address already exists."
            },
            redirectTo: "/signup"
        }) 
    }

    await user.save()
    req.logIn(user, (err) => {
        if (err) {
            return next(err)
        }
        res.redirect("/")
    })
    } catch (err) {
        return next(err)
    }
}

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
    res.render("account/profile", {
        title: "Account Management"
    })
}

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req)
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "/account"
        })
    }

    let user = req.user as User
    try {
        user = await User.findOne(user.id)
        user.email = req.body.email || ""
    } catch (err) {
        console.log("Can't find that user when updating")
        return next(err)
    }
    try {
        await user.save()
    } catch (err) {
        return req.flashAndRedirect({
            type: "errors",
            message: { 
                msg: "The email address you have entered is already associated with an account."
            },
            redirectTo: "/account"
        })
    }
}

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req)
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "/account"
        })
    }

    let user = req.user as User
    try {
        user = await User.findOne(user.id)
    } catch (err) {
        return next(err)
    }
    try {
        user.password = req.body.password
        await user.save()
        req.flashAndRedirect({
            type: "success",
            message: { 
                msg: "Password has been changed."
            },
            redirectTo: "/account"
        })
    } catch (err) {
        return next(err)
    }
}


/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = async (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    try {
        const user = await User.findOne({ 
            where: {
                passwordResetExpires: MoreThan(new Date()),
                passwordResetToken: req.params.token
            }
        })
        if (!user) {
            return req.flashAndRedirect({
                type: "errors", 
                message: { 
                    msg: "Password reset token is invalid or has expired."
                },
                redirectTo: "/forgot"
            })
        }
        res.render("account/reset", {
             title: "Password Reset"
        })
    } catch (err) {
        return next(err)
    }
}

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long.").isLength({ min: 4 }).run(req)
    await check("confirm", "Passwords must match.").equals(req.body.password).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "back"
        })
    }

    async.waterfall([
        async function resetPassword(done: Function) {
            try {
                const user = await User.findOne({ 
                    where: {
                        passwordResetExpires: MoreThan(new Date()),
                        passwordResetToken: req.params.token
                    }
                })
                if (!user) {
                    return req.flashAndRedirect({
                        type: "errors",
                        message: { 
                            msg: "Password reset token is invalid or has expired." 
                        },
                        redirectTo: "back"
                    })
                }
                user.password = req.body.password
                user.passwordResetToken = undefined
                user.passwordResetExpires = undefined
                await user.save()
                req.logIn(user, (err) => {
                    done(err, user)
                })

            } catch (err) {
                return next(err)
            }
        },
        async function sendResetPasswordEmail(user: User, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: SENDGRID_USER,
                    pass: SENDGRID_PASSWORD
                }
            })
            const mailOptions = {
                to: user.email,
                from: "bot@telecaster.io",
                subject: "Your password has been changed",
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            }
            transporter.sendMail(mailOptions, (err) => {
                req.flash("success", { msg: "Success! Your password has been changed." })
                done(err)
            })
        }
    ], (err) => {
        if (err) { return next(err) }
        res.redirect("/")
    })
}

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    })
}

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req)
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return req.flashAndRedirect({
            type: "errors",
            message: errors.array(),
            redirectTo: "/forgot"
        })
    }

    async.waterfall([
        function createRandomToken(done: Function) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex")
                done(err, token)
            })
        },
        async function setRandomToken(token: string, done: Function) {

            try {
                const user = await User.findOne({ email: req.body.email })
                if (!user) {
                    return req.flashAndRedirect({
                        type: "errors",
                        message: {
                            msg: "Account with that email address does not exist."
                        },
                        redirectTo: "/forgot"
                    })
                }
                user.passwordResetToken = token
                user.passwordResetExpires = new Date((new Date()).getTime() + 3600000) // 1 hour
                await user.save()
                done(null, token, user)
            } catch (err) {
                return done(err)
            }
        },
        function sendForgotPasswordEmail(token: AuthToken, user: User, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: SENDGRID_USER,
                    pass: SENDGRID_PASSWORD
                }
            })
            const mailOptions = {
                to: user.email,
                from: "bot@telecaster.io",
                subject: "Reset your Telecaster.io password",
                text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
            }
            transporter.sendMail(mailOptions, (err) => {
                req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` })
                done(err)
            })
        }
    ], err => {
        if (err) { return next(err) }
        res.redirect("/forgot")
    })
}
