import request from 'supertest'
import { app } from '../app'

import createConnection from '../database'

describe("Users", () => {
  beforeAll(async() => {
    const connection = await createConnection();
    await connection.runMigrations();
  })
 it("Should be ablre to create a new user", async() => {
  const response = await request(app).post("/users")
  .send({
    email: "user1@example.com",
    name: "User1 Example"
  });

  expect(response.status).toBe(201);
 })

 it("Should not be able to create a user with exists email", async () => {
  const response = await request(app).post("/users")
  .send({
    email: "user1@example.com",
    name: "User1 Example"
  });

  expect(response.status).toBe(400);
 })
})