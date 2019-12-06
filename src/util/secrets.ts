import logger from "./logger"
import dotenv from "dotenv"
import fs from "fs"

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables")
    dotenv.config({ path: ".env" })
} else {
    logger.debug("Using .env.example file to supply config environment variables")
    dotenv.config({ path: ".env.example" })  // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV
const prod = ENVIRONMENT === "production" // Anything else is treated as 'dev'

export const SESSION_SECRET = process.env["SESSION_SECRET"]

export const SENDGRID_INCOMING_SECRET = process.env["SENDGRID_INCOMING_SECRET"]
export const SENDGRID_USER = process.env["SENDGRID_USER"]
export const SENDGRID_PASSWORD = process.env["SENDGRID_PASSWORD"]

export const CONTACT_EMAIL_ADDRESS = process.env["CONTACT_EMAIL_ADDRESS"]

export const POSTGRES_USER = process.env["POSTGRES_USER"]
export const POSTGRES_PASSWORD = process.env["POSTGRES_PASSWORD"]
export const POSTGRES_HOST = process.env["POSTGRES_HOST"]
export const POSTGRES_PORT = parseInt(process.env["POSTGRES_PORT"])
export const POSTGRES_DATABASE = process.env["POSTGRES_DATABASE"]

if (!SESSION_SECRET) {
    logger.error("No client secret. Set SESSION_SECRET environment variable.")
    process.exit(1)
}

