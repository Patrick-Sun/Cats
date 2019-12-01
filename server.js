// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');var app = express();
var server = http.Server(app);
var io = socketIO(server);app.set('port', 3000);
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function(request, response) {
response.sendFile(path.join(__dirname, 'index.html'));

});// Starts the server.
server.listen(3000, function() {
  console.log('Starting server on port 3000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
    socket.on('new player', function(room, playerName) {
        if (!roomList[room]) {
            createRoom(room);
            console.log("Created room [" + room + "] (" + socket.id + ")");
        }

        if (!roomList[room].playerList[playerName]) {
            console.log("Created player [" + playerName + "] in room [" + room + "] ("+ socket.id + ")");
            createPlayer(room, playerName,playerName,300,height-100,120,80,0,0,"#d0d0d0");
        } else {
            console.log("Resumed player [" + playerName + "] in room [" + room + "] ("+ socket.id + ")");
            roomList[room].playerList[playerName].typing = false;
            roomList[room].playerList[playerName].message = "";
            roomList[room].playerList[playerName].message2 = "";
        }
    });
    socket.on('controls', function(room, controls, playerName) {
        if (roomList[room].playerList[playerName]) {
            roomList[room].playerList[playerName].controller.leftActive = controls.left.active;
            roomList[room].playerList[playerName].controller.leftState = controls.left.state;
            roomList[room].playerList[playerName].controller.rightActive = controls.right.active;
            roomList[room].playerList[playerName].controller.rightState = controls.right.state;
            roomList[room].playerList[playerName].controller.upActive = controls.up.active;
            roomList[room].playerList[playerName].controller.upState = controls.up.state;
        }   
    });
    socket.on('chat', function(room, timestamp, playerName) {
        if (roomList[room].playerList[playerName]) {
            roomList[room].playerList[playerName].typing = !roomList[room].playerList[playerName].typing;
        }
        if (roomList[room].playerList[playerName].typing) {
            roomList[room].playerList[playerName].message = "";
        } else {
            roomList[room].playerList[playerName].message2 = roomList[room].playerList[playerName].message;
            roomList[room].playerList[playerName].messageTime = timestamp;
        }
    });
    socket.on('message', function(room, keyCode, playerName) {
        if (roomList[room].playerList[playerName]) {
            if (keyCode == 8) {
                if (roomList[room].playerList[playerName].message.length > 0) {
                    roomList[room].playerList[playerName].message = roomList[room].playerList[playerName].message.substring(0, roomList[room].playerList[playerName].message.length - 1);
                }
              } else if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || keyCode==32) {
                roomList[room].playerList[playerName].message = roomList[room].playerList[playerName].message + String.fromCharCode(keyCode).toLowerCase();

                roomList[room].playerList[playerName].sleep_frame = 0;
                if (roomList[room].playerList[playerName].sleep) {
                    roomList[room].playerList[playerName].waking = true;
                }
            }
        }
    });
});



var height = 300;
var width = 1000;
var roomList = {};

function createRoom(id) {
    var room = {
        playerList: {},
        mouseList: []
    }
    roomList[id] = room;
}

function createPlayer(room,id,name,x,y,width,height,spdX,spdY,color) {
    var player = {
        x:x,
        y:y,
        width:width,
        height:height,
        spdX:spdX,
        spdY:spdY,
        name:name,
        id:id,
        jumping:false,
        collide:false,
        color:color,
        dir:1,
        animation:new Animation(),
        controller: new Controller(),
        to_from_idle_frame:0,
        turning:false,
        turn_frame:0,
        idle:true,
        idle_frame:0,
        idle_ani:false,
        idle_ani_frame:0,
        idle_ani_type:0,
        sleep_frame:0,
        sleeping:false,
        to_sleep_frame:0,
        from_sleep_frame:0,
        waking:true,
        status:"loading...",
        typing:false,
        message:"",
        message2:"",
        messageTime:"",
        collideFrame: 0,
        score: 0
    };
    roomList[room].playerList[id] = player;
}

setInterval(function() {
    updatePlayers();
    updateMice();
    detectCollision();
    for (room in roomList) {
        io.sockets.emit('state_' + room, roomList[room]);
    }
}, 15);

