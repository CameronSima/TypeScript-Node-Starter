import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import User from "./entities/User"

import Session from "./entities/Session"
import { 
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DATABASE
} from "../util/secrets"


const typeOrmConfig: PostgresConnectionOptions = {
    type: "postgres",
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    synchronize: false,
    logging: false,
    ssl: true,
    extra: { max: 5 },
    migrations: [
        "dist/db/migrations/*.js"
    ],
    cli: {
        migrationsDir: "dist/db/migrations"
    },
    entities: [
        User,
        Session
    ]
}

export = typeOrmConfig
