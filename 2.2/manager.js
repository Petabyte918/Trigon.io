/*
	Trigon.io (manager)

	� & � iO Ninja
*/

//Setup socket.io and listen on port 3000
var express = require("express");
var app = express();
var server = require("http").Server(app);
var cors = require("cors");
var settings = require("./settings.json");
server.listen(3000);
app.use(cors());

var ins = [];
var usedPorts = [];

var totalPlayers = 0;

var Ins = function(client,port) {
	this.io = client;
	this.port = port;
	this.players = 0;
	this.io.on("players",function(n) {
		var lastPlayers = this.players;
		this.players = n;
		totalPlayers += this.players - lastPlayers;
		console.log(totalPlayers + " players");
	}.bind(this));
	this.io.on("disconnect",function() {
		ins.splice(ins.indexOf(this),1);
	}.bind(this));
	this.io.emit("start",this.port);
};

app.get("/ping",function(request,response) {
	which = -1;
	for (i in ins) {
		if (ins[i].players < settings.insMax) {
			which = i;
			break;
		};
	};
	if (which > -1) {
		response.send(String(ins[which].port));
	} else {
		response.send("0");
	};
});

app.get("/players", function(request,response) {
	response.send(String(totalPlayers));
});

var io = require("socket.io").listen(2999);

io.on("connection",function(client) {
	client.on("auth",function(k) {
		if (k == settings.authKey) {
			found = false;
			pc = 3000;
			while (!found) {
				pc++;
				if (!ins.find(function(o){return o.port == pc;})) {
					found = true;
					p = pc;
				};
			};
			ins.push(new Ins(client,p));
		};
	});
});
