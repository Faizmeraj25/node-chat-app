const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomValue = document.getElementById('room-name');
const usersUl = document.getElementById('users')
//Get username and room from URL.
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})
// console.log(username,room);


const socket = io()

//Join Chatroom
socket.emit('joinRoom', {username, room})

//Get room and users.
socket.on('roomUsers',({room,users}) =>{
    console.log(room,users);
    roomValue.innerHTML = room;
    outputRoomUsers(users)
})

//catching the emitted message from the server to the client-side.
socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight

})


//Message submit.
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //Get message texts.
    const msg = e.target.elements.msg.value
    // console.log(msg);
    
    //Emitting a message to server.
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//Output message to DOM.
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);

}

//Output Room User to DOM.
function outputRoomUsers(roomUsers){
    
    usersUl.innerHTML = `
    ${roomUsers.map(user => `<li>${user.username}</li>`).join('')}
    `
}