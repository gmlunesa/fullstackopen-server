const mongoose = require("mongoose");

let isAddNewPerson = false;
let newName;
let newNumber;

if (process.argv.length === 3) {
  isAddNewPerson = false;
} else if (process.argv.length === 5) {
  isAddNewPerson = true;
  newName = process.argv[3];
  newNumber = process.argv[4];
} else {
  console.log(
    "Please provide the following as arguments: `node mongo.js <password> <name> <number>` to add a new entry or `node mongo.js <password>` to display all entries."
  );

  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://user01:${password}@cluster0.2jew5.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
});

const Person = mongoose.model("Person", personSchema);

const existingIds = [];
// ID Generator helper function
const doesExist = (id) => {
  return existingIds.find((existingId) => existingId === id);
};

// Random ID Generator
const generateId = () => {
  let newId = Math.floor(Math.random() * (12000 - 0) + 0);

  while (doesExist(newId)) {
    newId = Math.floor(Math.random() * (12000 - 0) + 0);
  }

  existingIds.push(newId);
  return newId;
};

if (isAddNewPerson) {
  const person = new Person({
    name: newName,
    number: newNumber,
    id: generateId(),
  });

  person.save().then((result) => {
    console.log(`Added ${newName} Number: ${newNumber} to phonebook.`);

    mongoose.connection.close();
  });
} else {
  console.log("Phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, " ", person.number);
    });

    mongoose.connection.close();
  });
}
