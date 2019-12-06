import "reflect-metadata"
import { ENVIRONMENT } from "./util/secrets"

import express from "express"
import { createConnection } from "typeorm"
import errorHandler from "errorhandler"
import typeOrmConfig  from "./db/config"
import sqliteInMemoryConfig from "./db/testConfig"
import appConfig from "./appConfig"
import routes from "./routes"


const app = express()

/**
 * Error Handler. Provides full stack - remove for production
 */
 if (ENVIRONMENT !== "production") {
    app.use(errorHandler())
 }

/**
 * Start Express server.
 */
try {
    (async () => {
        const connectionConfig = ENVIRONMENT === "test" ? sqliteInMemoryConfig : typeOrmConfig
        const connection = await createConnection(connectionConfig)

        appConfig(app, connection)
        routes(app)

        const server = app.listen(app.get("port"), () => {
            console.log(
                "  App is running at http://localhost:%d in %s mode",
                app.get("port"),
                app.get("env")
            )
            console.log("  Press CTRL-C to stop\n")
        })
    })()
} catch (err) {
    console.log("Error starting server: ", err)
}

export default app


