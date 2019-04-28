const socket = io();
let questionNumber = 0;
let roomName_Client = null;
let trueOption = null;
let clickedAnyOpt = false;
$(document).ready(() =>{

    let userName = prompt("Lütfen kullanıcı adı giriniz");
    if(userName.trim() === '' || userName === null || userName === undefined)
        userName = prompt("Lütfen kullanıcı adı giriniz");


    
    $("#option-section").hide();
    $("#question-header").hide();
    $("#players").hide();
    
    socket.emit('JoinRoom', userName, roomName => {
        roomName_Client = roomName;
    });

    socket.on('NotEnoughUser', ( { message }) =>{
        $("#question").html("Yarışmanın başlaması için minimum kullanıcı sayısı sağlanmış değil.Lütfen bekleyiniz");            
    });
    socket.on('ReadyForGame', ( { message }) =>{
        $("#question").html("Kısa süre içerisinde yarışmamız başlayacak.")
        setTimeout(() => {
            socket.emit('StartGame');
        }, 1000);
    });

    socket.on('UsersInRoom', users => {
        $("#players").show();
        for (let i = 0; i < users.length; i++) {
            $('#p' + (i+1)).html(users[i].name + '<br><span id="pt'+ (i+1) + '">(' + users[i].point + ')</span>');
        }
    });

    socket.on('SendQuestion', (question) => {
        $("#question-header").show();
        $("#option-section").show();
        $("#question").html(question.text);
        $("#option-a-txt").html(question.a);
        $("#option-b-txt").html(question.b);
        $("#option-c-txt").html(question.c);
        $("#option-d-txt").html(question.d);
        trueOption = question.trueOption;
        questionNumber++;
    });

    $('.opt').click((e)=>{

        if(!clickedAnyOpt){
            let clickedOptionId = e.target.id;
            let clickedOption = clickedOptionId.split("-"); 
            if(clickedOption[1] === trueOption){
                if(clickedOption.length === 2)
                    $('#' + clickedOptionId).css('background-color', 'green');
                else
                    $('#opt-' + trueOption).css('background-color', 'green');
            }
            else{
                if(clickedOption.length === 2)
                    $('#' + clickedOptionId).css('background-color', 'red');
                else
                    $('#opt-' + clickedOption[1]).css('background-color', 'red');
            }
            clickedAnyOpt = true;
        }else{
            return false;
        }

            
    });
    
});