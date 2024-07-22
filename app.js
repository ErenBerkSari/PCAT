const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const Photo = require('./models/Photo');
const photoController = require('./controllers/photoControllers');
const pageController = require('./controllers/pageController');

const app = express();

// Connect to DB
mongoose.connect(
  'mongodb+srv://erennn:4vbXKCKWO6zEjNOD@cluster0.fpzprnt.mongodb.net/?retryWrites=true&w=majority&deneme=Cluster0',

  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Template Engine
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);

// Routes
app.get('/', photoController.getAllPhotos);

app.get('/photos/:id', photoController.getPhoto);

app.post('/photos', photoController.createPhoto);

app.put('/photos/:id', photoController.updatePhoto);

app.delete('/photos/:id', photoController.deletePhoto);

app.get('/about', pageController.getAboutPage);

app.get('/add', pageController.getAddPage);

app.get('/photos/edit/:id', pageController.getEditPage);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
