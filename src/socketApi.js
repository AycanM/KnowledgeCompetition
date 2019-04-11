const io = require("socket.io")();

const socketApi = {};
socketApi.io = io;

io.on('connection', socket=>{
    console.log("user connected");
    socket.on("disconnect", () => {
        console.log("a user disconnected");
    });
});


module.exports = socketApi;