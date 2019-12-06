import express, { Express } from "express"
import moment from "moment"
import { Connection } from "typeorm"
import { TypeormStore } from "connect-typeorm/out"
import passport from "passport"
import lusca from "lusca"
import compression from "compression"  // compresses requests
import bodyParser from "body-parser"
import path from "path"
import flash from "express-flash"
import session from "express-session"
import { SESSION_SECRET } from "./util/secrets"
import Session from "./db/entities/Session"


// Express configuration
export default (app: Express, connection: Connection) => {

    app.set("port", process.env.PORT || 3000)
    app.set("views", path.join(__dirname, "../views"))
    app.set("view engine", "pug")
    app.use(compression())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.use(
        express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
    )

    // Don't allow .map files (Don't know where these reqs are coming from...)
    app.use((req, res, next) => {
        if (req.url.includes(".map")) {
            return res.status(404)
        } 
        next()
    })

    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: SESSION_SECRET,
        store: new TypeormStore({
            cleanupLimit: 5,
            ttl: 86400
        }).connect(connection.getRepository(Session))
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    app.use(lusca.xframe("SAMEORIGIN"))
    app.use(lusca.xssProtection(true))

    app.use((req, res, next) => {
        res.locals.user = req.user
        next()
    })

    /**
     * Function to prevent race condition where sometimes the redirect happens
     * before the flash is set.
     */
    app.use((req, res, next) => {
        req.flashAndRedirect = options => {
            req.flash(options.type, options.message)
            req.session.save(err => {
                if (err) console.log(err)
                return res.redirect(options.redirectTo || req.session.returnTo || "/")
            })
        }
        next()
    })

    app.use((req, res, next) => {
        // After successful login, redirect back to the intended page
        if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
            req.session.returnTo = req.path
        } else if (req.user &&
        req.path == "/account") {
            req.session.returnTo = req.path
        }
        next()
    })

    app.locals.moment = moment
    return app
}