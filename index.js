require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(
  morgan(" :method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("build"));

// Token to also log the request body
morgan.token("body", function getId(req) {
  if (req.body) {
    return JSON.stringify(req.body);
  }
  return "";
});

// Returns the summary of the data and the time of the query response
app.get("/info", (request, response) => {
  Person.countDocuments()
    .then((count) => {
      console.log(count);
      response.send(
        `Phonebook has info for ${count} people <br /><br /> ${new Date()}`
      );
    })
    .catch((error) => next(error));
});

// API

// Returns the phonebook entries
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// Returns a person object (in JSON format) based on the id provided
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

// Adds a person and returns the new person object (in JSON format)
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Content missing.",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

// Delete a person object based on the id provided
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Modify a person object
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

// ERROR HANDLERS
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint" });
};

// Handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
