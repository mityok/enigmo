var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Composite = Matter.Composite,
	Events = Matter.Events,
	MouseConstraint = Matter.MouseConstraint,
	Bounds = Matter.Bounds,
	Mouse = Matter.Mouse;
//
var defaultCategory = 0x0001,
	redCategory = 0x0002,
	blueCategory = 0x0003,
	purpleCategory = 0x0004;
//

var bodies = [];

var count = 0;
var canvas;
var context;
var engine;
var mouseConstraint;
//
var boxC;
var REZ_MULTIPLIER = 2;
//
function init() {
	console.log('init');
	canvas = document.getElementById('cvs');
	context = canvas.getContext('2d');
	canvas.width = 1532/2;
	canvas.height = 2560/2;
	engine = Engine.create();
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: Matter.Mouse.create(canvas)
	});
	mouseConstraint.collisionFilter = {
		category: redCategory | blueCategory,
		mask: defaultCategory
	};
	World.add(engine.world, mouseConstraint);
	generateDrops();
	generateItems();
	bindEvents();
	Engine.run(engine);
	render();
	canvas.addEventListener("touchstart", handleStart, false);
	canvas.addEventListener("touchend", handleEnd, false);
	canvas.addEventListener("touchcancel", handleCancel, false);
	canvas.addEventListener("touchmove", handleMove, false);
}
var ongoingTouches = new Array();
function handleCancel(event) {
	event.preventDefault();
	ongoingTouches.length = 0;
	console.log('cancel');
	//coords.innerHTML = 'x: ' + event.touches[0].pageX + ', y: ' + event.touches[0].pageY;
}
function handleEnd(event) {
	event.preventDefault();
	ongoingTouches.length = 0;
	console.log('end');
	//coords.innerHTML = 'x: ' + event.touches[0].pageX + ', y: ' + event.touches[0].pageY;
}
function handleMove(event) {
	event.preventDefault();
	var touches = event.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		if(!ongoingTouches[i]){
			ongoingTouches[i] = {start:{x:touches[i].pageX*REZ_MULTIPLIER, y:touches[i].pageY*REZ_MULTIPLIER}};
		}
		ongoingTouches[i].current = {x:touches[i].pageX*REZ_MULTIPLIER, y:touches[i].pageY*REZ_MULTIPLIER};
	}
	//coords.innerHTML = 'x: ' + event.touches[0].pageX + ', y: ' + event.touches[0].pageY;
}
function handleStart(event) {
	event.preventDefault();
	var touches = event.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		console.log(i);
	}
}
function generateDrops() {
	for (var i = 0; i < 100; i++) {
		setTimeout(function() {
			var circ = Bodies.circle(400, 200, 5, {
				restitution: 0.9,
				collisionFilter: {
					mask: defaultCategory | purpleCategory,
					category: redCategory
				}
			});
			circ.life = 0;
			circ.label = 'drop';
			bodies.push(circ);
			World.add(engine.world, circ);
		}, i * 100);
	}
}

function generateItems() {
	boxC = Bodies.rectangle(400, 350, 150, 40, {
		angle: Math.PI * 0.05,
		isStatic: true,
		collisionFilter: {
			mask: defaultCategory | redCategory,
			category: blueCategory
		}
	});
	boxC.label = 'pad';
	var partA = Bodies.rectangle(200 - 25, 400 + 50, 50, 10, {
		angle: Math.PI * 0.6, //90deg
		isStatic: true,
		collisionFilter: {
			category: purpleCategory
		}
	});
	var partB = Bodies.rectangle(200, 400 + 50 + 25, 50, 10, {
		angle: Math.PI * 0,
		isStatic: true,
		collisionFilter: {
			category: purpleCategory
		}
	});
	partB.label = 'cup';
	var partC = Bodies.rectangle(200 + 25, 400 + 50, 50, 10, {
		angle: Math.PI * 0.4, //90deg
		isStatic: true,
		collisionFilter: {
			category: purpleCategory
		}
	});
	var ground = Bodies.rectangle(400, 610, 810, 60, {
		isStatic: true
	});
	World.add(engine.world, [partA, partB, partC, boxC, ground]);
}

// run the renderer
var posX = 0;
var posY = 0;
var moving = false;
var currentX = 0;
var currentY = 0;
var angInit = 0;
var currentAngle = 0;
var dir = 1;
var offset = {
	x: 0,
	y: 0
};

