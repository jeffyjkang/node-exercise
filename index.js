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

// endpoint to get all planets
server.get("/planets", async (req, res) => {
  // first page of swapi planets
  const swapi = "https://swapi.co/api/planets/?page=1";
  try {
    // init all Planets array
    let allPlanets = [];
    // first page assign response, update all Planets with results
    let response = await axios.get(swapi);
    allPlanets = allPlanets.concat(response.data.results);
    // custom async for Each function
    async function asyncForEach(arr, cb) {
      for (let i = 0; i < arr.length; i++) {
        await cb(arr[i], i, arr);
      }
    }
    // update first set of planets with async function,
    // loop through each planet
    // loop again through each resident
    await (async () => {
      await asyncForEach(allPlanets, async planet => {
        let residents = planet.residents;
        // init new residents array
        let newRes = [];
        await (async () => {
          await asyncForEach(residents, async resident => {
            resident = await axios.get(resident).then(res => res.data.name);
            // add each residents name to the new residents array
            newRes.push(resident);
          });
        })();
        // reassign the planets residents array with the new residents which holds name values
        planet.residents = newRes;
      });
    })();

    // while res.data.next exists, append next page to all Planets
    while (response.data.next) {
      response = await axios.get(response.data.next);
      // create temp planets array for each iteration of next page
      let tempPlanets = response.data.results;
      // loop through each planet, then each resident
      await (async () => {
        await asyncForEach(tempPlanets, async planet => {
          let residents = planet.residents;
          let newRes = [];
          await (async () => {
            await asyncForEach(residents, async resident => {
              resident = await axios.get(resident).then(res => res.data.name);
              newRes.push(resident);
            });
          })();
          planet.residents = newRes;
        });
      })();
      // concat the existing all planets array with the new temp planets array
      allPlanets = allPlanets.concat(tempPlanets);
    }
    // return all Planets
    return res.status(200).json(allPlanets);
    // catch for api error
  } catch (error) {
    res.status(500).json({ error: "API not able to get people" });
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log("API running..."));
module.exports = { server };
