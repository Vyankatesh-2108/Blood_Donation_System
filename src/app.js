const express = require('express');
const path = require("path");
const app = express();
require("./db/conn");

const Register = require("./models/registers");

const hbs = require("hbs");

const port = process.env.PORT || 3002;



//bydefault which runs the index.html
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


//to get value form db
app.use(express.json());
app.use(express.urlencoded({extended:false}));


//console.log(path.join(__dirname, "../public"));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/showdonor", async(req, res) => {
    try{
        const result=await Register.find();
        res.render("showdonor",{database:result});
    }
    catch(err){
        console.log("here it is "+err);
    }
});

app.get("/database",async(req,res)=>{
    try{
        const result=await Register.find();
        res.render("database",{database:result});
    }
    catch(err){
        console.log("here it is "+err);
    }
});
//update

app.get("/:email",async(req,res)=>{

    const result=await Register.findOne({email:req.params.email});
    res.render("update",{update:result});
     
     
 });


app.post("/update", async(req, res) => {
    try{
            const nfirst = req.body.firstname;
            const nlast = req.body.lastname;
            const nemail = req.body.email;
            const nphone = req.body.phone; 
            const ngender = req.body.gender;
            const nage = req.body.age;
            const nblood = req.body.bgroup;
            
            const result = await Register.updateOne({_id:req.body.oid},{$set:{firstname:nfirst, lastname:nlast, email:nemail, phone:nphone, gender:ngender, age: nage, bgroup:nblood}});
            res.redirect("database");
    }
    catch(err){
        res.send(err);
    }
})


//delete a record

app.get("/:id/0",async(req,res)=>{
    try{

        const result=Register.findByIdAndRemove(req.params.id,(err,doc)=>{
            res.redirect('back');
        });
       

    }catch(err){
        res.status(400).send("can't delete "+err);
    }
})



//create a new user in our database
app.post("/register", async (req, res) => {
    try{
        
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
//third equal if for data type
        if(password === cpassword){

            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                bgroup: req.body.bgroup,
                password:password,
                confirmpassword:cpassword
            })

            const registered = await registerEmployee.save();
            res.status(201).render("login");



        }else{
            res.send("Your password is not matching...");
        }

    }
    catch(error){
        res.status(400).send(error);
    }
})

app.post("/login", async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        if(useremail.password === password){
            res.redirect('database');
        }else{
            //password wrong
            res.send("invalid login details...");
        }
    }
    catch(error){
        //email wrong
        res.status(400).send("invalid login details");
    }
})

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})