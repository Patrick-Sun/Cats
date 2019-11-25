var version = "3.0";
var controller = {
    left:  { active:false, state:false },
    right: { active:false, state:false },
    up:    { active:false, state:false },
    keyUpDown:function(event) {
        var key_state = (event.type == "keydown") ? true : false;
        switch(event.keyCode) {
            case 37:// left key
                if (controller.left.state != key_state) controller.left.active = key_state;
                controller.left.state  = key_state;
                break;
            case 38:// up key
                if (controller.up.state != key_state) controller.up.active = key_state;
                controller.up.state  = key_state;
                break;
            case 39:// right key
                if (controller.right.state != key_state) controller.right.active = key_state;
                controller.right.state  = key_state;
                break;
        }
    }
};

        
mouseUpDown = function(event) {
    var mouse_state = (event.type == "mousedown") ? true : false;
    var mouseX = event.clientX;
    var mouseY = event.clientY;
    //console.log("X:".concat(mouseX));
    //console.log("Y:".concat(mouseY));
    
        controller.left.state = false;
        controller.left.active = false;
        controller.up.state = false;
        controller.up.active = false;
        controller.right.state = false;
        controller.right.active = false;
    
    
    if (mouseX >= 20 && mouseX <= 80 && mouseY >= height-20-80 && mouseY <= height-20) {
        if (controller.left.state != mouse_state) controller.left.active = mouse_state;
        controller.left.state = mouse_state;
    }
    if (mouseX >= 100 && mouseX <= 160 && mouseY >= height-20-80 && mouseY <= height-20) {	
        if (controller.right.state != mouse_state) controller.right.active = mouse_state;
        controller.right.state = mouse_state;
    }
    if (mouseX >= width-20-60 && mouseX <= width-20 && mouseY >= height-20-80 && mouseY <= height-20) {		
        if (controller.up.state != mouse_state) controller.up.active = mouse_state;
        controller.up.state = mouse_state;
    }
}
touchHandler = function(event) {
    if (event.touches) {
        touchList = {};
        for (var i in event.touches) {
            touchList[i] = [event.touches[i].pageX - canvas.offsetLeft, event.touches[i].pageY - canvas.offsetTop];
        }
    }
    controller.left.state = false;
    controller.left.active = false;
    controller.up.state = false;
    controller.up.active = false;
    controller.right.state = false;
    controller.right.active = false;
    for (i in touchList) {
        touchX = touchList[i][0];
        touchY = touchList[i][1];
    if (touchX >= 20 && touchX <= 80 && touchY >= height-20-80 && touchY <= height-20) {
            if (controller.left.state != true) controller.left.active = true;
            controller.left.state = true;
        }
        if (touchX >= 100 && touchX <= 160 && touchY >= height-20-80 && touchY <= height-20) {	
            if (controller.right.state != true) controller.right.active = true;
            controller.right.state = true;
        }
        if (touchX >= width-20-60 && touchX <= width-20 && touchY >= height-20-80 && touchY <= height-20) {		
            if (controller.up.state != true) controller.up.active = true;
            controller.up.state = true;
        }
    }
}
    
