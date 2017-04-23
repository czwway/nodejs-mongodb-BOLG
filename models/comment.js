/**
 * Created by CZW on 2017/3/12.
 */
var mongodb = require('./db');

function Comment(name, day, title, comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback){
    console.log(this.name+'*'+this.day+'*'+this.title+'*'+this.comment);
   var name = this.name,
    day = this.day,
    title = this.title,
    comment = this.comment;
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);//数据库打开错误，返回err信息
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //通过用户名、时间及标题查找文档，并把一条留言加入到comments数组里
            collection.update({
                "name" : name,
                "time.day" : day,
                "title" : title
            },{
                $push : {"comments" : comment}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};



