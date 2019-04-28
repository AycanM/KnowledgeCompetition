const io = require("socket.io")();
const uuid = require('uuid');
const Question = require('../models/Question');
const socketApi = {};
let questions = [];
const rooms = {};

socketApi.io = io;
io.on('connection', socket => {
    Question.find({ })
            .then((questionsfromDb) => {
                questions = questionsfromDb;
            })
            .catch((err) => {
                console.log(err);
            });
    socket.on('JoinRoom', (name, callback) => {        
        let newUser = { 
            id : socket.id, 
            name,
            point:0,
            hasAnswered : false,
        };
        let room = JoinRoomSwitcher();
        AddUserToRoom(newUser, room);
        socket.join(room, () => {
            callback(room, socket.id);
            InitializeQuestionsForRoom(room);
            if(rooms[room].users.length === 2){
                io.to(room).emit('ReadyForGame', { message : 'Ready'});
            }
            else{
                io.to(room).emit('NotEnoughUser', { message : `Not enough user in this room: ${room}`});
            }
            socket.on('StartGame', () => {
                io.to(room).emit('UsersInRoom', rooms[room].users);
                let question = GetQuestion(room, 0);
                    if(question !== null)
                        io.to(room).emit('SendQuestion',  question);
            });

            socket.on('ClientAnswered', (cRoom, cSocketId, cQuestionNumber, point) => {
                UpdateUserInfos(cRoom, cSocketId, point);
                io.to(cRoom).emit('UsersInRoom', rooms[cRoom].users);
                let isRoomReadyForNewQuestion = CheckAllUsersAnswered(cRoom);
                if(isRoomReadyForNewQuestion){
                    ResetRoom(cRoom, false);
                    let question = GetQuestion(cRoom, cQuestionNumber);
                    if(question !== null)
                        io.to(cRoom).emit('SendQuestion',  question);
                }
                else{
                    socket.emit('WaitOtherUser');
                }
            });
            
            socket.on('EndGame', (cRoom, callback) => {
                let winnerUser = GetWinnerUser(room);
                callback(winnerUser);
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
        questions:[],
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
               if(isDisconnected){
                   user.point = 0;
                    rooms[room].questions = [];
               }
               user.hasAnswered = false;
           });
       }
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
                console.log('UpdateUserInfos');
                console.log(rooms);
                console.log(rooms[room].users);
                return;
            }
            
        }
    }
};

const CheckAllUsersAnswered = (room) => {
    if(rooms[room] !== undefined && rooms[room].users !== null){
        for (let i = 0; i < rooms[room].users.length; i++) {
            const user = rooms[room].users[i];
            if(!user.hasAnswered){
                console.log('CheckAllUsersAnswered');
                console.log(user);
                console.log(rooms);
                return false;
            }
        }

        return true;
    }
};
const InitializeQuestionsForRoom = (room) => {
    if(rooms[room].questions.length === 0 && rooms[room].questions !== undefined){
        while(rooms[room].questions.length < 11){
            let questionNum = Math.floor(Math.random() * questions.length);
            if(rooms[room].questions.indexOf(questionNum) === -1)
                rooms[room].questions.push(questionNum);
        }
    }
};

const GetQuestion = (room, index) => {
    if(questions.length !== 0 && rooms[room] !== undefined && rooms[room].questions.length !== 0){
        let questionNo = rooms[room].questions[index];
        let question = questions[questionNo];
        console.log('\nquestion start\n');
        console.log(question);
        console.log('\nquestion end\n');
        return question;
    }
    return null;
};

const GetWinnerUser = (room) => {
    var users = rooms[room].users;
    let user = users[0].point > users[1].point ? users[0] : users[1];
    return user;
};

module.exports = socketApi;
