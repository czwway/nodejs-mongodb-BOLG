/**
 * Created by CZW on 2017/3/11.
 */
var mongodb = require('./db');
//var markdown = require('markdown').markdown;
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;

//存储文章信息
Post.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date : date,
        year : date.getFullYear(),
        month : date.getFullYear()+"-"+(date.getMonth()+1),
        day : date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
        minute : date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+(date.getMinutes() <10 ? '0'+date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的用户信息
    var post = {
        name : this.name,
        time : time,
        title : this.title,
        post : this.post,
        comments : [],
        pv : 0,
        like : [],
        collect : []
    }
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
            //将用户信息插入users集合
            collection.insert(post,{
                safe:true
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
//读取全部文章信息
Post.getAll = function(name,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //根据query查询文章
            collection.find(query).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                //解析 markdown 为 html
                //docs.forEach(function(doc){
                //    doc.post = markdown.toHTML(doc.post);
                //});
                callback(null,docs);
            })
        })
    })
}
//获取一篇文章
Post.getOne = function(name, day, title, callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名，日期，文章名查询
            collection.findOne({
            "name":name,
            "time.day":day,
            "title":title
            },function(err,doc){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "name":name,
                        "time.day":day,
                        "title":title
                    },{
                        $inc : {"pv" : 1}
                    },function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    })
                    callback(null, doc);
                }

            });
        })   ;
    });
};
//按时间降序查找10篇文章（）
Post.get10time = function(name,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            //根据query查询文章
            collection.find(query,{limit : 10}).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                //解析 markdown 为 html
                //docs.forEach(function(doc){
                //    doc.post = markdown.toHTML(doc.post);
                //});
                callback(null,docs);
            })
        })
    })
};
//返回原始发表的内容（markdown）
Post.edit = function (name, day, title, callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
    //读取posts集合
    db.collection('posts',function(err,collection) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        //根据用户名、发表日期及文章 进行查询
        collection.findOne({
            "name" : name ,
            "time.day" : day,
            "title" : title
        },function(err, doc){
            mongodb.close();
            if(err){
                return callback(err);
            }
            callback(null, doc);
            });
        });
    });
};
//更新文章
Post.update = function(name, day, title, post, callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name" : name ,
                "time.day" : day,
                "title" : title
            },{
                $set : { post: post }
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
//删除文章
Post.remove = function(name, day, title, callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、日期、和标题删除文章
            collection.remove({
                "name" : name ,
                "time.day" : day,
                "title" : title
            },{
                w : 1
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
//返回所有文章存档信息
Post.getArchive = function(callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //返回只包含name , time , title 属性的文档组成的存档数组
            collection.find({},{
                "name" : 1,
                "time" : 1,
                "title" : 1
            }).sort({
                time : -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};
//返回标题搜索文章
Post.search = function(keyword, callback){
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp("^.*" + keyword + ".*$", "i");
            collection.find({
                "title" : pattern
            },{
                "name" : 1 ,
                "time.day" : 1,
                "title" : 1
            }).sort({
                time : -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });



}
//点赞加上登录用户名
Post.addlike = function(name, day, title, username,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名，日期，文章名查询
            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title
            },function(err,doc){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "name":name,
                        "time.day":day,
                        "title":title
                    },{
                        //$inc : {"pv" : 1}
                        $push : {"like" : username}
                    },function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    })
                    callback(null, doc);
                }
            });
        });
    });
}
//收藏加上登录用户名
Post.collect = function(name, day, title, username,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名，日期，文章名查询
            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title
            },function(err,doc){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        "name":name,
                        "time.day":day,
                        "title":title
                    },{
                        $push : {"collect" : username}
                    },function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    })
                    callback(null, doc);
                }
            });
        });
    });
}