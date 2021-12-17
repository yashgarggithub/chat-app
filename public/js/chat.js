//Chat.js - client side
const socket = io()    //we can access this due to config of script in index.html

//Elements
// //identify: document.querySelector('#id')
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })    //location.search: ?username=Yash+garg&room=room+Name

//The latest msg will be shown at bottom + when going through history, no autoscroll
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset + 1) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//on(): recieves event from server

//SHOWING MESSAGE
socket.on('message', (msg) => {

    //Mustache: to render msg on browser instead of log
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        messageToShow: msg.text,
        createdAt: moment(msg.createdAt).format("hh:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
    autoscroll()
})

// SHOWING CHAT HISTORY
socket.on('chat-history', (data) => {
    console.log('Chat history data:', data);

    const db = data.result
    const room = data.room

    if (db.length) {    //database is not empty
        db.forEach((message) => {

            if (message.room === room) {
                const html = Mustache.render(messageTemplate, {
                    username: message.username,
                    messageToShow: message.msg,
                    createdAt: moment(message.createdAt).format("hh:mm a")
                })
                $messages.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
                autoscroll()
            }
        })
    }
})

//SHowing Location message
socket.on('locationMessage', (msg) => {
    console.log(msg);

    const html = Mustache.render(locationMessageTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format("hh:mm a")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//SHOWING room name and room users on sidebar
socket.on('roomData', ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

//SEND button is clicked
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()  //avoid page refresh on submit

    $messageFormButton.setAttribute('disabled', 'disabled') //disabling button

    // const messageToSend = document.querySelector('input').value
    // const messageToSend = e.target.elements.messageEntered.value
    const messageToSend = $messageFormInput.value

    socket.emit('sendMessage', messageToSend, (e) => {

        $messageFormButton.removeAttribute('disabled')  //re-enabling button

        $messageFormInput.value = ''
        $messageFormInput.focus()   //the cursor focuses on input after sending

        if (e) {
            return console.log(e);
        }
        console.log('message delivered!')
    })
})

//SEND LOCATION clicked
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supoorted by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const locationObject = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        console.log('Location obtained:', locationObject);

        socket.emit('sendLocation', locationObject, () => {
            console.log('Location Shared!');
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

//Checking error while joining room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/' //redirecting to homepage
    }
})