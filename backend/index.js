const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const userRoute = require('./routes/userRoutes')

require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json({ extended: false }));
const corsOptions = {
    origin: 'http://localhost:3000/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    };
app.use(cors(corsOptions));



app.use('/user', userRoute);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Error connecting to MongoDB:", error));

app.listen(port, () => {
    console.log("server is running.. 5000");
    
})