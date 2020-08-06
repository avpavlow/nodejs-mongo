const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registration", (req,res) => {
    res.render("users/registration")
})

router.post("/registration",(req,res) => {
    var erros = []
    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({text: "Неправильное имя"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({text: "Неверный адрес электронной почты"})
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        erros.push({text: "Неправильный пароль"})
    }

    if(req.body.password.length < 4){
        erros.push({text:"Пароль слишком короткий"})
    }

    if(req.body.password != req.body.password2){
        erros.push({text: "Пароли разные, попробуйте еще раз"})
    }

    if(erros.length > 0){
        res.render("users/registration", {erros})
    }
    else{
        
        User.findOne({email: req.body.email})
        .then((user) => {
            if(user)
            {
                req.flash("error_msg","В нашей системе уже есть аккаунт с этим адресом электронной почты.")
                res.redirect("/users/registration")
            }
            else{

                const novoUser = new User({
                    name:req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (erro,salt) => {
                    bcrypt.hash(novoUser.password, salt, (erro,hash) => {
                        if(erro){
                            req.flash("error_msg", "При сохранении пользователя произошла ошибка")
                            res.redirect("/")
                        }

                        novoUser.password = hash

                        novoUser.save()
                        .then(() => {
                            req.flash("success_msg", "Пользователь успешно создан!")
                            res.redirect("/")
                        })
                        .catch((err) =>{
                            req.flash("error_msg", "При создании пользователя произошла ошибка, попробуйте еще раз")
                            res.redirect("/users/registration")
                        })
                    })
                })

            }
        })
        .catch((err) => {
            req.flash("error_msg", "Произошла внутренняя ошибка")
            res.redirect("/")
        })
    }
})

router.get("/login", (req,res) => {
    res.render("users/login")
})

router.post("/login", (req,res,next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req,res,next)

})

router.get("/logout", (req,res) => {
    req.logout()
    req.flash("success_msg", "Успешный выход из системы!")
    res.redirect("/")
})

module.exports = router