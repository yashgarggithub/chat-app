const { rooms } = require('./rooms');
const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user and room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });


    const existingRoom = rooms.find((liveRoom) => {
        return liveRoom.name === room //&& creator === 'true'
    });

    // Validate username
    // if (existingRoom) {
    //     return {
    //         error: 'That room already exists!'
    //     };
    // };

    if (existingUser) {
        return {
            error: 'Username already taken!'
        };
    };



    // Store user
    const user = { id, username, room }
    users.push(user);
    return { user }
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]
    };
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    users
};

// const users = []

// //addUser, removeUser, getUser, getUsersInRoom
// //get all users
// const addUser = ({ id, username, room }) => {

//     //remove space and convert to lowercase so that Yash and yash are same
//     username = username.trim().toLowerCase()
//     room = room.trim().toLowerCase()

//     // Validate the data
//     if (!username || !room) {
//         return {
//             error: 'Username and room are required!'
//         }
//     }

//     // Check for existing user
//     const existingUser = users.find((user) => {
//         return user.room === room && user.username === username
//     })

//     // Validate username
//     if (existingUser) {
//         return {
//             error: 'Username is in use!'
//         }
//     }

//     // Store user
//     const user = { id, username, room }
//     users.push(user)
//     return { user }
// }

// const removeUser = (id) => {
//     const index = users.findIndex((user) => user.id === id)


//     //.splice(idx, numberofElementToDelete)
//     // .splice() method returns an array of elements that were deleted from the original array
//     if (index !== -1) {
//         return users.splice(index, 1)[0]
//     }
// }

// const getUser = (id) => {
//     return users.find((user) => user.id === id)
// }

// const getUsersInRoom = (room) => {
//     room = room.trim().toLowerCase()
//     return users.filter((user) => user.room === room)
// }

// const getAllUsers = () => {
//     return users
// }

// module.exports = {
//     addUser,
//     removeUser,
//     getUser,
//     getUsersInRoom,
//     getAllUsers
// }