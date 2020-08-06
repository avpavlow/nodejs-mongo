//Загружаем приложение `Express`
const express = require("express")
//Создаем роутер
const router  = express.Router()
//Загружаем инструменты для работы с БД `Mongoose`
const mongoose = require("mongoose")

//Загрузка модели категорий
require("../models/Categoria")
//Делаем подключение модели к БД
const Categoria = mongoose.model("categorias")
//Загрузка моделей почт
require("../models/Postagem")
//Делаем подключение модели к БД
const Postagem = mongoose.model("postagens")
//Загрузка функции проверки аудентификации
const {eAdmin} = require("../helpers/eAdmin")


router.get('/',eAdmin,(req, res) => {
    res.render("admin/index")
})

router.get('/posts',eAdmin, (req,res) => {
    res.send("<h1>Paginad e post</h1>")
})

router.get('/categorias',eAdmin, (req, res) => {
    Categoria.find(function (err, categorias){
          res.render("admin/categorias", {categorias} )
    }).sort({date:'desc'})
})

router.get("/categorias/add",eAdmin, (req,res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req,res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Неправильное имя" })
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
    {
        erros.push({texto:"Недействительный slug"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Название категории слишком маленькое"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros})
    }
    else{

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save()
        .then(() => {
            req.flash("success_msg", "Категория успешно создана")
            res.redirect("/admin/categorias")
        })
        .catch((err) => {
            req.flash("error_msg", "При сохранении категории произошла ошибка. Повторите попытку.")
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id",eAdmin, (req,res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editcategorias",{categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
   
})

router.post("/categorias/edit",eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id})
    .then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("sucess_msg", "Категория успешно изменена")
            res.redirect("/admin/categorias")
        }).catch((err) =>{
            req.flash("error_msg", "произошла ошибка при сохранении выпуска категории")
            res.redirect("/admin/categorias")
        })
    }).catch((err) => {
        req.flash("error_msg", "при редактировании категории произошла ошибка")
        res.redirect("/admin/categorias")
    })

})

router.post("/categoria/deletar",eAdmin, (req,res) => {
    Categoria.remove({_id: req.body.id})
    .then(()=>{
        req.flash("success_msg", "Категория успешно удалена")
        res.redirect("/admin/categorias")
    })
    .catch((err) => {
        req.flash("error_msg", "При удалении категории произошла ошибка")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens",eAdmin, (req,res) => {
    Postagem.find().populate("categoria").sort({data:"desc"})
    .then((postagens) => {
        res.render("admin/postagens",{postagens})
    }).catch((err)  => {
        req.flash("error_msg", "При перечислении сообщений произошла ошибка")
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add",eAdmin, (req,res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem",{categorias})
    })
    .catch((err) => {
        req.flash("errror_msg","При загрузке формы произошла ошибка")
        res.redirect("/admin")
    })
   
})

router.post("/postagens/nova",eAdmin, (req,res) => {
    var errors = []

    if(req.body.categoria == "0")
    {
        errors.push({texto: "Неверная категория зарегистрируйте категорию"})
    }
    if(errors.length > 0){
        res.render("admin/addpostagem",{errors})
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Сообщение успешно создано")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "При сохранении публикации произошла ошибка")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id",eAdmin, (req,res) => {

    Postagem.findOne({_id:req.params.id})
    .then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens",{categorias,postagem})
        }).catch((err) => {
            req.flash("error_msg", "При перечислении категорий произошла ошибка")
            res.redirect("/admin/postagens")
        })
    })
    .catch((err) => {
        req.flash("errors_msg", "При редактировании формы произошла ошибка")
        res.redirect("/admin/postagens")
    })
    
})

router.post("/postagens/edit",eAdmin, (req,res) => {
    Postagem.findOne({_id:req.body.id})
    .then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.conteudo
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save()
        .then(() => {
            req.flash("success_msg", "Сообщение успешно отредактировано")
            res.redirect("/admin/postagens")
        })
        .catch((err) => {
            req.flash("error_msg", "Внутренняя ошибка")
            res.redirect("/admin/postagens")
        })
    })
    .catch((err) => {
        req.flash("error_msg", "При сохранении редактирования произошла ошибка")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id",eAdmin,(req,res) => {
    Postagem.remove({_id:req.params.id})
    .then(() => {
        req.flash("success_msg", "Сообщение успешно удалено!")
        res.redirect("/admin/postagens")
    })
    .catch((err) => {
        req.flash("error_msg", "Произошла внутренняя ошибка")
        res.redirect("/admin/postagens")
    })
})

module.exports = router