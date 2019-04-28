const socket = io();
let questionNumber = 0;
let roomName_Client = null;
let socketIdOnServer = null;
let trueOption = null;
let clickedAnyOpt = false;
let point = 0;
$(document).ready(() =>{

    $("#option-section").hide();
    $("#question-header").hide();
    $("#players").hide();

    let userName = '';
    while(true){
        if(userName.trim() === '')
            userName = prompt("Lütfen kullanıcı adı giriniz");
        else
            break;
    }


    
    
    
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
        questionNumber++;
        $('.opt').removeClass('true');
        $('.opt').removeClass('false');
        $("#question").html('Soru yükleniyor...');
        setTimeout(()=>{
            $("#question-header").show();
            $("#option-section").show();
            $("#question").html(question.text);
            $("#option-a-txt").html(question.a);
            $("#option-b-txt").html(question.b);
            $("#option-c-txt").html(question.c);
            $("#option-d-txt").html(question.d);
            trueOption = question.trueOption;
            clickedAnyOpt = false;
        }, 1500);
        
    });

    $('.opt').click((e) => {

        if(!clickedAnyOpt){
            let clickedOptionId = e.target.id;
            let clickedOption = clickedOptionId.split("-"); 
                if(clickedOption[1] === trueOption){
                    if(clickedOption.length === 2)
                        $('#' + clickedOptionId).addClass('true');
                    else
                        $('#opt-' + trueOption).addClass('true');
                    point += 10;
                    setTimeout(() => {
                        socket.emit('ClientAnswered', roomName_Client, socketIdOnServer, questionNumber, point);
                    }, 1500);
                }
                else{
                    if(clickedOption.length === 2)
                        $('#' + clickedOptionId).addClass('false');
                    else
                        $('#opt-' + clickedOption[1]).addClass('false');
                    setTimeout(() => {
                        socket.emit('ClientAnswered', roomName_Client, socketIdOnServer, questionNumber, point);
                    }, 1500);
                }
                clickedAnyOpt = true;
                
                if(questionNumber === 11){
                    socket.emit("EndGame", roomName_Client, (winnerUser) => {
                        let alertText = winnerUser.name + '\n' + 'Puan: ' + winnerUser.point;
                        alert(alertText);
                    });
                }
            
        }else{
            return false;
        }

            
    });
    
    socket.on('WaitOtherUser', () => {
        $("#question-header").hide();
        $("#option-section").hide();
        $("#question-header").hide();
        $("#question").html("Diğer kullanıcıların cevap vermesi bekleniyor.");
    });
});