setInterval(function() {
    for (room in roomList) {
        if (roomList[room].mouseList.length < 3) {
            var random = Math.floor(Math.random() * (100 - 1)) + 1;
            if (random <= 30) {
                direction = Math.round(Math.random());

                if (direction == 1) {
                    createMouse(room,-120,height-100,120,80,5,direction);
                } else {
                    createMouse(room,width,height-100,120,80,-5,direction);
                }
                console.log("Created Mouse in room [" + room + "]");
            }
        }
    }
}, 2000);

setInterval(function() {
    for (room in roomList) {
        for (var i = 0; i < roomList[room].mouseList.length; i++) {
            var random = Math.floor(Math.random() * (100 - 1)) + 1;
            if (random <= 10 && !roomList[room].mouseList[i].randTurn && !roomList[room].mouseList[i].randIdle) {
                roomList[room].mouseList[i].randTurn = true;
            }
        }
    }
}, 500);
setInterval(function() {
    for (room in roomList) {
        for (var i = 0; i < roomList[room].mouseList.length; i++) {
            var random = Math.floor(Math.random() * (100 - 1)) + 1;
            if (random <= 10 && !roomList[room].mouseList[i].randTurn && !roomList[room].mouseList[i].randIdle) {
                roomList[room].mouseList[i].randIdle = true;
            }
        }
    }
}, 500);

function updatePlayers() {
    for (var room in roomList) {
        for (var player in roomList[room].playerList) {
            updateCharacter(roomList[room].playerList[player]);
        }
    }
    for (var room in roomList) {
        for (var player in roomList[room].playerList) {
            roomList[room].playerList[player].animation.update();
        }
    }
}

