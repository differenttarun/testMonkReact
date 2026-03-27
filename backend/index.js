const connectToMongo = require('./db/db');
const express = require('express');

// connect to db 
connectToMongo();

// connect to express

const app = express();
const port = 5001;

app.use('/api/vi/testSuite', require('./routes/testSuite.js'));
app.use('/api/vi/testCase', require('./routes/testCase.js'));
app.use('/api/vi/mapTestSuiteTestCase', require('./routes/testSuiteTestCase.js'));

app.get('/', (req, res) =>{
    res.send('Hello world2');
});


app.get('/api/vi/login',(req,res) =>{
    res.send('Hello login');
});

app.get('/api/vi/signup',(req,res) =>{
    res.send('Hello signup');
});

app.listen(port,()=>{
console.log(`app listening at http://localhost:${port}`);
});


