"use strict";

// routes/jobs.test.js
const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
  } = require("./_testCommon");
  
  beforeAll(async () => await commonBeforeAll());
  beforeEach(async () => await commonBeforeEach());
  afterEach(async () => await commonAfterEach());
  afterAll(async () => await commonAfterAll());

describe("POST /jobs", function () {
  test("works: admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Job3",
        salary: 30000,
        equity: "0.1",
        companyHandle: "c1",
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Job3",
        salary: 30000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });
});
test("fails: non-admin", async function () {
  const resp = await request(app)
    .post("/jobs")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      title: "Job3",
      salary: 30000,
      equity: "0.1",
      companyHandle: "c1",
    });
  expect(resp.statusCode).toEqual(401);
});

describe("GET /jobs", function () {
  test("works: no filter", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 10000,
          equity: "0.05",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job2",
          salary: 20000,
          equity: "0",
          companyHandle: "c1",
        },
      ],
    });
  });

  // Additional tests for filters...
});

describe("GET /jobs/:id", function () {
  test("works", async function () {
    const jobId = testJobIds[0]; // Dynamically fetch the job ID
    const resp = await request(app).get(`/jobs/${jobId}`);
    expect(resp.body).toEqual({
      job: {
        id: jobId,
        title: "Job1",
        salary: 10000,
        equity: "0.05",
        companyHandle: "c1",
      },
    });
  });
});

test("not found for no such job", async function () {
  const resp = await request(app).get("/jobs/999");
  expect(resp.statusCode).toEqual(404);
});

describe("PATCH /jobs/:id", function () {
  test("works: admin", async function () {
    const jobId = testJobIds[0]; // Dynamically fetch the job ID
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Job1-new",
        salary: 15000,
      });
    expect(resp.body).toEqual({
      job: {
        id: jobId,
        title: "Job1-new",
        salary: 15000,
        equity: "0.05",
        companyHandle: "c1",
      },
    });
  });

  test("fails: non-admin", async function () {
    const jobId = testJobIds[0]; // Dynamically fetch the job ID
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Job1-new",
        salary: 15000,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .patch("/jobs/999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "nope",
      });
    expect(resp.statusCode).toEqual(404);
  });
});

describe("DELETE /jobs/:id", function () {
  test("works: admin", async function () {
    const jobId = testJobIds[0]; // Dynamically fetch the job ID
    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
  });
});

test("fails: non-admin", async function () {
  const resp = await request(app)
    .delete("/jobs/1")
    .set("Authorization", `Bearer ${userToken}`);
  expect(resp.statusCode).toEqual(401);
});

test("not found for no such job", async function () {
  const resp = await request(app)
    .delete("/jobs/999")
    .set("Authorization", `Bearer ${adminToken}`);
  expect(resp.statusCode).toEqual(404);
});
