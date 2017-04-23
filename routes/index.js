
/*
 * GET home page.
 */

//exports.index = function(req, res){
//  res.render('index', { title: 'Express' });
//};
var crypto = require('crypto'),         //crypto生成散列值来加密密码
    fs = require('fs'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js');
var passport = require('passport');

module.exports = function(app){
    app.get('/',function(req,res){
        Post.getAll(null, function(err, posts){
            if(err){
                posts = [];
            }
            Post.get10time(null, function(err,tenposts){
                if(err){
                    tenposts = [];
                }
            res.render('index',{
                title:'主页',
                user:req.session.user,
                tenposts : tenposts,
                posts:posts,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
        });})
        });
    });
    app.get('/reg',checkNotLogin);               //访问注册界面时检查是否已登录
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/reg',checkNotLogin);
    app.post('/reg',function(req,res){
        var niname = req.body.niname,
            name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repear'];
        //检测密码是否一致
        if(password_re != password){
            req.flash('error','两次输入的密码不一致');
            return res.redirect('/reg');//返回注册页
        }
        if( password.length <6 || password.length >16 ){
            req.flash('error','请输入6-16位密码！');
            return res.redirect('/reg');//返回注册页
        }
        //生成密码的md5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var portrait = req.body.portrait;
        var portraitData = portrait.replace(/^data:image\/\w+;base64,/,"");

        var newUser = new User({
            niname : req.body.niname,
            name : req.body.name,
            password : password,
            email : req.body.email,
            portrait : '/images/'+name+'.jpg'
        });
        //检测用户名是否存在
        User.get(newUser.name,function(err,user){
            if(user){
                req.flash('error','oh,no!此ID已被别人抢先了，呜呜呜呜....');
                return res.redirect('/reg');
            }

            newUser.save(function(err,user){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                //把图片存放入文件夹
                var dataBuffer = new Buffer(portraitData, 'base64');
                fs.writeFile('./public/images/'+name+'.jpg',dataBuffer,function(err){
                    if(err){
                        console.log('图片失败');
                    }else {
                        console.log('图片成功');
                    }
                    portrait = null;
                    portraitData = null;
                    dataBuffer = null;
                })
                //req.session.user = user;//用户信息存入session
                req.flash('success','注册成功！赶快登录玩玩吧，嘻嘻。');
                res.redirect('/login');
            })

        })
    });

    app.get('/login',checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/login',checkNotLogin);
    app.post('/login',function(req,res){
        //生成密码的md5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name,function(err,user){
            if(!user){
                req.flash('error','用户不存在！');
                return res.redirect('/login');
            }
            //检查密码是否一致
            if(user.password != password) {
                req.flash('error','密码错误！！');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登录成功！');
            return res.redirect('/');
        })
    });

    app.get('/post',checkLogin);
    app.get('/post',function(req,res){
        res.render('post',{
            title:'发表',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/post',checkLogin);
    app.post('/post',function(req,res){
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, req.body.post);

        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','文章发布成功！');
            return res.redirect('/');
        })
    });

    app.get('/upload',checkLogin);
    app.get('/upload',function(req,res){
        res.render('upload',{
            title:'上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/upload',checkLogin);
    app.post('/upload',function(req, res){
        for(var i in req.files){
            if(req.files[i].size == 0){
                //使用同步方法删除一个文件
                fs.unlink(req.files[i].path);
                console.log('成功删除一个无效文件');
            }else{
                var target_path = './public/images/'+req.files[i].name;
                //使用同步方法重命名一个文件
                fs.rename(req.files[i].path, target_path);
                console.log('成功改名一个文件');
            }
        }
        req.flash('success','文件上传成功');
        return res.redirect('/upload');
    });

    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功！');
        return res.redirect('back');//
    });

    app.get('/archive',function(req, res){
        console.log('开始进入archive');
        Post.getArchive(function(err, posts){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('archive',{
                title : '存档',
                posts : posts,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });

    app.get('/search',function(req, res){
        Post.search(req.query.keyword, function(err, posts){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            console.log(posts);
            res.render('search',{
                title : "SEARCH:"+req.query.keyword,
                posts : posts,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        })
    })

    app.get('/u/:name',function(req, res){
        var essayuser = {};
        //检查用户是否存在
        User.get(req.params.name, function(err, user){
            if(!user){
                req.flash('error','用户不存在--');
                return res.redirect('/');
            }
            essayuser = user;
            //查询返回该用户的所有文章
            Post.getAll(user.name, function(err, posts){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/');
                }
                res.render('user',{
                    title : user.name,
                    posts : posts,
                    essayuser : essayuser,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });

    app.get('/u/:name/:day/:title',function(req, res){
        Post.getOne(req.params.name, req.params.day, req.params.title,function(err, post){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('article',{
                title : req.params.title,
                post : post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });
    app.post('/u/:name/:day/:title',function(req, res){
        //留言模板
        var date = new Date(),
            time = date.getFullYear()+"-"+(date.getMonth()-1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes() <10 ? '0'+date.getMinutes() : date.getMinutes());
        var comment = {
            name : req.body.name ,
            email : req.body.email ,
            portrait : req.body.portrait ,
            website : req.body.website ,
            time : time,
            content : req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','留言成功！');
            res.redirect('back');
        });
    })


    app.post('/article',function(req, res){
        var name = unescape(req.body.name);
        var title = unescape(req.body.title);
        var username = unescape(req.body.username);
        if(req.body.like){
            console.log("有req.body.like")
            Post.addlike(name,req.body.day,title,username,function(err, post){
                if(err){
                    res.json({message:0});
                }else{
                    res.json({message:1});
                }
            });
        }else{
            console.log("没有req.body.like")
            Post.collect(name,req.body.day,title,username,function(err, post){
                if(err){
                    res.json({message:0});
                }else{
                    res.json({message:1});
                }
            });
        }
    })

    app.get('/edit/:name/:day/:title',checkLogin);
    app.get('/edit/:name/:day/:title',function(req, res){
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function(err, post){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            res.render('edit',{
                title : "编辑",
                post : post,
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });
    app.post('/edit/:name/:day/:title',checkLogin);
    app.post('/edit/:name/:day/:title',function(req, res){
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title,req.body.post, function(err){
            var url = '/u/' + encodeURI(req.params.name) + '/' + req.params.day + '/' + encodeURI(req.params.title);
            if(err){
                req.flash('error', err);
                return res.redirect(url);
            }
            req.flash('success', '文章修改成功');
            res.redirect(url);
        });

    });

    app.get('/remove/:name/:day/:title',checkLogin);
    app.get('/remove/:name/:day/:title',function(req, res){
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '文章删除成功');
            res.redirect('/');
        });

    });

    app.use(function(req, res){
        res.render("404");
    })

    //函数
    function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('eorror','未登录！');
            return res.redirect('/login');
        }
        next();
    }
    function checkNotLogin(req,res,next){
        if(req.session.user){
            req.flash('eorror','已登录！');
            return res.redirect('back');
        }
        next();
    }

};


