import { Express } from "express"
import multer from "multer"

import * as homeController from "./controllers/home"
import * as userController from "./controllers/user"
import * as contactController from "./controllers/contact"

// API keys and Passport configuration
import * as passportConfig from "./config/passport"
 
export default (app: Express) => {

    app.get("/", homeController.index)
    app.get("/login", userController.getLogin)
    app.post("/login", userController.postLogin)
    app.get("/logout", userController.logout)
    app.get("/forgot", userController.getForgot)
    app.post("/forgot", userController.postForgot)
    app.get("/reset/:token", userController.getReset)
    app.post("/reset/:token", userController.postReset)
    app.get("/signup", userController.getSignup)
    app.post("/signup", userController.postSignup)
    app.get("/contact", contactController.getContact)
    app.post("/contact", contactController.postContact)
    app.get("/account", passportConfig.isAuthenticated, userController.getAccount)
    app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile)
    app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword)

    app.get("*", (req, res) => res.render("404"))
    return app
}
