import express from 'express';
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./database.js"

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname , "Public")));

app.get("/", (req, res) => {
    res.render("./loginPage.ejs")
})

app.get("/loginPage", (req, res) => {
    res.render("./loginPage.ejs")
})

app.get("/registerPage", (req, res) => {
    res.render("./registerPage.ejs");
})


app.post("/loginUser", async (req, respond) => {

    let enteredEmail = req.body["email"], enteredPassword = req.body["password"] 

    await pool.connect()

    await pool.query(`select * from users where email = '${enteredEmail}'`, (err, res) => {

        if(!err)
            {
                if(enteredPassword == res.rows[0].password)
                    {
                       let firstName = res.rows[0].firstname, lastName = res.rows[0].lastname
                       let fullName = firstName + " " + lastName
                       respond.render("./ProfilePage.ejs", {fullName: fullName, firstName: firstName, lastName: lastName, email: enteredEmail})
                    }else{
                        respond.render("./loginPage.ejs")
                    }
            }
        else respond.render("./loginPage.ejs")
    })
    // res.render("./ProfilePage.ejs", {fullName: fullName, firstName: firstName, lastName: lastName, email: email});
})

app.post("/registerUser", async (req, respond) => {
    console.log(req.body);

    let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"], confirmPassword = req.body["ConfirmPassword"]
    let fullName = firstName + " " + lastName

    if(password != confirmPassword)
        res.render("./registerPage.ejs");
    else {
        await pool.connect()

        await pool.query("insert into users (email, firstname, lastname, password) values ($1, $2, $3, $4)",[email, firstName, lastName, password] ,(err, res) => {
            if(!err)
                {
                    console.log(true)
                    respond.render("./ProfilePage.ejs", {fullName: fullName, firstName: firstName, lastName: lastName, email: email})
                }
                else {
                    res.render("./registerPage.ejs");
                }
        })  
        pool.end()
    }
})








app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})
