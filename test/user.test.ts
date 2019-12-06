import express, { Express } from "express"
import { getConnection } from "typeorm"
import request from "supertest"
import testApp from "./testapp"
import { expect } from "chai"
import { Connection } from "mongoose"

let app: Express

beforeEach(async () => {
    app = await testApp()

})

afterEach( async () => {
    await getConnection().close()
})

describe("GET /login", () => {
    it("should return 200 OK", () => {
        return request(app).get("/login")
            .expect(200)
    })
})


describe("GET /forgot", () => {
    it("should return 200 OK", () => {
        return request(app).get("/forgot")
            .expect(200)
    })
})

describe("GET /signup", () => {
    it("should return 200 OK", () => {
        return request(app).get("/signup")
            .expect(200)
    })
})

describe("GET /reset", () => {
    it("should return 302 Found for redirection", () => {
        return request(app).get("/reset/1")
            .expect(302)
    })
})

describe("POST /login", () => {
    it("should return some defined error message with valid parameters", (done) => {
        return request(app).post("/login")
            .field("email", "cam@me.com")
            .field("password", "pass")
            .expect(302)
            .end(function(err, res) {
                expect(res.error).not.to.be.undefined
                done()
            })

    })
})
