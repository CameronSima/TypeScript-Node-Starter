import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions"

import User from "./entities/User"
import Session from "./entities/Session"

const sqliteInMemoryConfig: SqliteConnectionOptions = {
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    entities: [
        User,
        Session
    ]
}

export = sqliteInMemoryConfig