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

describe("GET /", () => {
    it("should return 200 OK", (done) => {
        request(app).get("/")
            .expect(200, done)
    })
})
