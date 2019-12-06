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

describe("GET /random-url", () => {
    it("should return 404 Page", done => {
        request(app).get("/random-url")
            .expect(200)
            .then((response) => {
                expect(response.text).contains("Boy, you are lost.")
                done()
            })
    })
})
