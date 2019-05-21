process.env.JEST = true;

module.exports = {
  testMatch: ["**/__tests__/*.[jt]s?(x)"],
  collectCoverage: true,
  coverageReporters: ["text"],
  testEnvironment: "node",
  maxConcurrency: 10
};
