const io = require("socket.io")();
const uuid = require('uuid');
const socketApi = {};
socketApi.io = io;


const rooms = {};
let roomName = uuid();



io.on('connection', socket => {
    socket.on("newUser", data => {
        let newUser = {
            id:socket.id,
            name:"Oğuzhan"
        }
        if(rooms[roomName] === undefined){
                rooms[roomName] = {
                users:[]
            };
            rooms[roomName].users.push(newUser);
        }
        else if(rooms[roomName].users !== undefined && rooms[roomName].users.length < 2){
            rooms[roomName].users.push(newUser);
        }
        else{
            roomName = uuid();
            rooms[roomName] = {
                users:[]
            };
            rooms[roomName].users.push(newUser);
        }

        console.log(rooms);
    });
});


module.exports = socketApi;