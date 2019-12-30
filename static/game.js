var socket = io();
randRoom = Math.floor(Math.random() * 9999);
var room = prompt("Enter room number...", randRoom);
if (room == "") {
  room = randRoom
}

var playerName = prompt("Choose a name...", "Unnamed Cat");
if (playerName == "") {
  playerName = "Unnamed Cat";
}
var date = new Date();

socket.emit('new player', room, playerName);

socket.on('connect', function() {
  console.log("Me: " + socket.id);
  playerID = socket.id;
});

var sprite_sheet = new Image();
var sprite_sheet_mice = new Image();

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
              socket.emit('controls', room, controller, playerName);
              break;
          case 38:// up key
              if (controller.up.state != key_state) controller.up.active = key_state;
              controller.up.state  = key_state;
              socket.emit('controls', room, controller, playerName);
              break;
          case 39:// right key
              if (controller.right.state != key_state) controller.right.active = key_state;
              controller.right.state  = key_state;
              socket.emit('controls', room, controller, playerName);
              break;
          case 13://enter key
            if (key_state) {
              socket.emit('chat', room, date.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"}), playerName);
              break;
            }
      }

      if (localPlayerList[playerName] && localPlayerList[playerName].typing) {
          if (key_state) {
            socket.emit('message', room, event.keyCode, playerName);
          }
      }
  },

  touchHandler:function(event) {
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
    socket.emit('controls', room, controller, playerName);
  }
};
var version = "3.0";

socket.on('state_' + room, function(room) {
    localPlayerList = room.playerList;
    localMouseList = room.mouseList;
    reDrawPlayers();
    reDrawMice();
});

var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");
ctx.font = "16px Arial"
ctx.fillStyle = "#707070";
ctx.fillText('Loading',50,50);
var height = 300;
var width = 1000;
var localPlayerList = {};
var localMouseList = [];
var touchList = [];

sprite_sheet.src = "/static/cat_sprite_orange.png";
sprite_sheet_mice.src = "/static/mice_sprite_grey.png";
window.addEventListener("keydown", controller.keyUpDown);
window.addEventListener("keyup", controller.keyUpDown);
window.addEventListener("touchstart", controller.touchHandler);
window.addEventListener("touchmove", controller.touchHandler);
window.addEventListener("touchend", controller.touchHandler);

function reDrawPlayers() {
  ctx.clearRect(0,0,width,height)
  //draw ground
  ctx.strokeStyle = "rgb(230, 230, 230)"
  ctx.moveTo(0, height-42);
  ctx.lineTo(width, height-42);
  ctx.stroke();


  for (var mouse in localMouseList) {
    if (!localMouseList[mouse].collide) {
      reDrawMiceShadow(localMouseList[mouse]);
    }
  }

  for (var key in localPlayerList) {
    reDrawShadow(localPlayerList[key]);
  }

  if (localPlayerList[playerName]) {
    reDrawUI(localPlayerList[playerName]);
  }
  for (var key in localPlayerList) {
    if (key != playerName) {
      render(localPlayerList[key]);
    }
  }
  if (localPlayerList[playerName]) {
    render(localPlayerList[playerName]);
  }
}

