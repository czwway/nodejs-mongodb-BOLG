
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();
var passport = require('passport')
    , GithubStrategy = require('passport-github').Strategy;
module.exports = app;//***********************************************
// all environments
app.set('port', process.env.PORT || 3000);             //设置端口为3000
app.set('views', path.join(__dirname, 'views'));     //设置views为存放视图文件的目录
app.set('view engine', 'ejs');                      //设置视图引擎为ejs
app.use(flash());
app.use(express.favicon());                         //favicon.icon图标位置，可自改
app.use(express.logger('dev'));                     //终端显示简单日记
app.use(express.bodyParser({keepExtensions:true, uploadDir:'./public/images'}));    //解析请求体，上传文件保留后缀名，保存
app.use(express.methodOverride());                      //协助处理post请求
app.use(express.cookieParser());                        //cookie解析
app.use(express.session({                               //提供会话支持
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 *30},//30day
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(passport.initialize());                         //初始化passport
app.use(app.router);                                    //调用路由解析规则
app.use(express.static(path.join(__dirname, 'public')));    //设置公共目录

passport.use(new GithubStrategy({
    clientID: "5def37ceb284025374a4",
    clientSecret: "11854de63d9796c0645d7808957a0be9bfc523d1",
    callbackURL: "http://localhost:3000/login/github/callback"
},function(accessToken, refreshToken, profile, done){
    done(null, profile);
}))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}                                                           //配置环境错误处理，输出错误信息

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//路由控制器改变
routes(app);







