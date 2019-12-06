import express, { Express } from "express"
import { getConnection } from "typeorm"
import request from "supertest"
import testApp from "./testapp"
import { expect } from "chai"

let app: Express

beforeEach(async () => {
    app = await testApp()
})

afterEach( async () => {
    await getConnection().close()

})

describe("GET /contact", () => {
    it("should return 200 OK", (done) => {
        request(app).get("/contact")
            .expect(200, done)
    })
})


describe("POST /contact", () => {
    it("should return false from assert when no message is found", (done) => {
        request(app).post("/contact")
            .field("name", "John Doe")
            .field("email", "john@me.com")
            .end(function(err, res) {
                expect(res.error).to.be.false
                done()
            })
            .expect(302)

    })
})