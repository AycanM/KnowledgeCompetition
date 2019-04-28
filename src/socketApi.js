const io = require("socket.io")();
const uuid = require('uuid');
const socketApi = {};
socketApi.io = io;

const rooms = {};

io.on('connection', socket => {
    socket.on('JoinRoom', (name, callback) => {
        let newUser = { 
            id : socket.id, 
            name,
            point:0,
            hasAnswered : false,
        }
        let room = JoinRoomSwitcher();
        AddUserToRoom(newUser, room);
        socket.join(room, () => {
            callback(room, socket.id);
            if(rooms[room].users.length === 2){
                io.to(room).emit('ReadyForGame', { message : 'Ready'});
            }
            else{
                io.to(room).emit('NotEnoughUser', { message : `Not enough user in this room: ${room}`});
            }
            socket.on('StartGame', () => {
                io.to(room).emit('UsersInRoom', rooms[room].users);
                io.to(room).emit('SendQuestion', {
                        text:'Test question',
                        a : 'A option',
                        b : 'B option',
                        c : 'C option',
                        d : 'D option',
                        trueOption: 'a',
                    } 
                );
            });

            socket.on('ClientAnswered', (cRoom, cSocketId, point) => {
                UpdateUserInfos(cRoom, cSocketId, point);
                let isRoomReadyForNewQuestion = CheckAllUsersAnswered(cRoom);
                if(isRoomReadyForNewQuestion){
                    io.to(cRoom).emit('SendQuestion', {
                            text:'Test question2',
                            a : 'A2 option',
                            b : 'B2 option',
                            c : 'C2 option',
                            d : 'D2 option',
                            trueOption: 'd',
                        } 
                    );
                }
                else{
                    socket.emit('WaitOtherUser');
                }
            });
        });
    });
    socket.on('disconnect', () => {
        let roomOfRemovedUser = RemoveUserFromRoom(socket.id);
        ResetRoom(roomOfRemovedUser, true);
        io.to(roomOfRemovedUser).emit('NotEnoughUser', { message : `Not enough user in this room: ${roomOfRemovedUser}`});
    });
});

const GetAvailableRoom = () => {
    console.log("LOG: GET_AVAILABLE_ROOM");
    for(let room in rooms){
        console.log('get_room_t: ' + room)
        console.log(rooms[room].users);
        if(room !== null && room !== undefined && rooms[room].users !== undefined && rooms[room].users.length < 2){
            console.log('get_room_t: ' + room)
            return room;
        }
    }
    console.log("-------------------------");

};

const CreateRoom = () => {
    console.log("LOG: CREATE_ROOM");
    let room = uuid();
    rooms[room] = {
        users:[],
        currentQuestion : -1,
    };
    console.log('create_room: ' + room);
    console.log("-----------------");
    return room;
};

const AddUserToRoom = (user, roomName) => {
    console.log("LOG: ADD_USER_TO_ROOM");
    rooms[roomName].users.push(user);
    console.log(rooms[roomName].users);
    console.log("----------------------");
};


const JoinRoomSwitcher = () => {
    console.log("LOG: JOIN ROOM SWITCHER");
    let room = GetAvailableRoom();
    console.log('swtchr_room_1: '  + room);
    if(room === null || room === undefined){
        room = CreateRoom();
    }
    console.log('swtchr_room_2: '  + room);
    console.log("------------------------");
    return room;
};

const RemoveUserFromRoom = (socketId) => {
    for (const room in rooms) {
        let users = rooms[room].users;
        for (let i = 0; i < users.length; i++) {
              if(users[i].id === socketId){
                  users.splice(i, 1);
                  if(users.length === 0) // Oda da herhangi bir kullanıcı kalmadığında odayı sil.
                    DeleteRoom(room);
                    return room;
              }
              
              
        }
    }
};

const ResetRoom = (room, isDisconnected) => {
    let users = null;
    if(rooms[room] !== undefined && rooms[room] !== null && 
       rooms[room].users !== undefined && rooms[room].users !== null){
           users = rooms[room].users;
       }
       
       if(users !== null && users.length !== 0){
           users.forEach(user => {
               if(isDisconnected)
                    user.point = 0;
               user.hasAnswered = false;
           });
       }
       console.log("userssss");
       console.log(rooms[room].users);
};
const DeleteRoom = (room) =>{
    delete rooms[room];
};

const UpdateUserInfos = (room, socketId, point) => {
    if(rooms[room] !== undefined && 
        rooms[room].users.length !== null && 
        rooms[room].users.length !== 0){
        for (let i = 0; i < rooms[room].users.length; i++) {
            if(rooms[room].users[i].id === socketId){
                rooms[room].users[i].point = point;
                rooms[room].users[i].hasAnswered = true;
                return;
            }
            
        }
    }
};

const CheckAllUsersAnswered = (room) => {
    if(rooms[room] !== undefined && rooms[room].users !== null){
        for (let i = 0; i < rooms[room].users.length; i++) {
            const user = rooms[room].users[i];
            if(!user.hasAnswered)
                return false;
        }

        return true;
    }
};
module.exports = socketApi;
