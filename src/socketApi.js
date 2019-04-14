const io = require("socket.io")();
const uuid = require('uuid');
const socketApi = {};
socketApi.io = io;


const rooms = {};
let roomName = uuid();



io.on('connection', socket => {
    socket.on("joinRoom", data => {
        let newUser = {
            id:socket.id,
            name:data.name,
        };
        
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
        socket.join(roomName, data => {
            console.log(`${roomName} odasına bağlanıldı`);
            io.to(roomName).emit("newQuestion", {question:`Test question for ${roomName}`});
        });
    });
});


module.exports = socketApi;