function reDrawUI(player) {
  
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

  if (player.jumping) {
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
  if (player.jumping) {
      ctx.fillStyle = "rgb(60, 60, 60)";
  } else {
      ctx.fillStyle = "rgb(200, 200, 200)";
  }
  ctx.fillText("^",width-63, height-32);
  ctx.font = "16px Arial"
  ctx.fillStyle = "rgb(200, 200, 200)";
  // ctx.fillText("cat_simulator_v".concat(version),width-148,30);
  // ctx.fillText(player.status,width-148,50);
  // ctx.fillText("cat_simulator_v".concat(version),20,30);
  // ctx.fillText("state: " + player.status,20,50);
  ctx.fillText("Room: " +room,20,30);

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

function reDrawShadow(player) {
  //draw shadow
  ctx.fillStyle = "rgb(240, 240, 240)";
  drawEllipse(ctx, player.x+(player.width/2)-(100*(1-(height-100-player.y)/(height-100)))/2, height-28-(12*(1-(height-100-(50)-player.y)/(height-100-(50))))/2, 100*(1-(height-100-player.y)/(height-100)), 12*(1-(height-100-(50)-player.y)/(height-100-(50))));
}
function render (player) {
  if (player.name == playerName) {
    ctx.font = "bold 12px Arial"
    ctx.fillStyle = "rgb(120, 120, 120)";
    if (player.typing) {
      ctx.fillText("[msg]: " + player.message,player.x,player.y-50);
      if (player.message2 != "") {
        ctx.fillStyle = "rgb(120, 120, 120)";
        ctx.fillText("[" + player.messageTime + "] " + player.message2,player.x,player.y-65);
      }
    } else {
      ctx.fillStyle = "rgb(200, 200, 200)";
      ctx.fillText("[Press enter to type]",player.x,player.y-50);
      ctx.fillStyle = "rgb(120, 120, 120)";
      if (player.message2 != "") {
        ctx.fillText("[" + player.messageTime + "] " + player.message2,player.x,player.y-65);
      }
    }
  } else {
    ctx.font = "bold 12px Arial"
    if (player.message2 != "") {
      ctx.fillStyle = "rgb(120, 120, 120)";
      ctx.fillText("[" + player.messageTime + "] " + player.message2,player.x,player.y-50);
      if (player.typing) {
        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.fillText("[typing...]",player.x,player.y-66);
      }
    } else {
      if (player.typing) {
        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.fillText("[typing...]",player.x,player.y-50);
      }
    }
  }


  ctx.font = "16px Arial";
  ctx.fillStyle = "rgb(160, 160, 160)";
  ctx.fillText("[" + player.score + "] " + player.name,player.x,player.y-30);

  //ctx.fillText(player.status,player.x,player.y-20)
  // touchString = ""
  // for (i in touchList) {
  // 	touchString = touchString + "[" + touchList[i][0] + "," + touchList[i][1] + "]";
  // }
  // ctx.fillText(touchString, player.x, player.y - 20);

  ctx.drawImage(
      sprite_sheet,
      player.animation.frame * player.width,
      player.animation.frame_group * player.height,
      player.width,
      player.height,
      Math.floor(player.x),
      Math.floor(player.y),
      player.width,
      player.height);
};

/*WIP*/
function reDrawMice() {
  for (var mouse in localMouseList) {
    renderMouse(localMouseList[mouse]);
  }
}

function renderMouse (mouse) {
  if (mouse.collide) {

    
    if (mouse.collideFrame <= 20) {
      effectRadius = mouse.collideFrame * 2 * 2;
      ctx.fillStyle = "rgba(255, 120, 120, " + ((40-(mouse.collideFrame * 2))/40) + ")";
      drawEllipse(ctx, mouse.x + (mouse.width/2) - effectRadius, mouse.y + (mouse.height/2) - effectRadius, effectRadius*2, effectRadius*2);
    }



    ctx.strokeStyle = "rgb(60, 60, 60)"
    ctx.fillStyle = "rgb(60, 60, 60)"
    roundRect(ctx, mouse.x, mouse.y+10, 63, 27)
    ctx.fill();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText("MICE!",mouse.x + 10,mouse.y + 30);
  } else {
    ctx.drawImage(
        sprite_sheet_mice,
        mouse.animation.frame * mouse.width,
        mouse.animation.frame_group * mouse.height,
        mouse.width,
        mouse.height,
        Math.floor(mouse.x),
        Math.floor(mouse.y),
        mouse.width,
        mouse.height);
  }
};
function reDrawMiceShadow(mouse) {
  //draw shadow
  ctx.fillStyle = "rgb(240, 240, 240)";
  if (mouse.dir == 1) {
    drawEllipse(ctx, mouse.x + 28, height-28, mouse.width - 28, 8);
  } else {
    drawEllipse(ctx, mouse.x, height-28, mouse.width - 28, 8);
  }
}

