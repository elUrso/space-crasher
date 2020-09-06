// load
const pi = Math.PI
const cos = Math.cos
const sin = Math.sin
const max = Math.max
const min = Math.min

let p = true

let s = 0
let gameview = document.querySelector("#canvas")
let gamepads = []
let ctx = canvas.getContext("2d")

let ship = new Image()
ship.src = "res/ship.png"

let player = {}
player.x = 300
player.y = 300
player.t = 0
player.v = 0
player.mv = 0.5
player.dac = 0.0005
player.ac = 0.001

let rocks = []

let newRock = () => {
    let rock = {}
    let p = Math.random() * 600 * 4
    
    rock.r = Math.random() * 20 + 10
    rock.t = Math.random()
    rock.v = Math.random() * 0.05 + 0.1

    if(p < 1200) {
        rock.x = p % 600
        if(p < 600) {
            rock.y = -rock.r
            rock.t = rock.t + 2
        } else {
            rock.y = 600 + rock.r
        }
    } else {
        rock.y = p % 600
        if(p < 1800) {
            rock.x = -rock.r
            rock.t = rock.t + 3
        } else {
            rock.x = 600 + rock.r
            rock.t = rock.t + 1
        }
    }

    return rock
}

let drawImage = (ctx, img, x, y, t, ax, ay) => {
    const height = img.height
    const width = img.width
    const tt = -pi*t*0.5

    ctx.translate(x, y)
    ctx.rotate(tt)
    ctx.drawImage(img, -width*ax, -height*ay, width, height)
    ctx.rotate(-tt)
    ctx.translate(-x, -y)
}

let updateState = (dt) => {
    let pressed = 0;
    let tilt = 0

    gamepads = navigator.getGamepads()
    for(gamepad of gamepads) if(gamepad != null) {
        pressed = gamepad.buttons[7].value
        tilt =  gamepad.axes[0]
    }

    player.t = player.t -tilt*0.003*dt
    if(player.t > 4) player.t = player.t - 4
    if(player.t < 0) player.t = player.t + 4


    // deacellerating
    if(pressed == 0) {
        player.v = max(0, player.v - dt*player.dac)
    } else {
        player.v = min(player.mv, player.v + dt*player.ac*pressed)
    }

    
    const tt = -pi*player.t*0.5
    const v = player.v
    player.x = player.x + dt*v*(sin(tt))
    player.y = player.y + dt*v*(-cos(tt))

    if(player.x < -16) {player.x = 616}
    if(player.x > 616) {player.x = -16}
    if(player.y < -16) {player.y = 616}
    if(player.y > 616) {player.y = -16}
    
    for(rock of rocks) {
        const tt = -pi*rock.t*0.5
        rock.x = rock.x + dt*rock.v*sin(tt)
        rock.y = rock.y - dt*rock.v*cos(tt)

        // check collision with player
        const d = (player.x - rock.x)**2 + (player.y - rock.y) **2
        if(d < (rock.r+8)**2) {
            console.log("collision!")
            p = false
        }
    }

    // check rocks collisions
    for(var i = 0; i < rocks.length; i++) {
        for(var j = i + 1; j < rocks.length; j++) {
            const xo = rocks[i].x , xf = rocks[j].x, yo = rocks[i].y, yf = rocks[j].y
            const d = (xo- xf) ** 2 + (yo- yf) ** 2
            if((d+10) <= (rocks[i].r + rocks[j].r)**2) {
                let dx = xo - xf
                let dy = yf - yo
                let ttt = Math.atan(dy/dx) / pi * 2
                
                rocks[i].t = ttt*2 - rocks[i].t + 2

                break;
            }
        }
    }

    rocks = rocks.filter((rock) => rock.x > -rock.r && rock.x < (600 + rock.r) && rock.y > -rock.r && rock.y < (600 + rock.r))

}

let draw = () => {
    if(p) {
        updateState(8)

        s = s + 0.0008

        ctx.clearRect(0, 0, 600, 600);

        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 1

        ctx.beginPath()
        ctx.moveTo(0,0)
        ctx.lineTo(600,0)
        ctx.lineTo(600,600)
        ctx.lineTo(0,600)
        ctx.closePath()
        ctx.stroke()

        drawImage(ctx, ship, player.x, player.y, player.t, 0.5, 0.5)

        setTimeout(draw, 8)

        ctx.font = '24px serif';
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(Number.parseFloat(s).toFixed(2), 10, 30);

        for(rock of rocks) {
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, rock.r, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

let rocker = () => {
    if(p) {
        rocks.push(newRock())

        if(s < 2)
            setTimeout(rocker, 800)
        else if(s < 6)
            setTimeout(rocker, 600)
        else if(s < 8)
            setTimeout(rocker, 400)
        else
            setTimeout(rocker, 150)
    }
}

rocker()
ship.addEventListener('load', draw)