function updateCharacter(player) {
    //movement
        player.spdY += 2;
        player.x += player.spdX;
        player.spdX *= 0.9;
        player.y += player.spdY;
        player.spdY *= 0.98;
        
    //bounds
        if (player.x > width) {
            player.x = -player.width;
        }
        else if(player.x + player.width < 0) {
            player.x = width;
        }
        if (player.y > height - 100) {
            player.jumping = false;
            player.y = height - 100;
            player.spdY = 0;
        }
    //sleep
        if (player.idle) {
            player.sleep_frame += 1;
        }
        if (player.sleep && !player.waking) {
            player.dir = 1;
            player.status = "sleep_right";
            player.animation.change(16,sprite_sheet.frame_sets[13], 5); 
            player.idle_frame = 0;
        } 
        if (player.waking) {
            if (player.from_sleep_frame <= 100) {
                if (player.dir == 0) {
                    //NA
                } else {
                    player.status = "waking_right";
                    player.animation.change(18,sprite_sheet.frame_sets[15], 5); 
                }
                player.from_sleep_frame += 1;
                return;
            } else {
                player.sleep = false;
                player.waking = false;
                player.from_sleep_frame = 0;
            }
        }
        if (player.sleep_frame >= 1000 && !player.idle_anie && !player.sleep) {
            if (player.dir == 0 && player.to_sleep_frame <= 65) {
                player.status = "to_sleep_left";
                player.animation.change(17,sprite_sheet.frame_sets[14], 5);
                player.to_sleep_frame += 1;
                return;
            } else if (player.dir == 1 && player.to_sleep_frame <= 90) {
                player.status = "to_sleep_right";
                player.animation.change(15,sprite_sheet.frame_sets[12], 5); 
                player.to_sleep_frame += 1;
                return;
            } else {
                player.to_sleep_frame = 0;
                player.sleep = true;
                return;
            }
        }
        if (player.controller.leftActive || player.controller.rightActive || player.controller.upActive) {
            player.sleep_frame = 0;
            if (player.sleep) {
                player.from_sleep_frame = 0;
                player.waking = true;
                return;
            }
        }
    
    //locked animations
    //- turning
        if (player.turning) {
            if (player.turn_frame >= 14) {
                player.turning = false;
                player.turn_frame = 0;
                player.to_from_idle_frame = 0;
                player.idle_frame = 0;
                player.idle = false;
            } else {
                player.turn_frame += 1;
                return;
            }
        }
        
    //- end still_idle
        if (player.controller.leftActive || player.controller.rightActive) {
            player.idle_frame = 0;
        }
        
    //-idle transitions
        if (player.to_from_idle_frame >= 14) {
            player.idle = !player.idle;
            player.to_from_idle_frame = 0;
            player.idle_frame = 0;
        }
        
    //- idle
        var idle_ani_length;
        //pick idle type
        if (player.idle_ani_type == 1) {
            idle_ani_length = 20;
        } else {
            idle_ani_length = 85;
        }
        //continue/end idle animation
        if (player.idle_ani) {
            if (player.idle_ani_frame >= idle_ani_length) {
                player.idle_ani = false;
                player.idle_ani_frame = 0;
            } else {
                player.idle_ani_frame += 1;
                return;
            }
        }
        //start idle animation
        if (!player.idle_ani && player.idle_frame > 300 && !player.sleep) {
            var random = Math.floor(Math.random() * (100 - 1)) + 1;
            
            if (random <= 70) {
                player.idle_ani_type = 1;
            } else {
                player.idle_ani_type = 2;
            }
            
            player.idle_ani = true;
            player.idle_frame = 0;
            player.idle_ani_frame = 0;
        }
        //play idle animation
        if (player.idle_ani) {
            if (player.dir == 0 ) {
                if (player.idle_ani_type == 1) {
                    player.status="ear_twitch_left";
                    player.animation.change(8,sprite_sheet.frame_sets[9], 5);
                } else {
                    player.status="lick_left";
                    player.animation.change(14,sprite_sheet.frame_sets[11], 5); 
                }
                return;
            } else {
                if (player.idle_ani_type == 1) {
                    player.status="ear_twitch_right";
                    player.animation.change(8,sprite_sheet.frame_sets[8], 5);
                } else {
                    player.status="lick_right";
                    player.animation.change(13,sprite_sheet.frame_sets[11], 5); 
                }
                return;
            }
        }
        
        
    //unlocked animations
    //- go left
        if (player.controller.leftActive) {
            if (player.idle & !player.jumping) {
                player.to_from_idle_frame += 1;
                if (player.dir == 1) {
                    player.animation.change(6,sprite_sheet.frame_sets[7], 5);
                    player.status="from_idle_right";
                } else {
                    player.animation.change(7,sprite_sheet.frame_sets[7], 5);
                    player.status="from_idle_left";
                }
                return;
            } else {
                if (player.dir == 0 & !player.idle) {
                    player.spdX -= 0.5;
                }
                if (!player.jumping) {
                    if (player.dir == 0) {
                        player.status="walk_left";
                        player.animation.change(1,sprite_sheet.frame_sets[3], 5);
                    } else {
                        player.status="turn_left";
                        player.turning = true
                        player.animation.change(2,sprite_sheet.frame_sets[4], 3);
                        player.dir = 0;
                        return;
                    }
                }
            }
        }
    //- go right
        if (player.controller.rightActive) {
            if (player.idle & !player.jumping) {
                player.to_from_idle_frame += 1;
                if (player.dir == 1) {
                    player.animation.change(6,sprite_sheet.frame_sets[7], 5);
                    player.status="from_idle_right";
                } else {
                    player.animation.change(7,sprite_sheet.frame_sets[7], 5);
                    player.status="from_idle_left";
                }
                return;
            } else {
                if (player.dir == 1 & !player.idle) {
                    player.spdX += 0.5;
                }
                if (!player.jumping) {
                    if (player.dir == 1) {
                        player.status="walk_right";
                        player.animation.change(0,sprite_sheet.frame_sets[2], 5);	
                    } else {
                        player.status="turn_right";
                        player.turning = true
                        player.animation.change(3,sprite_sheet.frame_sets[5], 3);
                        player.dir = 1;
                        return;
                    }
                }
            }
        }
        
    //- start/continue still_idle
        if (!player.controller.leftActive && !player.controller.rightActive && !player.jumping && !player.turning && !player.sleep) {
            player.spdX *= 0.9;
            if (player.idle) {
                if (player.dir == 0) {
                    player.animation.change(5,sprite_sheet.frame_sets[0], 15);
                    //player.status="idle_left - ".concat(player.idle_frame);
                    player.status="idle_left";
                    player.idle_frame += 1;
                } else {
                    player.animation.change(4,sprite_sheet.frame_sets[0], 15); 
                    //player.status="idle_right - ".concat(player.idle_frame);
                    player.status="idle_right";
                    player.idle_frame += 1;
                }
            } else {
                if (player.dir == 0) {
                    player.to_from_idle_frame += 1;
                    player.animation.change(7,sprite_sheet.frame_sets[6], 5);
                    player.status="to_idle_left";
                    return;
                } else {
                    player.to_from_idle_frame += 1;
                    player.animation.change(6,sprite_sheet.frame_sets[6], 5); 
                    player.status="to_idle_right";
                    return;
                }
            }
        }
        
    //- jump	
        //start jump
        if (player.controller.upActive && !player.jumping && !player.turning && !player.idle_ani) {
            player.controller.upActive = false;
            player.jumping = true;
            //player.idle = false;
            player.spdY -=24;
        }
        
        //play jump
        if (player.jumping) {
            if (player.idle) {
                if (player.dir == 0 ) {
                    player.status="idle_jump_left";
                    player.spdX -= 0.5;
                    player.animation.change(12,sprite_sheet.frame_sets[10], 3);
                    player.idle_frame = 0;
                    return;
                } else {
                    player.status="idle_jump_right";
                    player.spdX += 0.5;
                    player.animation.change(11,sprite_sheet.frame_sets[1], 3); 
                    player.idle_frame = 0
                    return;
                }
            } else {
                if (player.dir == 0 ) {
                    player.status="jump_left";
                    player.spdX -= 0.5;
                    player.animation.change(10,sprite_sheet.frame_sets[10], 3);
                    return;
                } else {
                    player.status="jump_right";
                    player.spdX += 0.5;
                    player.animation.change(9,sprite_sheet.frame_sets[1], 3); 
                    return;
                }
            }
        }
}

