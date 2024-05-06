import express from 'express';
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./database.js"

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("./loginPage.ejs",{ errorMessage:null })
})

app.get("/loginPage", (req, res) => {
    res.render("./loginPage.ejs",{ errorMessage: null })
})

app.get("/registerPage", (req, res) => {
    res.render("./registerPage.ejs",{errorMessage:null});
})


app.post("/loginUser", async (req, respond) => {

    let enteredEmail = req.body["email"], enteredPassword = req.body["password"]

    await pool.connect()

    await pool.query(`select * from users where email = '${enteredEmail}'`, (err, res) => {
        // console.log(res.rows);
      
        if (!err) {
            if(res.rows.length==0){
                respond.render("./loginPage.ejs", { errorMessage: "Wrong Email, please try again." });            
            }
            
            else if (enteredPassword == res.rows[0].password) {
                let firstName = res.rows[0].firstname, lastName = res.rows[0].lastname
                let fullName = firstName + " " + lastName
                respond.render("./ProfilePage.ejs", { fullName: fullName, firstName: firstName, lastName: lastName, email: enteredEmail })
            } else {
                respond.render("./loginPage.ejs", { errorMessage: "Wrong password, please try again." });
            }
        }
        else respond.render("./loginPage.ejs",{ errorMessage: null })
    })
    // res.render("./ProfilePage.ejs", {fullName: fullName, firstName: firstName, lastName: lastName, email: email});
})

app.post("/registerUser", async (req, respond) => {

    let firstName = req.body["firstName"], lastName = req.body["lastName"], email = req.body["email"], password = req.body["password"], confirmPassword = req.body["ConfirmPassword"]
    let fullName = firstName + " " + lastName

    await pool.connect()

    await pool.query(`select * from users where email = '${email}'`, (err, res) => {

        if (!err) {
            if(res.rows.length  != 0)
                respond.render("./registerPage.ejs",{errorMessage:"This email has already been registered"});
            else if (password != confirmPassword)
                respond.render("./registerPage.ejs",{errorMessage:"Passwords don't match"});
            else {
                 pool.connect()
                 pool.query("insert into users (email, firstname, lastname, password) values ($1, $2, $3, $4)", [email, firstName, lastName, password], (err, res) => {})
                 respond.render("./ProfilePage.ejs", { fullName: fullName, firstName: firstName, lastName: lastName, email: email })
            }
        }})

})


app.post("/editInfo", (req, res) => {
    res.render("editProfile.ejs",{errorMessage:null,oldEmail:req.body["curEmail"]});
})

app.post("/updatedProfile", async (req, respond) => {
    await pool.connect()
    await pool.query(`select * from users where email = '${req.body["email"]}'`, (err, res) => {

        if (!err) {
            if ((res.rows.length === 1 && req.body["email"] != req.body["oldEmail"]))
                respond.render("editProfile.ejs",{
                    errorMessage:"This email has already been registered",
                    oldEmail:req.body["oldEmail"]
                })
            else if(req.body["password"] != req.body["confirmPassword"])
                respond.render("editProfile.ejs",{
                    errorMessage:"Passwords don't match",
                    oldEmail:req.body["oldEmail"]
                })
            else {
                pool.query("update users set email = $1,firstname = $2,lastname = $3,password = $4 where email = $5", [req.body["email"], req.body["firstName"], req.body["lastName"], req.body["password"], req.body["oldEmail"]], (err, res) => { })
                let fullName = req.body["firstName"] + " " + req.body["lastName"]
                respond.render("./ProfilePage.ejs", { fullName: fullName, firstName: req.body["firstName"], lastName: req.body["lastName"], email: req.body["email"] })
            }
        }
    })
})




app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})
