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

// endpoint to get all people with optional param: sortBy
server.get("/people/:sortBy", async (req, res) => {
  // destructure param sortby in query endpoint
  const { sortBy } = req.params;
  // allowed params
  const allowedParams = ["name", "height", "mass"];
  if (!allowedParams.includes(sortBy)) {
    return res.status(400).json({ message: "Sort by params not allowed." });
  }
  const swapi = "https://swapi.co/api/people/?page=1";
  try {
    let allPeople = [];
    let response = await axios.get(swapi);
    allPeople = allPeople.concat(response.data.results);
    while (response.data.next) {
      response = await axios.get(response.data.next);
      allPeople = allPeople.concat(response.data.results);
    }
    // conditions to sort based on value passed into the custom sort function
    if (sortBy === "name") {
      allPeople = customSort(allPeople, "name");
    }
    if (sortBy === "height") {
      allPeople = customSort(allPeople, "height");
    }
    if (sortBy === "mass") {
      allPeople = customSort(allPeople, "mass");
    }
    return res.status(200).json(allPeople);
  } catch (error) {
    res.status(500).json({ error: "API not able to get people" });
  }
});

// custom sort function to sort people based on value of param passed
const customSort = (arr, value) => {
  if (value === "name") {
    let sorted = arr.sort((a, b) => {
      nameA = a[value].toLowerCase();
      nameB = b[value].toLowerCase();
      // left out 0, no two names will be the same
      return nameA < nameB ? -1 : 1;
    });
    return sorted;
  } else {
    let sorted = arr.sort((a, b) => {
      return Number(a[value]) - Number(b[value]);
    });
    return sorted;
  }
};

const PORT = process.env.PORT;
server.listen(PORT, () => console.log("API running..."));
module.exports = { server };
