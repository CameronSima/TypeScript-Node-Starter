import express from "express"
import { createConnection } from "typeorm"
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions"
import appConfig from "../src/appConfig"
import routes from "../src/routes"
import User from "../src/db/entities/User"
import Session from "../src/db/entities/Session"

const sqliteInMemoryConfig: SqliteConnectionOptions = {
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    entities: [
        User,
        Session
    ]
}

export default async () => {
    const connection = await createConnection(sqliteInMemoryConfig)
    const app = appConfig(express(), connection)
    return routes(app)
}
