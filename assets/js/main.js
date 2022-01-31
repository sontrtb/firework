
const modalDisplay = document.getElementById('modal-container');
const canvas = document.createElement('canvas');
    canvas.id = "myCanvas";
    canvas.style.cursor = "crosshair";
const main = document.getElementById('main');

let checkSound;
//Modal
function SoundOn(){
    checkSound = false;
    main.appendChild(canvas);
    modalDisplay.style.display = "none";
    handleCanvas();
}
function SoundOff(){
    checkSound = true;
    main.appendChild(canvas);
    modalDisplay.style.display = "none";
    handleCanvas();
}


// Pháo hoa
function handleCanvas(){

    // get canvas
    const myCanvas = document.getElementById("myCanvas");
        myCanvas.width = window.innerWidth-10;
        myCanvas.height = window.innerHeight-10;
    const ctx = myCanvas.getContext("2d");

    // Khai báo
    const g = 0.04;
    const color = [ "#ff0043",
                    "#14fc56",
                    "#1e7fff",
                    "#e60aff",
                    "#ffbf36",
                    "#ffffff",
                    "#9c9a9a",
                    "#e96e2d"
                ];

    // nhạc nền
    const soundtrack = new Audio("./assets/audio/HappyNewYear.mp3");
    soundtrack.play();
    soundtrack.loop = true;
    soundtrack.muted = checkSound;

    // random số từ min đến max
    function random(min, max){
        const value =  Math.floor(Math.random() * (max - min + 1)) + min;
        return value;
    }
    // Tính v0 cột từ tọa độ y
    function calcVColBall(y){
        let y0 = main.offsetHeight;     // y = y0 + v0*t + 1/2*g*t^2
        let v1ColBall = 0;                 
        let t = 0;                         
        while(y0 - y > 0){
            y0 -= v1ColBall;
            v1ColBall += g;
            t++;
        }
        y0 = main.offsetHeight;
        const v0 = (y0-y)/t + 1/2*g*t;  //đảo lại cho gốc y0 = 0;

        return v0 * 10 + 2;   // +2 vì có -2 ở dòng 225
    }

    // tạo ra  đối tượng bóng
    function Ball(x, y, v0, alpha,color, size) {
        this.x = x;
        this.y = y;
        this.v0 = v0/10;
        this.color = color;
        this.size = size;
        this.alpha = alpha;
        this.v1 = 0;
    }
    // vẽ hình bóng tròn
    Ball.prototype.draw = function() { 
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    };
    // di chuyển bóng
    Ball.prototype.move = function() {
        let vX = this.v0 * Math.cos(this.alpha * Math.PI/180)
        let vY = (this.v0 * Math.sin(this.alpha * Math.PI/180) - this.v1);
        this.x -= vX;
        this.y -= vY;
        this.v1 += g;
    };

    // tạo ra một Hoa pháo hoa
    function Flower(x, y, color, ballSize, ballNumber, v0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.ballSize = ballSize;
        this.ballNumber = ballNumber;
        this.v0 = v0;
        this.balls = [];
    }
    // tạo mảng các bóng tạo hoa
    Flower.prototype.drawBallFlower = function() {
        while(this.balls.length < this.ballNumber){
            let ball = new Ball(
                this.x,
                this.y,
                random(1, this.v0),
                random(0, 360),
                this.color[random(0, this.color.length-1)],
                this.ballSize
            );
            this.balls.push(ball);
        }
    }
    //di chuyển các bóng tạo hoa
    Flower.prototype.moveBallFlower = function() {
        for(let i=0; i<this.balls.length; i++){
            this.balls[i].draw(); //
            this.balls[i].move();
        }
    }


    // cột pháo hoa
    function Col(x, v0, color, ballSize){
        this.colBall = new Ball(x, myCanvas.height, v0, 90, color, ballSize);
        
    }
    // di chuyển bóng cột pháo hoa
    Col.prototype.moveCol = function() {
        this.colBall.draw();
        this.colBall.move();
    }


    // Tạo pháo hoa đầy đủ
    function Firework(x, vColBall, color, ballColSize, ballFlowerSize,ballNumber, v0) {
        this.x = x;
        this.color = color;
        this.ballFlowerSize = ballFlowerSize;
        this.ballNumber = ballNumber;
        this.v0 = v0;
        this.timeFlower = 0;
        this.colFirework = new Col(x, vColBall, color[0], ballColSize);
        this.soundFlower = true;
        this.soundCol = true;
    }
    // vẽ cột pháo hoa
    Firework.prototype.drawColFirework = function() {
        this.colFirework.moveCol();
        this.flowerFirework = new Flower(
            this.x,
            this.colFirework.colBall.y,
            this.color,
            this.ballFlowerSize,
            this.ballNumber,
            this.v0
        );
    }
    // vẽ hoa pháo hoa 
    Firework.prototype.drawFlowerFirework = function() {
        this.flowerFirework.drawBallFlower();
        this.flowerFirework.moveBallFlower();
    }


    let fireworks = []; // mảng các pháo hoa
    // tọa độ pháo bằng chuột
    let cursorX;
    let cursorY;
    canvas.onclick = (e) => {
        cursorX = e.pageX;
        cursorY = e.pageY;
        
        handleFirework(  ); 
    };
    //thêm pháo hoa tạo từ tọa độ vào mảng
    const colors = [
        [                                   // 3 màu
            color[random(0, color.length)],
            color[random(0, color.length)],
            color[random(0, color.length)],
        ],
        [                                   // 2 màu
            color[random(0, color.length)],
            color[random(0, color.length)],
        ],
        [                                   // 1 màu
            color[random(0, color.length)],
        ],
        [                                   // 1 màu
            color[random(0, color.length)],
        ],
        [                                   // 1 màu
            color[random(0, color.length)],
        ]
    ]
    function handleFirework() {
        const firework = new Firework(
            cursorX,                            // x
            calcVColBall(cursorY),              // vColBall
            colors[random(0, colors.length-1)], // color
            random(4, 5),                       // ballColSize
            random(10, 15)/10,                   // ballFlowerSize
            random(6, 8)*100,                   // ballNumber
            random(35, 45)                      // v0
        )
        fireworks.push(firework);
    }
    //
    function loop() {
        const v0ColBall = calcVColBall(random(10, myCanvas.height*0.65));
        const firework = new Firework(
            random(0, myCanvas.width),          // x
            v0ColBall,                          // vColBall
            [                                   // color
                color[random(0, color.length)],
                color[random(0, color.length)],
                color[random(0, color.length)]
            ],  
            random(2, 4),                       // ballColSize
            random(7, 15)/10,                   // ballFlowerSize
            random(3, 6)*100,                   // ballNumber
            random(25, 40)                      // v0
        )
        if(random(0, 60) < 1){
            fireworks.push(firework);
        }
        for(let i=0; i<fireworks.length; i++){
            if(fireworks[i].colFirework.colBall.v1 < fireworks[i].colFirework.colBall.v0-2){
                fireworks[i].drawColFirework();
                // âm thanh
                if(fireworks[i].soundCol){
                    // const soundFlower = new Audio('./assets/audio/firework1.mp3');
                    // soundFlower.play();
                    // fireworks[i].soundCol = false;
                }
            }
            else{
                if(fireworks[i].timeFlower < random(9, 14)*100){
                    fireworks[i].drawFlowerFirework();
                    fireworks[i].timeFlower += 20;
                    // âm thanh
                    if(fireworks[i].soundFlower){
                        const soundFlower = new Audio('./assets/audio/firework2.mp3');
                        soundFlower.play();
                        soundFlower.muted = checkSound;
                        fireworks[i].soundFlower = false;
                    }
                }
                else{
                    fireworks.splice(i, 1);
                }
            }
        }
    }

    setInterval(function(){
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
        loop();
    } , 20);

}