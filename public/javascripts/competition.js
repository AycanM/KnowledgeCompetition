var socket = io();

$(document).ready(() =>{
    socket.emit("newUser", {name:"Oğuzhan"});
});