const socket = io();
let questionNumber = 0;
let roomName_Client = null;
let socketIdOnServer = null;
let trueOption = null;
let clickedAnyOpt = false;
let point = 0;
$(document).ready(() =>{

    let userName = null;
    while(true){
        if(userName.trim() === '' || userName === null || userName === undefined)
            userName = prompt("Lütfen kullanıcı adı giriniz");
        else
            break;
    }


    
    $("#option-section").hide();
    $("#question-header").hide();
    $("#players").hide();
    
    socket.emit('JoinRoom', userName, (roomName, socketId) => {
        roomName_Client = roomName;
        socketIdOnServer = socketId;
        console.log(roomName_Client);
        console.log(socketIdOnServer);
    });

    socket.on('NotEnoughUser', ( { message }) =>{
        $("#question").html("Yarışmanın başlaması için minimum kullanıcı sayısı sağlanmış değil.Lütfen bekleyiniz");
        $("#option-section").hide();
        $("#question-header").hide();
        $("#players").hide();
        questionNumber = 0;
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
        clickedAnyOpt = false;
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
                point += 10;
                socket.emit('ClientAnswered', roomName_Client, socketId, point);
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
    
    socket.on('WaitOtherUser', () => {
        $("#question-header").hide();
        $("#option-section").hide();
        $("#question").html("Diğer kullanıcıların cevap vermesi bekleniyor.");
    });
});