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
        erros.push({texto: "Неправильное имя"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Неверный адрес электронной почты"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Неправильный пароль"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto:"Пароль слишком короткий"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Пароли разные, попробуйте еще раз"})
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
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro,salt) => {
                    bcrypt.hash(novoUser.senha, salt, (erro,hash) => {
                        if(erro){
                            req.flash("error_msg", "При сохранении пользователя произошла ошибка")
                            res.redirect("/")
                        }

                        novoUser.senha = hash

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