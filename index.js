const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

// Token to also log the request body
morgan.token("body", function getId(req) {
  if (req.body) {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(
  morgan(" :method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 1,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 2,
  },
  {
    name: "Ada Lovelace",
    number: "2323-44343-232",
    id: 3,
  },
  {
    name: "Neil Armstrong",
    number: "349834",
    id: 4,
  },
];

// ID Generator helper function
const doesExist = (id) => {
  return persons.find((person) => person.id === id);
};

// Random ID Generator
const generateId = () => {
  let newId = Math.floor(Math.random() * (12000 - 0) + 0);

  while (doesExist(newId)) {
    newId = Math.floor(Math.random() * (12000 - 0) + 0);
  }

  return newId;
};

// Returns the summary of the data and the time of the query response
app.get("/info", (request, response) => {
  const numOfPersons = persons.length;
  const info = `Phonebook has info for ${numOfPersons} people <br /><br /> ${new Date()}`;

  response.send(info);
});

// API

// Returns the phonebook entries
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

// Returns a person object (in JSON format) based on the id provided
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// Adds a person and returns the new person object (in JSON format)
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Content missing.",
    });
  } else if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

// Delete a person object based on the id provided
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
