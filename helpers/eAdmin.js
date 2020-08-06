module.exports = {
    eAdmin: function(req,res,next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Вам это нужно делать с правами администратора!")
        res.redirect("/")
    }
}