// const { getAllUsers } = require('./users');

// const rooms = [{ name: 'habibi1' }, { name: 'habibi2' }, { name: 'habibi3' }];
const rooms = ['habibi1', 'habibi2', 'habibi3', 'group', 'karo na']

const addRoom = ( room ) => {
    const findRoom = rooms.find((currRoom) => currRoom === room)

    // if (findRoom) {
    //     findRoom.number++;
    //     return rooms
    // }

    if (!findRoom) {
        rooms.push( room );
    }
    return rooms;
};

// const recountRoom = (room) => {
//     const findRoom = rooms.find((currRoom) => currRoom.name === room);

//     // findRoom.number--;

//     if (findRoom.number === 0) {
//         index = rooms.indexOf(findRoom);
//         rooms.splice(index, 1);
//         return rooms;
//     };

//     return rooms
// };

getAllRooms = () => {
    return rooms;
}

module.exports = {
    addRoom,
    // recountRoom,
    getAllRooms,
    rooms
}