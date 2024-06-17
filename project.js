const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const body_parser = require("body-parser");
const db = require("mysql");
const { error } = require("console");

const app = express();

//connection with html and css is done 
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, ("../try-1/views")));
app.use(express.static(path.join(__dirname, ("../try-1/public"))));
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.json());

//Data base creation here
const connection = db.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "Reshant"
})

//For the temp data store here 
let nm = "";
let em = "";
let pass = "";
let id = "";
// checking whether the data base connection is created or not 

connection.connect((error) => {
    if (error) throw error;
    else {
        console.log("The data base connection is completed here ");
    }
});

//Creating route for the login here

app.get("/", (req, res) => {
    res.render("login");
});

//Checking whether data is correct or not here 

app.post("/", (req, res) => {
    //Taking the data from the user here 
    const email = req.body.email;
    const password = req.body.password;

    //checking the data is recived here or not 
    if (!email && !password) {
        console.log("The data is not recived here ");
        res.redirect("/");
    }
    //taking data from the data base here 
    connection.query("SELECT * FROM user ", (err, result) => {
        if (err) throw err;
        let Login = false;

        //Using for loop here for running the code until it find correct email and password 
        for (let i = 0; i < result.length; i++) {
            let users = result[i];
            if (users.email === email && users.password === password) {
                nm = users.fullname;
                em = users.email;
                pass = users.password;
                id = users.id;
                Login = true;
                console.log("Login is Sucessfull here ")
                console.log(users);
                res.redirect("/profile");
                break;
            }
        }
        if (!Login) {
            console.log("The email or password is incorrect here ");
            res.redirect("/");
        }
    })
});


//creating the route for the registration here 

app.get("/register", (req, res) => {
    res.render("register");
})

//Checking the password is correct or not here by taking from user

app.post("/register", (req, res) => {
    //Taking the data from the user here 
    const fullname = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm;

    //Checking the password is correct or not 
    if (password === confirm) {
        connection.query("INSERT INTO user(fullname, email, password)VALUE(?,?,?)",
            [fullname, email, password],
            (err, result) => {
                if (err) throw err;
                console.log("The data insertion is done here ");
                result.fullname = nm;
                result.email = em;
                result.password = pass;
            })
        console.log("The name is :- ", nm);
        console.log("The email is :- ", em);
        console.log("The password is :- ", pass);
        res.redirect("/");
    }
})
//creation the route for the profile here 
app.get("/profile", (req, res) => {
    res.render("profile");
})

//Creating the route for the info here 
app.get("/info", (req, res) => {
    console.log("The name is :- ", nm);
    console.log("The email is :- ", em);
    console.log("The password is :- ", pass);
    res.render("data", { nm, em, pass });
})

//creating the route for the update here 
app.get("/update", (req, res) => {
    res.render("update");
});

app.post("/update", (req, res) => {
    const { fullname, email, password } = req.body;
    
    // Debug: Log the received form data
    console.log("Form Data: ", { fullname, email, password });
    
    // Query to find the user with current session details
    connection.query("SELECT * FROM user ", [nm, em, pass], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const userId = result[0].id; // Use the id of the found user

            // Update the user with new details
            connection.query(
                "UPDATE user SET fullname = ?, email = ?, password = ? WHERE id = ?",
                [fullname, email, password, userId],
                (err, upresult) => {
                    if (err) throw err;
                    console.log("Updation is successful");

                    // Update session variables with new details
                    nm = fullname;
                    em = email;
                    pass = password;

                    res.redirect("/info");
                }
            );
        } else {
            console.log("No user found with the current session details");
            res.redirect("/update");
        }
    });
});

app.listen(5000, () => {
    console.log("Server is working on the port 5000");
})