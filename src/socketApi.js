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
        let room = JoinRoomSwitcher();
        AddUserToRoom(newUser, room);
        socket.join(room, ()=>{
            io.to(room).emit('hello', {message: `Hello ${room}`});
        });
    });
});

const GetAvailableRoom = () => {
    console.log("LOG: GET_AVAILABLE_ROOM");
    for(let room in rooms){
        console.log(room);
        console.log(rooms[room].users);
        if(room !== null && room !== undefined && rooms[room].users !== undefined && rooms[room].users.length < 3){
            console.log("test");
            return room;
        }
    }    
};

const CreateRoom = () => {
    console.log("LOG: CREATE_ROOM");
    let room = uuid();
    rooms[room] = {
        users:[]
    };
    return room;
};

const AddUserToRoom = (user, roomName) => {
    console.log("LOG: ADD_USER_TO_ROOM");
    rooms[roomName].users.push(user);
};


const JoinRoomSwitcher = () => {
    console.log("LOG: JOIN ROOM SWITCHER");
    let room = GetAvailableRoom();
    if(room === null || room === undefined){
        room = CreateRoom();
    }
    return room;
}

module.exports = socketApi;
