import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { app, prisma } from "../index";

const testEmailPrefix = "ship-smoke";
const testEmail = `${testEmailPrefix}-${Date.now()}@example.com`;
const password = "Password1";

describe("API smoke tests", () => {
  let token = "";
  let refreshToken = "";

  before(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: testEmailPrefix,
        },
      },
    });
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: testEmailPrefix,
        },
      },
    });

    await prisma.$disconnect();
  });

  it("registers and logs in a physician", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password,
      specialty: "General Medicine",
    });

    assert.equal(registerResponse.status, 201);
    assert.equal(registerResponse.body.success, true);
    assert.equal(registerResponse.body.data.user.email, testEmail);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password,
    });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.success, true);
    assert.equal(typeof loginResponse.body.data.accessToken, "string");
    assert.equal(typeof loginResponse.body.data.refreshToken, "string");

    token = loginResponse.body.data.accessToken;
    refreshToken = loginResponse.body.data.refreshToken;
  });

  it("creates and lists patients for the authenticated user", async () => {
    const createResponse = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Ship",
        lastName: "Ready",
        age: 42,
        gender: "Male",
        specialty: "General Medicine",
      });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.success, true);
    assert.equal(createResponse.body.data.firstName, "Ship");

    const listResponse = await request(app)
      .get("/api/patients?page=1&pageSize=10")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.success, true);
    assert.equal(listResponse.body.data.patients.length > 0, true);
  });

  it("returns the disease library instead of treating the route as a patient id", async () => {
    const libraryResponse = await request(app)
      .get("/api/diagnosis/library")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(libraryResponse.status, 200);
    assert.equal(libraryResponse.body.success, true);
    assert.equal(Array.isArray(libraryResponse.body.data), true);
    assert.equal(
      typeof libraryResponse.body.data[0]?.clinicalPlaybook?.summary,
      "string"
    );
  });

  it("refreshes an access token with a persisted refresh token", async () => {
    const refreshResponse = await request(app).post("/api/auth/refresh").send({
      refreshToken,
    });

    assert.equal(refreshResponse.status, 200);
    assert.equal(refreshResponse.body.success, true);
    assert.equal(typeof refreshResponse.body.data.accessToken, "string");
    assert.equal(typeof refreshResponse.body.data.refreshToken, "string");
  });
});
