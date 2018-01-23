const Discordie = require('discordie');
const Events = Discordie.Events;
const client = new Discordie();
const cluster = require('cluster');
const request = require('request');
const users = require("./posts.json");
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
