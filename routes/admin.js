//Загружаем приложение `Express`
const express = require("express")
//Создаем роутер
const router  = express.Router()
//Загружаем инструменты для работы с БД `Mongoose`
const mongoose = require("mongoose")

//Загрузка модели категорий
require("../models/Category")
//Делаем подключение модели к БД
const Category = mongoose.model("categories")
//Загрузка моделей почт
require("../models/Post")
//Делаем подключение модели к БД
const Post = mongoose.model("posts")
//Загрузка функции проверки аудентификации
const {isAdmin} = require("../helpers/isAdmin")


router.get('/',isAdmin,(req, res) => {
    res.render("admin/index")
})



router.get('/categories',isAdmin, (req, res) => {
    Category.find(function (err, categories){
          res.render("admin/categories", {categories} )
    }).sort({date:'desc'})
})

router.get("/categories/add",isAdmin, (req,res) => {
    res.render("admin/addcategories")
})

router.post("/categories/nova", (req,res) => {
    
    var erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: "Неправильное имя" })
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
    {
        erros.push({texto:"Недействительный slug"})
    }

    if(req.body.name.length < 2){
        erros.push({texto: "Название категории слишком маленькое"})
    }

    if(erros.length > 0){
        res.render("admin/addcategories", {erros})
    }
    else{

        const novaCategoria = {
            name: req.body.name,
            slug: req.body.slug
        }

        new Category(novaCategoria).save()
        .then(() => {
            req.flash("success_msg", "Категория успешно создана")
            res.redirect("/admin/categories")
        })
        .catch((err) => {
            req.flash("error_msg", "При сохранении категории произошла ошибка. Повторите попытку.")
            res.redirect("/admin")
        })
    }
})

router.get("/categories/edit/:id",isAdmin, (req,res) => {
    Category.findOne({_id:req.params.id}).then((category) => {
        res.render("admin/editcategories",{category})
    }).catch((err) => {
        req.flash("error_msg", "Категория не существует")
        res.redirect("/admin/categories")
    })
   
})

router.post("/categories/edit",isAdmin, (req, res) => {
    Category.findOne({_id: req.body.id})
    .then((category) => {
        category.name = req.body.name
        category.slug = req.body.slug

        category.save().then(() => {
            req.flash("sucess_msg", "Категория успешно изменена")
            res.redirect("/admin/categories")
        }).catch((err) =>{
            req.flash("error_msg", "произошла ошибка при сохранении выпуска категории")
            res.redirect("/admin/categories")
        })
    }).catch((err) => {
        req.flash("error_msg", "при редактировании категории произошла ошибка")
        res.redirect("/admin/categories")
    })

})

router.post("/category/deletar",isAdmin, (req,res) => {
    Category.remove({_id: req.body.id})
    .then(()=>{
        req.flash("success_msg", "Категория успешно удалена")
        res.redirect("/admin/categories")
    })
    .catch((err) => {
        req.flash("error_msg", "При удалении категории произошла ошибка")
        res.redirect("/admin/categories")
    })
})

router.get("/posts",isAdmin, (req,res) => {
    Post.find().populate("category").sort({data:"desc"})
    .then((posts) => {
        res.render("admin/post",{posts})
    }).catch((err)  => {
        req.flash("error_msg", "При перечислении сообщений произошла ошибка")
        res.redirect("/admin")
    })
    
})

router.get("/posts/add",isAdmin, (req,res) => {
    Category.find().then((categories) => {
        res.render("admin/addpost",{categories})
    })
    .catch((err) => {
        req.flash("errror_msg","При загрузке формы произошла ошибка")
        res.redirect("/admin")
    })
   
})

router.post("/posts/nova",isAdmin, (req,res) => {
    var errors = []

    if(req.body.category == "0")
    {
        errors.push({texto: "Неверная категория зарегистрируйте категорию"})
    }
    if(errors.length > 0){
        res.render("admin/addpost",{errors})
    }
    else{
        const novaPostagem = {
            title: req.body.title,
            description:req.body.description,
            content:req.body.content,
            category: req.body.category,
            slug: req.body.slug
        }

        new Post(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Сообщение успешно создано")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "При сохранении публикации произошла ошибка")
            res.redirect("/admin/posts")
        })
    }
})

router.get("/posts/edit/:id",isAdmin, (req,res) => {

    Post.findOne({_id:req.params.id})
    .then((post) => {
        Category.find().then((categories) => {
            res.render("admin/editpost",{categories,post})
        }).catch((err) => {
            req.flash("error_msg", "При перечислении категорий произошла ошибка")
            res.redirect("/admin/posts")
        })
    })
    .catch((err) => {
        req.flash("errors_msg", "При редактировании формы произошла ошибка")
        res.redirect("/admin/posts")
    })
    
})

router.post("/posts/edit",isAdmin, (req,res) => {
    Post.findOne({_id:req.body.id})
    .then((post) => {
        post.title = req.body.title
        post.slug = req.body.slug
        post.description = req.body.content
        post.content = req.body.content
        post.category = req.body.category

        post.save()
        .then(() => {
            req.flash("success_msg", "Сообщение успешно отредактировано")
            res.redirect("/admin/posts")
        })
        .catch((err) => {
            req.flash("error_msg", "Внутренняя ошибка")
            res.redirect("/admin/posts")
        })
    })
    .catch((err) => {
        req.flash("error_msg", "При сохранении редактирования произошла ошибка")
        res.redirect("/admin/posts")
    })
})

router.get("/posts/deletar/:id",isAdmin,(req,res) => {
    Post.remove({_id:req.params.id})
    .then(() => {
        req.flash("success_msg", "Сообщение успешно удалено!")
        res.redirect("/admin/posts")
    })
    .catch((err) => {
        req.flash("error_msg", "Произошла внутренняя ошибка")
        res.redirect("/admin/posts")
    })
})

module.exports = router