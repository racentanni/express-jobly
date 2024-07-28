"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken")
const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for users", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newCompany)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          ...newCompany,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies:
          [
            {
              handle: "c1",
              name: "C1",
              description: "Desc1",
              numEmployees: 1,
              logoUrl: "http://c1.img",
            },
            {
              handle: "c2",
              name: "C2",
              description: "Desc2",
              numEmployees: 2,
              logoUrl: "http://c2.img",
            },
            {
              handle: "c3",
              name: "C3",
              description: "Desc3",
              numEmployees: 3,
              logoUrl: "http://c3.img",
            },
          ],
    });
  });

  // Tests for GET routes with filters

  // Test Cases:

  // No filter: Tests that all companies are returned when no filter is applied.
  // Filter by name: Tests that companies whose name contains the given string (case-insensitive) are returned.
  // Filter by minEmployees: Tests that companies with at least the given number of employees are returned.
  // Filter by maxEmployees: Tests that companies with no more than the given number of employees are returned.
  // Filter by minEmployees and maxEmployees: Tests that companies within the given range of employees are returned.
  // Filter by name, minEmployees, and maxEmployees: Tests that companies matching all the given criteria are returned.
  // Invalid filter (minEmployees > maxEmployees): Tests that a 400 Bad Request error is returned when minEmployees is greater than maxEmployees.
  // Invalid filter (minEmployees is not a number): Tests that a 400 Bad Request error is returned when minEmployees is not a number.
  // Invalid filter (maxEmployees is not a number): Tests that a 400 Bad Request error is returned when maxEmployees is not a number.


  test("works: filter by name", async function () {
    const resp = await request(app).get("/companies").query({ name: "C2" });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c2", name: "C2", description: "Desc2", numEmployees: 2, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("works: filter by minEmployees", async function () {
    const resp = await request(app).get("/companies").query({ minEmployees: 2 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c2", name: "C2", description: "Desc2", numEmployees: 2, logoUrl: "http://c2.img" },
        { handle: "c3", name: "C3", description: "Desc3", numEmployees: 3, logoUrl: "http://c3.img" },
      ],
    });
  });

  test("works: filter by maxEmployees", async function () {
    const resp = await request(app).get("/companies").query({ maxEmployees: 2 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "C1", description: "Desc1", numEmployees: 1, logoUrl: "http://c1.img" },
        { handle: "c2", name: "C2", description: "Desc2", numEmployees: 2, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("works: filter by minEmployees and maxEmployees", async function () {
    const resp = await request(app).get("/companies").query({ minEmployees: 1, maxEmployees: 2 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "C1", description: "Desc1", numEmployees: 1, logoUrl: "http://c1.img" },
        { handle: "c2", name: "C2", description: "Desc2", numEmployees: 2, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("works: filter by name, minEmployees, and maxEmployees", async function () {
    const resp = await request(app).get("/companies").query({ name: "C", minEmployees: 1, maxEmployees: 2 });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      companies: [
        { handle: "c1", name: "C1", description: "Desc1", numEmployees: 1, logoUrl: "http://c1.img" },
        { handle: "c2", name: "C2", description: "Desc2", numEmployees: 2, logoUrl: "http://c2.img" },
      ],
    });
  });

  test("fails: minEmployees greater than maxEmployees", async function () {
    const resp = await request(app).get("/companies").query({ minEmployees: 3, maxEmployees: 1 });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual("minEmployees cannot be greater than maxEmployees");
  });

  test("fails: minEmployees is not a number", async function () {
    const resp = await request(app).get("/companies").query({ minEmployees: "not-a-number" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual("minEmployees must be a number");
  });

  test("fails: maxEmployees is not a number", async function () {
    const resp = await request(app).get("/companies").query({ maxEmployees: "not-a-number" });
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual("maxEmployees must be a number");
  });
});

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);

    //Additional tests for Authentication

    test("fails: creating company as non-admin", async function () {
      const resp = await request(app)
        .post("/companies")
        .send({
          handle: "c4",
          name: "C4",
          description: "Desc4",
          numEmployees: 4,
          logoUrl: "http://c4.img",
          _token: userToken,
        });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("works: creating company as admin", async function () {
      const resp = await request(app)
        .post("/companies")
        .send({
          handle: "c4",
          name: "C4",
          description: "Desc4",
          numEmployees: 4,
          logoUrl: "http://c4.img",
          _token: adminToken,
        });
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        company: { handle: "c4", name: "C4", description: "Desc4", numEmployees: 4, logoUrl: "http://c4.img" },
      });
    });
  
    test("fails: updating company as non-admin", async function () {
      const resp = await request(app)
        .patch("/companies/c1")
        .send({
          name: "Updated C1",
          _token: userToken,
        });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("works: updating company as admin", async function () {
      const resp = await request(app)
        .patch("/companies/c1")
        .send({
          name: "Updated C1",
          _token: adminToken,
        });
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        company: { handle: "c1", name: "Updated C1", description: "Desc1", numEmployees: 1, logoUrl: "http://c1.img" },
      });
    });
  
    test("fails: deleting company as non-admin", async function () {
      const resp = await request(app)
        .delete("/companies/c1")
        .send({ _token: userToken });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("works: deleting company as admin", async function () {
      const resp = await request(app)
        .delete("/companies/c1")
        .send({ _token: adminToken });
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ deleted: "c1" });
    });
  });


/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
        .patch(`/companies/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

// routes/companies.test.js
describe("GET /companies/:handle with jobs", function () {
  test("works", async function () {
    const resp = await request(app).get("/companies/c1");
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "Company One",
        description: "Desc1",
        numEmployees: 10,
        logoUrl: "http://c1.img",
        jobs: [
          {
            id: expect.any(Number),
            title: "Job1",
            salary: 10000,
            equity: "0.05",
          },
          {
            id: expect.any(Number),
            title: "Job2",
            salary: 20000,
            equity: "0",
          },
        ],
      },
    });
  });
});

