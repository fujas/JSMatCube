let MC = {};
MC.canvas = document.getElementById("myCanvas");
MC.ctx    = MC.canvas.getContext("2d");
MC.click1Sound = document.getElementById("click1Sound");
MC.click2Sound = document.getElementById("click2Sound");
MC.timerLabel = document.getElementById('timerLabel');

MC.game   = CubeGame.GetInstance();

init();
updateFrame();

function init() {
	MC.game.setCubeSize(3);
	MC.game.setCubeStage(4);
	MC.game.shuffleCube();
	MC.game.enableSound(true);
}

// main loop
function updateFrame() {
    requestAnimationFrame(updateFrame);

	if (MC.doMatch) {
		MC.doMatch = false;
		this.doMatch(); //  1フレーム遅れて、描画が更新された後に呼んでいる.
		return;
	}

	let time = Date.now();
	let deltatime = 0;
	if (MC.time) {
		deltatime = time - MC.time;
	}
	MC.time = time;

	// console.log("deltatime = " + deltatime); //16
	let state = MC.game.update(deltatime);

	if (state.redraw) {
		MC.game.draw(MC.ctx, MC.canvas.width, MC.canvas.height);
	}
	if (state.sound == 0) {	
		MC.click1Sound.pause();
		MC.click1Sound.currentTime = 0;
		MC.click1Sound.play();
	} else if (state.sound == 1) {
		MC.click2Sound.pause();
		MC.click2Sound.currentTime = 0;
		MC.click2Sound.play();
	}

	if (state.shuffle) {
		this.startTimeCount(true);
	} else if (state.reset) {
		this.startTimeCount(false);
	}

	if (state.match) {
		MC.doMatch = true;
	}

	updateTimeCount();
}

function updateTimeCount() {
	if (!MC.startTime) {
		return;
	}
	let elapsedTime = Date.now() - MC.startTime;

    let m  = Math.floor(elapsedTime / 60000);
    let s  = Math.floor(elapsedTime % 60000 / 1000);
    let ms = elapsedTime % 1000;
    m =  ('0' + m).slice(-2); 
    s =  ('0' + s).slice(-2);
    ms = ('0' + ms).slice(-3);
    MC.timerLabel.innerText = " Time : " + m + ':' + s + ':' + ms;	
}

function startTimeCount(bEnable) {
	if (bEnable) {
		MC.startTime = Date.now();
		MC.timerLabel.innerText = "00:00:000";
	} else {
		MC.startTime = null;
		MC.timerLabel.innerText = "";
	}
}

function doMatch() {
	let timestr = MC.timerLabel.innerText;
	startTimeCount(false);
	window.alert("キューブが揃いました。\n" + timestr);
	MC.timerLabel.innerText = timestr;
}

// click
MC.canvas.addEventListener('mousedown', function(event) {
	let rect = MC.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
	let isNotLeft = event.button != 0;
	MC.game.click(x, y, isNotLeft);
});

// touch
MC.canvas.addEventListener('touchstart', function(event) {
	event.preventDefault();
	if (event.touches.length == 0) {
		return;
	}
	
	let rect      = MC.canvas.getBoundingClientRect();
	let t         = event.touches[event.touches.length - 1];
    let x         = t.pageX - rect.left;
    let y         = t.pageY - rect.top;
	let isNotLeft = event.touches.length != 1;
	MC.game.click(x, y, isNotLeft);
},
{passive:false}); 

// shuffle
let shuffleBtn = document.getElementById('shuffleBtn');
shuffleBtn.addEventListener('click', function() {
	if (!window.confirm("シャッフルしても良いですか?")) {
		return;
	}
	MC.game.shuffleCube();
});

// reset
let resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', function() {
	if (!window.confirm("初期化しても良いですか?")) {
		return;
	}
	MC.game.resetCube();
});

// size
let sizeSel = document.getElementById('sizeSel');
sizeSel.options[MC.game.getCubeSize()-2].selected = true;
sizeSel.addEventListener('change', function(event) {
	let index = event.currentTarget.selectedIndex;
	MC.game.setCubeSize(index+2);
});

// stage
let stageSel = document.getElementById('stageSel');
stageSel.options[MC.game.getCubeStage()].selected = true;
stageSel.addEventListener('change', function(event) {
	let index = event.currentTarget.selectedIndex;
	MC.game.setCubeStage(index);
});

// sound
let soundCheck = document.getElementById('soundCheck');
soundCheck.checked = MC.game.isSoundEnable();
soundCheck.addEventListener('change', function(event) {
	let b = event.currentTarget.checked;
	MC.game.enableSound(b);
});

