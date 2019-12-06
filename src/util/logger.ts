import winston from "winston"

const options: winston.LoggerOptions = {
    format: winston.format.combine(
        winston.format.timestamp({
            format: "MM/DD/YYYY, hh:mm:ss"
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new winston.transports.File({ filename: "combined.log", level: "info" }),
        new winston.transports.File({ filename: "error.log", level: "error" })
    ]
}

const logger = winston.createLogger(options)

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level")
}

export default logger
