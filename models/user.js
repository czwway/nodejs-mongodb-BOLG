/**
 * Created by CZW on 2017/3/7.
 */
var mongodb = require('./db');
function User(user){
     this.niname = user.niname;
     this.name = user.name;
     this.password = user.password;
     this.email = user.email;
     this.portrait = user.portrait;
}
module.exports = User;

//存储用户信息
User.prototype.save = function(callback){
    var time = Date.parse(new Date());
    //var time = {
    //    date : date,
    //    year : date.getFullYear(),
    //    month : date.getFullYear()+"-"+(date.getMonth()-1),
    //    day : date.getFullYear()+"-"+(date.getMonth()-1)+"-"+date.getDate(),
    //    minute : date.getFullYear()+"-"+(date.getMonth()-1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes() <10 ? '0'+date.getMinutes() : date.getMinutes())
    //}
    //要存入数据库的用户信息
    var user = {
        niname: this.niname,
        name: this.name,
        password: this.password,
        email: this.email,
        time : time,
        portrait : this.portrait
    }
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);//数据库打开错误，返回err信息
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将用户信息插入users集合
            collection.insert(user,{
                safe:true
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);
                //callback(null,user[0]);
            })
        })
    })
}

//读取用户信息
User.get = function(name,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取user集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找用户名（name键）值为name的一个文档
            collection.findOne({
                name:name
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);
            })

        })
    })




}













