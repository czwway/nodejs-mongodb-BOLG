/**
 * Created by CZW on 2017/4/6.
 */
var mongodb = require('../models/db');
var Comment = require('../models/comment.js');

getAll();

var getAll = function(){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return err;
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return err;
            }
            var query = {};
            //根据query查询文章
            collection.find(query).sort({
                time:-1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return err;
                }

                return docs ;
            })
        })
    })
}





