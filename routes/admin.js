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
const {eAdmin} = require("../helpers/eAdmin")


router.get('/',eAdmin,(req, res) => {
    res.render("admin/index")
})

router.get('/posts',eAdmin, (req,res) => {
    res.send("<h1>Paginad e post</h1>")
})

router.get('/categories',eAdmin, (req, res) => {
    Category.find(function (err, categories){
          res.render("admin/categories", {categories} )
    }).sort({date:'desc'})
})

router.get("/categories/add",eAdmin, (req,res) => {
    res.render("admin/addcategorias")
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
        res.render("admin/addcategorias", {erros})
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

router.get("/categories/edit/:id",eAdmin, (req,res) => {
    Category.findOne({_id:req.params.id}).then((category) => {
        res.render("admin/editcategorias",{category})
    }).catch((err) => {
        req.flash("error_msg", "Esta category não existe")
        res.redirect("/admin/categories")
    })
   
})

router.post("/categories/edit",eAdmin, (req, res) => {
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

router.post("/category/deletar",eAdmin, (req,res) => {
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

router.get("/posts",eAdmin, (req,res) => {
    Post.find().populate("category").sort({data:"desc"})
    .then((posts) => {
        res.render("admin/posts",{posts})
    }).catch((err)  => {
        req.flash("error_msg", "При перечислении сообщений произошла ошибка")
        res.redirect("/admin")
    })
    
})

router.get("/posts/add",eAdmin, (req,res) => {
    Category.find().then((categories) => {
        res.render("admin/addpostagem",{categories})
    })
    .catch((err) => {
        req.flash("errror_msg","При загрузке формы произошла ошибка")
        res.redirect("/admin")
    })
   
})

router.post("/posts/nova",eAdmin, (req,res) => {
    var errors = []

    if(req.body.category == "0")
    {
        errors.push({texto: "Неверная категория зарегистрируйте категорию"})
    }
    if(errors.length > 0){
        res.render("admin/addpostagem",{errors})
    }
    else{
        const novaPostagem = {
            title: req.body.title,
            descricao:req.body.descricao,
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

router.get("/posts/edit/:id",eAdmin, (req,res) => {

    Post.findOne({_id:req.params.id})
    .then((post) => {
        Category.find().then((categories) => {
            res.render("admin/editposts",{categories,post})
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

router.post("/posts/edit",eAdmin, (req,res) => {
    Post.findOne({_id:req.body.id})
    .then((post) => {
        post.title = req.body.title
        post.slug = req.body.slug
        post.descricao = req.body.content
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

router.get("/posts/deletar/:id",eAdmin,(req,res) => {
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