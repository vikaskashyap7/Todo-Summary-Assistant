require('dotenv').config();
const express = require('express');
const database = require("./config/database");
const cors = require('cors');


const app = express();
app.use(express.json());



app.use(cors());

//database connect
database.connect();


const todoRoutes = require("./routes/todoRoutes");
app.use("/api", todoRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 😁`));
