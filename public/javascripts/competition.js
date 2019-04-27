var socket = io();

$(document).ready(() =>{
    socket.emit("joinRoom", {name:"Oğuzhan"});
    socket.on('hello', ({message}) => {
        console.log(message);
    });
});