var sprite_sheet = {
    frame_sets:[[0,1,2,1],                  //0.idle        [4|5]
                [0,1,2,3,4,5,6],			//1.jump right  [9|11]
                [0,1,2,3,4,5,6,7],          //2.walk right  [0]
                [7,6,5,4,3,2,1,0],          //3.walk left   [1]
                [0,1,2,3,4,4,4,4,4],        //4.turn left   [2]
                [0,1,2,3,4,4,4,4,4],        //5.turn right  [3]
                [0,1,2,3,3,3],              //6.to idle right [6|7]
                [3,2,1,0,0,0],              //7.from idle right [6|7]
                [0,1,0,1],          		//8.ear twitch right (idle_1) [8]
                [2,3,2,3],          		//9.ear twitch left (idle_1) [8] 
                [6,5,4,3,2,1,0],			//10.jump left 	[10|12]
                [0,1,2,3,3,4,5,6,7,7,8,9,10,11,12,1,0],//11.lick [13|14]
                [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],//12.to sleep right [15]
                [0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],//13.sleep right [16]
                [0,1,2,3,4,5,6,7,8,9,10,11,12,13],//14.to sleep left [17]
                [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]],//15.from_sleep_right [18]
};
var Controller = function() {
    this.leftActive = false;
    this.leftState = false;
    this.rightActive = false;
    this.rightState = false;
    this.upActive = false;
    this.upState= false;
};
var Animation = function(frame_group, frame_set, delay) {
    this.frame_group = frame_group;//Sprite row.
    this.count = 0;// Counts the number of game cycles since the last frame change.
    this.delay = delay;// The number of game cycles to wait until the next frame change.
    this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.
    this.frame_index = 0;// The frame's index in the current animation frame set.
    this.frame_set = frame_set;// The current animation frame set that holds sprite tile values.
};
Animation.prototype = {
    /* This changes the current animation frame set. For example, if the current
    set is [0, 1], and the new set is [2, 3], it changes the set to [2, 3]. It also
    sets the delay. */
    change:function(frame_group, frame_set, delay) {
        if (!(this.frame_group == frame_group && this.frame_set == frame_set)) {// If the frame set is different:
            this.frame_group = frame_group;
            this.count = 0;// Reset the count.
            this.delay = delay;// Set the delay.
            this.frame_index = 0;// Start at the first frame in the new frame set.
            this.frame_set = frame_set;// Set the new frame set.
            this.frame = this.frame_set[this.frame_index];// Set the new frame value.
        }
    },
    /* Call this on each game cycle. */
    update:function() {
        this.count ++;// Keep track of how many cycles have passed since the last frame change.
        if (this.count >= this.delay) {// If enough cycles have passed, we change the frame.
            this.count = 0;// Reset the count.
            /* If the frame index is on the last value in the frame set, reset to 0.
            If the frame index is not on the last value, just add 1 to it. */
            this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
            this.frame = this.frame_set[this.frame_index];// Change the current frame value.
        }
    }
};

