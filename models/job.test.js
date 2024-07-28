"use strict";

// models/job.test.js
const db = require("../db");
const Job = require("./job");
const { NotFoundError, BadRequestError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(async () => {
  await commonBeforeAll();
  // Create jobs and store their IDs in testJobIds
  const job1 = await Job.create({
    title: "Job1",
    salary: 10000,
    equity: "0.05",
    companyHandle: "c1",
  });
  const job2 = await Job.create({
    title: "Job2",
    salary: 20000,
    equity: "0",
    companyHandle: "c1",
  });
  testJobIds.push(job1.id, job2.id);
});
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  test("works", async function () {
    let job = await Job.create({
      title: "Job3",
      salary: 30000,
      equity: "0.1",
      companyHandle: "c1",
    });
    expect(job).toEqual({
      id: expect.any(Number),
      title: "Job3",
      salary: 30000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });
});

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 10000,
        equity: "0.05",
        companyHandle: "c1",
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 20000,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });
});

  // Additional tests for filters...


  describe("get", function () {
    test("works", async function () {
      let job = await Job.get(testJobIds[0]); // Use dynamic job ID
      expect(job).toEqual({
        id: testJobIds[0],
        title: "Job1",
        salary: 10000,
        equity: "0.05",
        companyHandle: "c1",
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.get(999);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
  describe("update", function () {
    const updateData = {
      title: "New",
      salary: 50000,
      equity: "0.2",
    };
  
    test("works", async function () {
      let job = await Job.update(testJobIds[0], updateData); // Use dynamic job ID
      expect(job).toEqual({
        id: testJobIds[0],
        title: "New",
        salary: 50000,
        equity: "0.2",
        companyHandle: "c1",
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.update(999, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

  describe("remove", function () {
    test("works", async function () {
      await Job.remove(testJobIds[0]); // Use dynamic job ID
      const res = await db.query("SELECT * FROM jobs WHERE id=$1", [testJobIds[0]]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(999);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
