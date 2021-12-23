//Chat.js - client side
const socket = io()    //we can access this due to config of script in index.html

//Elements
// //identify: document.querySelector('#id')
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
// const $messagesRecieved = document.querySelector('#messages-recieved')
// const $messagesSent = document.querySelector('#messages-sent')

//Templates
// const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options: after user clicks join room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })    //location.search: ?username=Yash+garg&room=room+Name

//The latest msg will be shown at bottom + when going through history, no autoscroll
const autoscroll = () => {
    $messages.scrollTop = $messages.scrollHeight
}

//on(): recieves event from server

//SHOWING MESSAGE
socket.on('message', (msg) => {

    //showing message by creative individual div for each message
    //left & right can be seen by 'incoming' & 'outgoing' (CSS)

    const currDiv = document.createElement('div')
    if (username === msg.username) {
        currDiv.classList.add('outgoing', 'message')
    }
    else {
        currDiv.classList.add('incoming', 'message')
    }

    const markup = `
        <h4>${msg.username}</h4>
        <h5>${moment(msg.createdAt).format("hh:mm a")}</h5>
        <p>${msg.text}</p>
    `
    currDiv.innerHTML = markup  //redering
    $messages.appendChild(currDiv)  //appending to messages

    //Mustache: to render msg on browser instead of log
    // const html = Mustache.render(messageTemplate, {
    //     username: msg.username,
    //     messageToShow: msg.text,
    //     createdAt: moment(msg.createdAt).format("hh:mm a")
    // })
    // $messages.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
    // if (username === msg.username) {
    //     $messagesSent.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
    // }
    // else {
    //     $messagesRecieved.insertAdjacentElement('beforeend', html)
    // }
    autoscroll()
})

// SHOWING CHAT HISTORY
socket.on('chat-history', (data) => {
    console.log('Chat history data:', data);

    const db = data.result
    const room = data.room

    if (db.length) {    //database is not empty
        db.forEach((msg) => {   //iterating complete db

            if (msg.room === room) {    //checking messages of current room
                const currDiv = document.createElement('div')
                if (username === msg.username) {
                    currDiv.classList.add('outgoing', 'message')
                }
                else {
                    currDiv.classList.add('incoming', 'message')
                }

                const markup = `
                    <h4>${msg.username}</h4>
                    <h5>${moment(msg.createdAt).format("hh:mm a")}</h5>
                    <p>${msg.msg}</p>
                `
                currDiv.innerHTML = markup
                $messages.appendChild(currDiv)
                // const html = Mustache.render(messageTemplate, {
                //     username: message.username,
                //     messageToShow: message.msg,
                //     createdAt: moment(message.createdAt).format("hh:mm a")
                // })
                // $messages.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
                // if (username === message.username) {
                //     $messagesSent.insertAdjacentHTML('beforeend', html) //beforeend: latest msg will be at bottom
                // }
                // else {
                //     $messagesRecieved.insertAdjacentHTML('beforeend', html)
                // }
                autoscroll()
            }
        })
    }
})

//SHowing Location message
socket.on('locationMessage', (msg) => {
    console.log(msg);

    const currDiv = document.createElement('div')
    currDiv.classList.add('outgoing', 'message')
    const markup = `
                    <h4>${msg.username}</h4>
                    <h5>${moment(msg.createdAt).format("hh:mm a")}</h5>
                    <p><a href="${msg.url}" target="_blank">My current Location</a></p>
                `
    currDiv.innerHTML = markup
    $messages.appendChild(currDiv)

    // const html = Mustache.render(locationMessageTemplate, {
    //     username: msg.username,
    //     url: msg.url,
    //     createdAt: moment(msg.createdAt).format("hh:mm a")
    // })
    // $messages.insertAdjacentHTML('beforeend', html)
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
        // $messageFormInput.value = ''
        // $messageFormInput.innerText = ''
        // $messageForm.reset()
        $messageFormInput.focus()   //the cursor focuses on input after sending

        if (e) {
            return console.log(e);
        }
        console.log('message delivered!')
        autoscroll()
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
    autoscroll()
})

//Checking error while joining room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/' //redirecting to homepage
    }
})