function createMouse(room,x,y,width,height,spdX,dir) {
    var mouse = {
        x:x,
        y:y,
        width:width,
        height:height,
        spdX:spdX,
        jumping:false,
        collide:false,
        dir:dir,
        animation:new Animation(),
        controller: new Controller(),
        to_from_idle_frame:0,
        turning:false,
        turn_frame:0,
        idle:false,
        idle_frame:0,
        idle_ani:false,
        idle_ani_frame:0,
        idle_ani_type:0,
        status:"loading...",
        randTurn:false,
        randIdle:false,
    };
    roomList[room].mouseList.push(mouse);
}

function updateMice() {
    for (var room in roomList) {
        for (var mouse in roomList[room].mouseList) {
            updateMouse(roomList[room].mouseList[mouse]);
        }
    }
    for (var room in roomList) {
        for (var mouse in roomList[room].mouseList) {
            roomList[room].mouseList[mouse].animation.update();
        }
    }
}

function updateMouse(mouse) {
    //movement
        mouse.x += mouse.spdX;
        mouse.spdX *= 0.9;
        
    //bounds
        if (mouse.x > width) {
            // mouse.x = -mouse.width;
            mouse.collide = true;
        }
        else if(mouse.x + mouse.width < 0) {
            // mouse.x = width;
            mouse.collide = true;
        }
    
        if (!mouse.turning && !mouse.randIdle && !mouse.idle) {
            if (mouse.dir == 0) {
                mouse.spdX -= 0.5;
                mouse.status="walk_left";
                mouse.animation.change(1,sprite_sheet.frame_sets[3], 5);
            } else {
                mouse.spdX += 0.5;
                mouse.status="walk_right";
                mouse.animation.change(0,sprite_sheet.frame_sets[2], 5);	
            }
        }
    
    //locked animations
    //- turning
        if (mouse.turning) {
            if (mouse.turn_frame >= 14) {
                mouse.turning = false;
                mouse.turn_frame = 0;
                // mouse.to_from_idle_frame = 0;
                // mouse.idle_frame = 0;
                // mouse.idle = false;
            } else {
                mouse.turn_frame += 1;
                return;
            }
        }

        
    //-idle transitions
        if (mouse.to_from_idle_frame >= 14) {
            if (mouse.idle) {
                mouse.randIdle = false;
            }
            mouse.idle = !mouse.idle;
            mouse.to_from_idle_frame = 0;
            mouse.idle_frame = 0;
        }      
        
    //unlocked animations
    if (mouse.randTurn) {
        mouse.randTurn = false;
        if (mouse.dir == 1) {
            mouse.status="turn_left";
            mouse.turning = true
            mouse.animation.change(2,sprite_sheet.frame_sets[4], 3);
            mouse.dir = 0;
            mouse.spdX = -mouse.spdX
            return;
        } else {
            mouse.status="turn_right";
            mouse.turning = true
            mouse.animation.change(3,sprite_sheet.frame_sets[5], 3);
            mouse.dir = 1;
            mouse.spdX = -mouse.spdX
            return;
        }
    }

    if (mouse.randIdle) {
        mouse.spdX *= 0.9;
        if (mouse.idle) {
            if (mouse.idle_frame <= 50) {
                if (mouse.dir == 0) {
                    mouse.animation.change(5,sprite_sheet.frame_sets[0], 15);
                    mouse.status="idle_left";
                    mouse.idle_frame += 1;
                } else {
                    mouse.animation.change(4,sprite_sheet.frame_sets[0], 15); 
                    mouse.status="idle_right";
                    mouse.idle_frame += 1;
                }
            } else {
                mouse.to_from_idle_frame += 1;
                if (mouse.dir == 1) {
                    mouse.animation.change(6,sprite_sheet.frame_sets[7], 5);
                    mouse.status="from_idle_right";
                } else {
                    mouse.animation.change(7,sprite_sheet.frame_sets[7], 5);
                    mouse.status="from_idle_left";
                }
                return;
            }
        } else {
            if (mouse.dir == 0) {
                mouse.to_from_idle_frame += 1;
                mouse.animation.change(7,sprite_sheet.frame_sets[6], 5);
                mouse.status="to_idle_left";
                return;
            } else {
                mouse.to_from_idle_frame += 1;
                mouse.animation.change(6,sprite_sheet.frame_sets[6], 5); 
                mouse.status="to_idle_right";
                return;
            }
        }
    }
}

