const io = require("socket.io")();
const uuid = require('uuid');
const socketApi = {};
socketApi.io = io;

const rooms = {};

io.on('connection', socket => {
    socket.on("joinRoom", ({name}) => {
        let newUser = { 
            id : socket.id, 
            name,
        }

        let room = GetAvailableRoom();

        if(room === null || room === undefined){
            room = CreateRoom();
        }
        console.log(room);

        AddUserToRoom(newUser, room);

    });
});

const GetAvailableRoom = () => {
    for(let room in rooms){
        console.log(room);
        if(room !== undefined && room.users !== undefined && room.users.length < 2){
            return room;
        }
    }    
};

const CreateRoom = () => {
    let room = uuid();
    rooms[room] = {
        users:[]
    };
    return room;
};

const AddUserToRoom = (user, roomName) => {
    rooms[roomName].users.push(user);
};


module.exports = socketApi;


// let newUser = {
        //     id:socket.id,
        //     name:data.name,
        // };
        
        // if(rooms[roomName] === undefined){
        //         rooms[roomName] = {
        //         users:[]
        //     };
        //     rooms[roomName].users.push(newUser);
        // }
        // else if(rooms[roomName].users !== undefined && rooms[roomName].users.length < 2){
        //     rooms[roomName].users.push(newUser);
        // }
        // else{
        //     roomName = uuid();
        //     rooms[roomName] = {
        //         users:[]
        //     };
        //     rooms[roomName].users.push(newUser);
        // }
        // socket.join(roomName, data => {
        //     console.log(`${roomName} odasına bağlanıldı`);
        //     io.to(roomName).emit("newQuestion", {question:`Test question for ${roomName}`});
        // });