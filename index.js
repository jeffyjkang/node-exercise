require("dotenv").config();

const express = require("express");
const cors = require("cors");
const server = express();

server.use(express.json());
server.use(cors());
server.get("/", (req, res) => {
  res.send("<h1>Server Running<h1>");
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log("API running..."));
module.exports = { server };
