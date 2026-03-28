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

app.get("/", (req, res) => {
  res.send("Hello world2");
});

app.get("/api/vi/login", (req, res) => {
  res.send("Hello login");
});

app.get("/api/vi/signup", (req, res) => {
  res.send("Hello signup");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
