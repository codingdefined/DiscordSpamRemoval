const Discordie = require('discordie');
const Events = Discordie.Events;
const client = new Discordie();
const cluster = require('cluster');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
 
let db = new sqlite3.Database('posts.db');

db.serialize(function() {
  db.run("CREATE TABLE if not exists posts_info (discordName TEXT, post TEXT, time TEXT, channel_id TEXT)");
});

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < 1; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);

    client.connect({
        token: 'Bot Token'
    });

    client.Dispatcher.on(Events.GATEWAY_READY, e => {
        console.log('Connected as: ' + client.User.username);
    });

    client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
        if (e.message.author.bot) {
            return;
        }
        checkPosts(e);
    });
}

function checkPosts(event) {

    let isPostValid = !!event.message.content.match(
        /(http|https):\/\/(www\.steemit\.com\/|steemit\.com\/|busy\.org\/|www\.busy\.org\/)/g
    );
    console.log(isPostValid);
    if (isPostValid) {
        isUserAddedPost(event)
            .then(function(item) {
                console.log(item);
                if(item) {
                    var postValue = event.message.content.split('@')[1].split('/')[1];
                    var currentCreatedTimestamp = event.message.edited_timestamp || event.message.timestamp;
                    console.log(currentCreatedTimestamp);
                    console.log(item.time);
                    var d1 = new Date(currentCreatedTimestamp);
                    var d2 = new Date(item.time);
                    var timeDiff = Math.abs(d1 - d2) / 36e5;
                    console.log(timeDiff);
                    if(postValue === item.post) {
                        event.message.reply('You have Already Shared the Post before, your post is deleted');
                        event.message.delete();
                    } else if(timeDiff < 2) {
                        event.message.reply('You should only share the post once in 2 hours, your post is deleted');
                        event.message.delete();
                    } else {
                        db.serialize(function() {
                            let data = [postValue, currentCreatedTimestamp, item.discordName];
                            db.run("UPDATE posts_info SET post=?,time=? where discordName=?", data);
                        });
                    }
                }
                else {
                    var postValue = event.message.content.split('@')[1].split('/')[1];
                    let currentCreatedTimestamp = event.message.edited_timestamp || event.message.timestamp;
                    json = JSON.stringify({discordName: event.message.author.id, post: postValue, time: currentCreatedTimestamp});
                    console.log(json);
                    db.serialize(function() {
                        var data = [event.message.author.id,postValue,currentCreatedTimestamp,event.message.channel_id];
                        db.run("INSERT into posts_info(discordName,post,time,channel_id) VALUES (?,?,?,?)",data);
                    });
                }
            }).catch(function (e) {
                console.log(e);
            });
    }
}

function isUserAddedPost(event){
 return new Promise(function(yes, no) {
    console.log(db);
    db.serialize(function() {
        var selectData = [event.message.author.id, event.message.channel_id];
        db.get("SELECT discordName, post, time, channel_id FROM posts_info WHERE discordName=? AND channel_id=?",selectData, function(err, row) {
            if (err){
                console.log(err);
                no(err);
            }
            else {
                if(row) {
                    console.log(row);
                    var item = {
                        discordName: row.discordName,
                        post: row.post,
                        time: row.time,
                        channel_id: row.channel_id
                    }
                    yes(item);
                }
                yes(null);
            }
        });
    });
 });
}
