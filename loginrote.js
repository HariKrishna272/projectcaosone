var app = require('express');
var express = require('express');
var app = express();
const axios = require('axios');
const bp=require("body-parser");
app.use(bp.urlencoded({extended : true}));
app.use(bp.json());
app.set('view engine', 'ejs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const bcrypt = require('bcrypt');
const saltRounds = 10; // The number of salt rounds to use (10 is a good default)
const db = getFirestore();
// const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

app.use(express.static('javavs'));
app.get('/', function (req, res) {  
    
  res.render("home.ejs" );
  
    
  })  
  app.get('/Dlogin', function (req, res) {  
    
    res.render("login.ejs" );
    
      
    })  
  app.get('/Dsign', function (req, res) {  
    
      res.render("sign.ejs" );
      
        
  })  
  app.get('/Dtrans', function (req, res) {  
    
    res.render("transalte.ejs",{trasn:''});
    
      
})  
app.post('/gt', async ( req, res)=>{
  console.log(req.body);
  const text=req.body.from;
  const axios = require('axios');
  const t=req.body.lang2;
const encodedParams = new URLSearchParams();
encodedParams.set('from', 'auto');
encodedParams.set('to', t);
encodedParams.set('text', text);

const options = {
  method: 'POST',
  url: 'https://aibit-translator.p.rapidapi.com/api/v1/translator/text',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': 'ac5ddc61famshb3de3c7a540efaep1e1eb8jsn2dc3c90a88be',
    'X-RapidAPI-Host': 'aibit-translator.p.rapidapi.com'
  },
  data: encodedParams,
};

try {
	//const response = await axios.request(options);
  const response =  await axios.request(options);
	console.log(response.data);
  console.log(response.data.trans);
  res.render("transalte.ejs",{trasn:response.data.trans});
} catch (error) {
	console.error(error);
}
  

});




app.post('/signstore', async function (req, res) {
  const plainPassword = req.body.password;
  const email = req.body.email;
  const username = req.body.username;

  try {
    // Check if a user with the same email or username already exists
    const existingUser = await db.collection('login')
      .where('email', '==', email)
      .get();

    const existingUsername = await db.collection('login')
      .where('userid', '==', username)
      .get();

    if (!existingUser.empty || !existingUsername.empty) {
      return res.status(400).send(`<h2>User with the same email or username already exists <a href="/Dsign"> Sign up agian with new details </a></h2>`);
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Create a new user document with the hashed password
    db.collection('login').add({
      userid: username,
      password: hashedPassword,
      email: email
    }).then(() => {
      res.send(` <h2>Sign up successful <a href="/Dlogin">login</a> </h2>`);
    }).catch((error) => {
      console.error("Error adding user:", error);
      res.status(500).send(`<h2>Error signing up  <a href="/Dsign"> Sign up agian with new details </a></h2>`);
    });
  } catch (error) {
    console.error("Error checking for existing user or hashing password:", error);
    res.status(500).send("Error signing up");
  }
});


// const bcrypt = require('bcrypt');

app.post('/loginch', function (req, res) {
  const enteredPassword = req.body.password;
  const enteredEmail = req.body.email;

  // Retrieve the hashed password from the database based on the provided email
  db.collection('login')
    .where('email', '==', enteredEmail)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return res.send(`Login failed. User not found  <a href="/Dsign"> plz Sign up </a>`);
      }

      const userData = snapshot.docs[0].data();
      const hashedPassword = userData.password;

      // Compare the entered password with the hashed password
      bcrypt.compare(enteredPassword, hashedPassword, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        if (result) {
          // Passwords match, user is authenticated
          res.render("index.ejs");
        } else {
          // Passwords do not match, login fails
          res.send(`Login failed. Incorrect password  <a href="/Dsign"> Enter correct password </a>`);
        }
      });
    })
    .catch((error) => {
      console.error("Error querying database:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get('/getcurrency', (req, res) => {

  const currencyApi = 'https://v6.exchangerate-api.com/v6/155b158e808be266b7473814/latest/all';

             

  axios
    .get(currencyApi)
    .then((response) => {
      const conversionRates = Object.keys(response.data.conversion_rates);

      res.render('currency.ejs', { conversionRates: conversionRates, convert: "" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error fetching data from the API');
    });
  
});  
app.post('/tc', (req, res) => {
  const amount = req.body.amount;
  const from = req.body.from;
  const to = req.body.to;
  console.log(amount);
  console.log(from);
  console.log(to);


  const currencyApi = 'https://v6.exchangerate-api.com/v6/155b158e808be266b7473814/latest/' + from;

  axios.get(currencyApi).then((response) => {
    // const data = response.data;
    const ke = response.data.conversion_rates[to];
    console.log(ke);
    console.log(amount * ke);
    const h = amount * ke;
    const conversionRates = Object.keys(response.data.conversion_rates);
    //  const conversionRates: Object.keys(response.data.conversion_rates);
    res.render('currency.ejs', { conversionRates: conversionRates, convert: h });



  });
});
//weather
app.get('/Dweather', (req, res) => {
  res.render('weather', {
    City: "Mumbai", Country: "IN", Temperature: "31", Humidity: "78", Wind: "4", Condition: "Clear", MinTemp: "25.5", MaxTemp: "35.0", Pressure: "1012",
  });
});
app.post('/Dweather', (req, res) => {
  const location = req.body.city;
  const apiKey = '9ac0b58652539dbc8f2fe9a0573858e9';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
  axios.get(apiUrl).then((response) => {
    const data = response.data;
    const city = data.name; app.set('view engine', 'ejs');
    const country = data.sys.country;
    const temperature = (data.main.temp - 273.15).toFixed(0);
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const weatherCondition = data.weather[0].main;
    const minTemp = (data.main.temp_min - 273.15).toFixed(0);
    const maxTemp = (data.main.temp_max - 273.15).toFixed(0);
    const pressure = data.main.pressure;
    res.render('weather.ejs', {
      City: city, Country: country, Temperature: temperature, Humidity: humidity, Wind: wind, Condition: weatherCondition, MinTemp: minTemp, MaxTemp: maxTemp, Pressure: pressure
    });
  })
    .catch((error) => {
      console.error(error);
      res.render('weather.ejs', {
        City: "Location not found",
      });
    });
});

app.listen(3000, function () {  
  console.log('Example app listening on port 3000!')  
  })