function bindEvents() {
	Events.on(mouseConstraint, "mousemove", function(e) {
		posX = e.mouse.position.x;
		posY = e.mouse.position.y;
	});

	Events.on(mouseConstraint, "startdrag", function(e) {
		dir *= -1;
		angInit = Math.atan((boxC.position.y - e.mouse.position.y) / (boxC.position.x - e.mouse.position.x));
		currentAngle = boxC.angle;
		moving = true;
		offset.y = boxC.position.y - e.mouse.position.y;
		offset.x = boxC.position.x - e.mouse.position.x;
	});

	Events.on(mouseConstraint, "enddrag", function(e) {
		moving = false;
	});
	Events.on(engine, 'collisionStart', function(e) {
		var i, pair,
			length = e.pairs.length;
		for (i = 0; i < length; i++) {
			pair = e.pairs[i];
			if (pair.bodyB.label === 'drop' && pair.bodyA.label === 'pad') {
				pair.bodyB.acceleration = 0.002;
			} else if (pair.bodyB.label == 'drop' && pair.bodyA.label == 'cup') {
				reposition(pair.bodyB);
				count++;
			}
		}
	});

	Events.on(engine, 'beforeTick', function(event) {
		engine.world.bounds.min.x = -300;
		engine.world.bounds.min.y = -300;
		engine.world.bounds.max.x = 2000;
		engine.world.bounds.max.y = 2000;
		//Mouse.setOffset(mouseConstraint.mouse, {x:100,y:100});
		var bounds = {
			min: {
				x: -100,
				y: -100
			},
			max: {
				x: 400,
				y: 400
			}
		};
		var translate = {
			x: -100,
			y: -100
		};
		//Bounds.translate(bounds, translate);
		var boundsScale = {
			x: 5,
			y: 5
		};
		var bounds = {
			min: {
				x: -500,
				y: -500
			},
			max: {
				x: 400,
				y: 400
			}
		};
		Mouse.setScale(mouseConstraint.mouse, boundsScale);
		Mouse.setOffset(mouseConstraint.mouse, bounds.min);


	});
	Events.on(engine, 'afterUpdate', function(event) {
		for (var i = 0; i < bodies.length; i++) {
			if (bodies[i].acceleration) {
				var ang = Math.atan2((bodies[i].position.y - bodies[i].positionPrev.y), (bodies[i].position.x - bodies[i].positionPrev.x));
				Body.applyForce(bodies[i], bodies[i].position, {
					x: Math.cos(ang) * bodies[i].acceleration,
					y: Math.sin(ang) * bodies[i].acceleration
				});
				bodies[i].acceleration = null;
			}
		}
	});
	Events.on(engine, 'beforeUpdate', function(event) {
		if (moving) {
			var ang = Math.atan((boxC.position.y - posY) / (boxC.position.x - posX));
			//console.log(conv(ang),conv(Math.PI*2-ang),conv(angInit),conv(currentAngle));
			//Body.setAngle(boxC, currentAngle);
			if (dir > 0) {
				Body.setAngle(boxC, ang - angInit + currentAngle - Math.PI);
			} else {
				Body.setPosition(boxC, {
					x: posX + offset.x,
					y: posY + offset.y
				});
			}
		}
		for (var i = 0; i < bodies.length; i++) {
			if (bodies[i].position.x < -500 || bodies[i].position.y > 5000 || bodies[i].position.x > 5000) {
				reposition(bodies[i]);
				//continue;
			}
			if (bodies[0].speed < 0.3 && bodies[0].angularSpeed < 0.1) {
				bodies[i].life++;
				//continue;
			}
			if (bodies[i].life > 100) {
				reposition(bodies[i]);
				//continue;
			}

		}
	});
}

function reposition(body) {
	Body.setPosition(body, {
		x: 400,
		y: 50
	});
	Body.setVelocity(body, {
		x: 0,
		y: 0
	});
	Body.setAngularVelocity(body, 0.0);
	body.life = 0;
}

function conv(rad) {
	return rad * (180 / Math.PI);
}
//
var lastLoop = new Date;
function render() {
	var bodies = Composite.allBodies(engine.world);
	window.requestAnimationFrame(render);
	context.fillStyle = '#f00';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#fff';
	context.fillRect(10, 10, canvas.width-20, canvas.height-20);
	context.fillStyle = '#ccc';
	context.font = "12px Arial";
	context.fillText("Hits: " + count, 10, 50);
	context.translate(100, 100);
	context.scale(0.2, 0.2);
	context.beginPath();
	for (var i = 0; i < bodies.length; i += 1) {
		var vertices = bodies[i].vertices;
		context.moveTo(vertices[0].x, vertices[0].y);
		for (var j = 1; j < vertices.length; j += 1) {
			context.lineTo(vertices[j].x, vertices[j].y);
		}
		context.lineTo(vertices[0].x, vertices[0].y);
	}
	context.lineWidth = 1;
	context.strokeStyle = '#ff0000';
	context.stroke();
	context.scale(5, 5);
	context.translate(-100, -100);
	//
	for (var i = 0; i < ongoingTouches.length; i++) {
		context.fillStyle = '#00ff00';
		context.fillRect(ongoingTouches[i].current.x, ongoingTouches[i].current.y, 10, 10);
	}
	//
	var thisLoop = new Date;
    var fps = Math.floor(1000 / (thisLoop - lastLoop));
    lastLoop = thisLoop;
	context.font = "12px Arial";
	context.fillText("fps: " + fps, 100, 50);
	
};