function updatePlayers() {
    for (var key1 in playerList) {
        if (key1 == '1') {
            updateControlCharacter(playerList[key1]);
            
        } else {
            updateCharacter(playerList[key1]);
        }
        for (var key2 in playerList) {
            if (key1 != key2) {
                var colliding = checkCollision(playerList[key1], playerList[key2]);
                playerList[key1].collide = colliding;
                playerList[key2].collide = colliding;
            }
        }
    }
}
function reDraw() {
    //clear canvas
    ctx.clearRect(0,0,width,height)
    
    //draw instructions
    // ctx.strokeStyle = "rgb(200, 200, 200)"
    // roundRect(ctx, 20, 40, 25, 25)
    // roundRect(ctx, 55, 40, 25, 25)
    // roundRect(ctx, 90, 40, 25, 25)
    // ctx.font = "16px Arial"
    // ctx.fillStyle = "rgb(200, 200, 200)";
    // ctx.fillText("controls",20, 30);
    // ctx.font = "bold 16px Arial"
    // ctx.fillText("<",28,58);
    // ctx.fillText(">",63,58);
    // ctx.font = "20px Arial"
    // ctx.fillText("^",98,63);
    //draw ground
    ctx.strokeStyle = "rgb(230, 230, 230)"
    ctx.moveTo(0, height-42);
    ctx.lineTo(width, height-42);
    ctx.stroke();
    //draw shadow
    ctx.fillStyle = "rgb(240, 240, 240)";
    drawEllipse(ctx, playerList['1'].x+(playerList['1'].width/2)-(100*(1-(height-100-playerList['1'].y)/(height-100)))/2, height-28-(12*(1-(height-100-(50)-playerList['1'].y)/(height-100-(50))))/2, 100*(1-(height-100-playerList['1'].y)/(height-100)), 12*(1-(height-100-(50)-playerList['1'].y)/(height-100-(50))));
    //draw ui
    if (controller.left.active) {
        ctx.strokeStyle = "rgb(60, 60, 60)";
    } else {
        ctx.strokeStyle = "rgb(200, 200, 200)";
    }
    roundRect(ctx, 20, height-20-80, 60, 80);
    
    if (controller.right.active) {
        ctx.strokeStyle = "rgb(60, 60, 60)";
    } else {
        ctx.strokeStyle = "rgb(200, 200, 200)";
    }
    roundRect(ctx, 100, height-20-80, 60, 80);
    
    if (playerList['1'].jumping) {
        ctx.strokeStyle = "rgb(60, 60, 60)";
    } else {
        ctx.strokeStyle = "rgb(200, 200, 200)";
    }
    roundRect(ctx, width-20-60, height-20-80, 60, 80);
    
    ctx.font = "bold 40px Arial"
    
    if (controller.left.state) {
        ctx.fillStyle = "rgb(60, 60, 60)";
    } else {
        ctx.fillStyle = "rgb(200, 200, 200)";
    }
    ctx.fillText("<",38,height-46);
    
    if (controller.right.state) {
        ctx.fillStyle = "rgb(60, 60, 60)";
    } else {
        ctx.fillStyle = "rgb(200, 200, 200)";
    }
    ctx.fillText(">",120,height-46);
    ctx.font = "56px Arial"
    if (playerList['1'].jumping) {
        ctx.fillStyle = "rgb(60, 60, 60)";
    } else {
        ctx.fillStyle = "rgb(200, 200, 200)";
    }
    ctx.fillText("^",width-63, height-32);
    ctx.font = "16px Arial"
    ctx.fillStyle = "rgb(200, 200, 200)";
    // ctx.fillText("cat_simulator_v".concat(version),width-148,30);
    // ctx.fillText(playerList['1'].status,width-148,50);
    ctx.fillText("cat_simulator_v".concat(version),20,30);
    ctx.fillText("state: " + playerList['1'].status,20,50);
    
    //draw other players
    ctx.fillStyle = "#707070";
    ctx.font = "16px Arial"
    for (var key in playerList) {
        if (key != '1') {
            playerList[key].animation.update();
            playerList[key].render();
        }
    }
    
    //draw control player
    playerList['1'].animation.update();
    playerList['1'].render();
}
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
    stroke = true;
    }
    if (typeof radius === 'undefined') {
    radius = 5;
    }
    if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
    }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
    ctx.fill();
    }
    if (stroke) {
    ctx.stroke();
    }
}
function drawEllipse(ctx, x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
    ctx.fill();
}


function updateCharacter(player) {
    player.x += player.spdX;
    player.y += player.spdY;
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
    
    player.status="walk_right";
    player.animation.change(0,sprite_sheet.frame_sets[2], 5);
}
function updateControlCharacter(player) {
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
    if (controller.left.active || controller.right.active || controller.up.active) {
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
    if (controller.left.active || controller.right.active) {
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
    if (controller.left.active) {
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
    if (controller.right.active) {
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
    if (!controller.left.active && !controller.right.active && !player.jumping && !player.turning && !player.sleep) {
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
    if (controller.up.active && !player.jumping && !player.turning && !player.idle_ani) {
        controller.up.active = false;
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
function checkCollision(player1, player2) {
    return (player1.x <= player2.x + player2.width
        && player2.x <= player1.x + player1.width
        && player1.y <= player2.y + player2.height
        && player2.y <= player1.y + player1.height);
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
    image:new Image()
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

//initialize
window.addEventListener("keydown", controller.keyUpDown);
window.addEventListener("keyup", controller.keyUpDown);
//window.addEventListener('resize', resizeCanvas, false);

window.addEventListener("mousedown", mouseUpDown);
window.addEventListener("mouseup", mouseUpDown);
window.addEventListener("touchstart", touchHandler);
window.addEventListener("touchmove", touchHandler);
window.addEventListener("touchend", touchHandler);

var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");
//resizeCanvas();
ctx.font = "16px Arial"
ctx.fillStyle = "#707070";
ctx.fillText('Loading',50,50);
var height = 300;
var width = 1000;
var playerList = {};
var touchList = [];
// createPlayer('1','Cat',300,height-100,120,80,0,0,"#d0d0d0");
//createPlayer('2','Cat2',100,height-100,120,80,4,0,"#707070");
//createPlayer('3','Cat3',300,height-100,120,80,4,0,"#707070");
//createPlayer('4','Cat4',500,height-100,120,80,4,0,"#707070");

// setInterval(gameLoop, 40);

// sprite_sheet.image.addEventListener("load", gameLoop);
sprite_sheet.image.src = "/static/cat_sprite_orange.png";
var socket = io();
socket.emit('new player');
socket.on('state', function(playerList) {
    this.playerList = playerList;
    updatePlayers();
    reDraw();
});