function detectCollision() {
    var xBuffer = 30
    var yBuffer = 10;
    for (room in roomList) {
        var tempMouseList = [];
        for (player in roomList[room].playerList) {
            for (var i = 0; i < roomList[room].mouseList.length; i++) {
                if (((roomList[room].playerList[player].x + xBuffer <= roomList[room].mouseList[i].x && roomList[room].playerList[player].x + roomList[room].playerList[player].width - xBuffer >= roomList[room].mouseList[i].x) || (roomList[room].playerList[player].x + xBuffer <= roomList[room].mouseList[i].x + roomList[room].mouseList[i].width && roomList[room].playerList[player].x + roomList[room].playerList[player].width - xBuffer >= roomList[room].mouseList[i].x + roomList[room].mouseList[i].width) || (roomList[room].playerList[player].x + xBuffer <= roomList[room].mouseList[i].x && roomList[room].playerList[player].x + roomList[room].playerList[player].width - xBuffer >= roomList[room].mouseList[i].x + roomList[room].mouseList[i].width) || (roomList[room].playerList[player].x + xBuffer >= roomList[room].mouseList[i].x && roomList[room].playerList[player].x + roomList[room].playerList[player].width - xBuffer <= roomList[room].mouseList[i].x + roomList[room].mouseList[i].width)) && ((roomList[room].playerList[player].y + yBuffer <= roomList[room].mouseList[i].y && roomList[room].playerList[player].y + roomList[room].playerList[player].height - yBuffer >= roomList[room].mouseList[i].y) || (roomList[room].playerList[player].y + yBuffer <= roomList[room].mouseList[i].y + roomList[room].mouseList[i].height && roomList[room].playerList[player].y + roomList[room].playerList[player].height - yBuffer >= roomList[room].mouseList[i].y + roomList[room].mouseList[i].height) || (roomList[room].playerList[player].y + yBuffer <= roomList[room].mouseList[i].y && roomList[room].playerList[player].y + roomList[room].playerList[player].height - yBuffer >= roomList[room].mouseList[i].y + roomList[room].mouseList[i].height) || (roomList[room].playerList[player].y + yBuffer >= roomList[room].mouseList[i].y && roomList[room].playerList[player].y + roomList[room].playerList[player].height - yBuffer <= roomList[room].mouseList[i].y + roomList[room].mouseList[i].height))) {
                    if (roomList[room].playerList[player].jumping && roomList[room].playerList[player].spdY > 0) {
                        roomList[room].mouseList[i].collide = true;
                        roomList[room].playerList[player].collide = true;
                        roomList[room].playerList[player].score += 1;
                    }
                }
            }
            for (var i = 0; i < roomList[room].mouseList.length; i++) {
                if (!roomList[room].mouseList[i].collide) {
                    tempMouseList.push(roomList[room].mouseList[i]);
                }
            }
            roomList[room].mouseList = tempMouseList;
        }
        if (roomList[room].playerList[player].collide) {
            if (roomList[room].playerList[player].collideFrame <= 40) {
                roomList[room].playerList[player].collideFrame += 1;
            } else {
                roomList[room].playerList[player].collideFrame = 0
                roomList[room].playerList[player].collide = false;
            }    
        }
    }
}