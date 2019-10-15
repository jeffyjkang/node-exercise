require("dotenv").config();

const express = require("express");
const cors = require("cors");
const server = express();
const axios = require("axios");

server.use(express.json());
server.use(cors());
server.get("/", (req, res) => {
  res.send("<h1>Server Running<h1>");
});

// endpoint to get all people
server.get("/people", async (req, res) => {
  // first page of swapi people
  const swapi = "https://swapi.co/api/people/?page=1";
  try {
    // init all people array
    let allPeople = [];
    // first page assign response, update all people with results
    let response = await axios.get(swapi);
    allPeople = allPeople.concat(response.data.results);
    // while res.data.next exists, append next page to all people
    while (response.data.next) {
      response = await axios.get(response.data.next);
      allPeople = allPeople.concat(response.data.results);
    }
    // console.log(allPeople.length);
    // return all people
    return res.status(200).json(allPeople);
    // catch for api error
  } catch (error) {
    res.status(500).json({ error: "API not able to get people" });
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log("API running..."));
module.exports = { server };
