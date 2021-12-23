const socket = io()

const $rooms = document.querySelector('#rooms');
const $roomsTemplate = document.querySelector('#rooms-template').innerHTML;
const $noRoomsTemplate = document.querySelector('#no-rooms-template').innerHTML;
const $roomButton = document.querySelector('#room');

socket.on('showExistingRooms', (rooms) => {
    console.log('On show existing rooms');
    
    if (rooms.length === 0) {
        console.log('No rooms');
        rooms.push({
            text: 'There are currently no live rooms. Create one!',
        });

        const html = Mustache.render($noRoomsTemplate, {
            rooms
        });

        return $rooms.innerHTML = html;
    };

    console.log('Rooms available:', rooms);
    const html = Mustache.render($roomsTemplate, {
        rooms
    });

    $rooms.innerHTML = html;

});