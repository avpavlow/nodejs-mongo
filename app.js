//Carregando modulos
const express = require('express')
const handlebars = require("express-handlebars")
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Post")
const Post = mongoose.model("posts")
require("./models/Category")
const Category = mongoose.model("categories")
const users = require("./routes/user")
const passport = require("passport")
const hbshelpers = require('handlebars-helpers');
const multihelpers = hbshelpers();

require("./config/auth")(passport)
//Configurações
    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    //Middlweware
        app.use((req,res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next()
        })
    //Body Parser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())
    //handlebars
        app.engine('handlebars',handlebars({helpers: multihelpers, defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')


    //Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/blogapp")
        .then(() => {
            console.log("Conectado ao mongo")
        })
        .catch( (err) =>
        {
            console.log("Erro ao conectar " + err)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public")))

//Rotas
    app.get("/", (req,res) => {
        Post.find().populate("category").sort({data:"desc"})
        .then((posts) => {
            res.render("index",{posts})
        })
        .catch((err) => {
            req.flash("error_msg", "Произошла внутренняя ошибка")
            res.redirect("/404")
        })
        
    })

    app.get("/post/:slug", (req,res) => {
        Post.findOne({slug:req.params.slug})
        .then((post) => {
            if(post){
                res.render("post/index",{post})
            }
            else{
                req.flash("error_msg", "Этот пост не существует")
                res.redirect("/")
            }
        })
        .catch((err) => {
            req.flash("error_msg", "Произошла внутренняя ошибка")
            res.redirect("/")
        })
    })

    app.get("/categories", (req,res) => {
        Category.find().then((categories) => {
            res.render("categories/index",{categories})
        }).catch((err) => {
            req.flash("error_msg", "При перечислении категорий произошла внутренняя ошибка")
            res.redirect("/")
        })
    })

    app.get("/categories/:slug", (req,res) => {
        Category.findOne({slug:req.params.slug}).then((category) => {
            if(category){
                Post.find({category: category._id})
                .then((posts) => {
                    res.render("categories/posts", {posts,category})
                })
                .catch((err) => {
                    req.flash("error_msg", "При перечислении сообщений произошла ошибка")
                    res.redirect("/")
                })
            }
            else{
                req.flash("error_msg", "Эта категория не существует")
                res.redirect("/")
            }
        })
        .catch((err) => {
            req.flash("error_msg", "При загрузке страницы для этой категории произошла внутренняя ошибка")
            res.redirect("/")
        })
    })

    app.get("/404", (req,res) => {
        res.send("Erro 404!")
    })

    app.get("/posts", (req,res) => {
        res.send("Post")
    })

    app.use('/admin', admin)
    app.use("/users",users)
//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Aleksey Pavlov");
})