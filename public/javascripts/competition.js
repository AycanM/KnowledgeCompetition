var socket = io();

$(document).ready(() =>{
    socket.emit("joinRoom", {name:"Oğuzhan"});

    socket.on("newQuestion", ({question})=>{
        alert(question);
    });
});