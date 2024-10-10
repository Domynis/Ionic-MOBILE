const express = require('express');
const app = express();

const port = 3000;

//cors middleware
const cors = require('cors');
app.use(cors());

app.use(cors({
    origin: 'http://localhost:8100'  // Allow only the Ionic app
  }));
  

const icecreams = [
    { id: 1, name: "Chocolate", description: "Our chocolate ice cream is rich, creamy, and deeply chocolaty." },
    { id: 2, name: "Vanilla", description: "Our vanilla ice cream is rich, creamy, and deeply vanillary." },
    { id: 3, name: "Strawberry", description: "Our strawberry ice cream is rich, creamy, and deeply strawberry." }
];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get("/api/icecreams", (req, res) => {
    res.json(icecreams);
});

app.get("/api/icecreams/:id", (req, res) => {
    const icecream = icecreams.find(icecream => icecream.id === parseInt(req.params.id));
    if (!icecream) res.status(404).send("The icecream with the given ID was not found.");
    res.send(icecream);
});