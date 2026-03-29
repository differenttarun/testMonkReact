const connectToMongo = require("./db/db");
const express = require("express");

// connect to db
connectToMongo();

// connect to express

const app = express();
const port = 5001;

app.use(express.json());

//Routes
app.use("/api/vi/testSuite", require("./routes/testSuiteRoute.js"));
app.use("/api/vi/testCase", require("./routes/testCaseRoute.js"));
app.use(
  "/api/vi/testSuiteTestCaseMapping",
  require("./routes/testSuiteTestCaseRoute.js"),
);
app.use("/api/vi/testData", require("./routes/testDataRoute.js"));
app.use("/api/vi/scriptmodel", require("./routes/scriptModelRoute.js"));
app.use("/api/vi/testScript", require("./routes/testScriptRoute.js"));
app.use("/api/vi/activity", require("./routes/activityRoute.js"));
app.use("/api/vi/appmodel", require("./routes/appModelRoute.js"));
app.use("/api/vi/resourcemodel", require("./routes/resourceModelRoute.js"));

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
