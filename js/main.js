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
var JumpPad;
var REZ_MULTIPLIER = 2;
var zooming = false;
var ongoingTouches = new Array();
//
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
var zoomLevelFinal = 1, zoomLevel = 1;
var transformBounds = {min:{x:0,y:0},prev:{x:0,y:0}};
var transformScale = {x:1,y:1};
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
	canvas.addEventListener("touchstart", function(e) {e.preventDefault();}, false);
	canvas.addEventListener("touchend", handleTouchEnd, false);
	canvas.addEventListener("touchcancel", handleTouchEnd, false);
	canvas.addEventListener("touchmove", handleMove, false);
}
function handleTouchEnd(event) {
	event.preventDefault();
	zooming = false;
	ongoingTouches.length = 0;
	zoomLevelFinal = zoomLevel;
	handleMoveStarted = false;
	transformBounds.prev.x = transformBounds.min.x;
	transformBounds.prev.y = transformBounds.min.y;
	console.log('end');
	moving = false;
}
function handleMove(event) {
	if(moving){
		return;
	}
	handleMoveStarted = true;
	//always fired before startdrag
	console.log("handleMove",moving);
	event.preventDefault();
	var touches = event.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		if(!ongoingTouches[i]){
			ongoingTouches[i] = {start:{x:touches[i].pageX*REZ_MULTIPLIER, y:touches[i].pageY*REZ_MULTIPLIER}};
		}
		ongoingTouches[i].current = {x:touches[i].pageX*REZ_MULTIPLIER, y:touches[i].pageY*REZ_MULTIPLIER};
	}
	
	setTimeout(function(){
		console.log("handleMove timeout, moving:",moving,'zooming:',zooming);
		if(!moving && handleMoveStarted){
			zooming = true;
		}
	},100);
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
	JumpPad = Bodies.rectangle(400, 350, 150, 40, {
		angle: Math.PI * 0.05,
		isStatic: true,
		collisionFilter: {
			mask: defaultCategory | redCategory,
			category: blueCategory
		}
	});
	JumpPad.label = 'pad';
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
	World.add(engine.world, [partA, partB, partC, JumpPad, ground]);
}

function bindEvents() {
	function setDragPosition(e){
		posX = e.mouse.position.x;
		posY = e.mouse.position.y;
	}
	Events.on(mouseConstraint, "mousedown", setDragPosition);
	Events.on(mouseConstraint, "mousemove", setDragPosition);

	Events.on(mouseConstraint, "startdrag", function(e) {
		console.log("startdrag",moving,zooming);
		if(zooming){
			return;
		}
		dir *= -1;
		angInit = Math.atan((JumpPad.position.y - e.mouse.position.y) / (JumpPad.position.x - e.mouse.position.x));
		currentAngle = JumpPad.angle;
		moving = true;
		offset.y = JumpPad.position.y - e.mouse.position.y;
		offset.x = JumpPad.position.x - e.mouse.position.x;
	});

	Events.on(mouseConstraint, "enddrag", function(e) {
		moving = false;
	});
	Events.on(engine, 'collisionStart', function(e) {
		var i, pair,
		length = e.pairs.length;
		for (i = 0; i < length; i++) {
			pair = e.pairs[i];
			if (pair.bodyB.label === 'drop'){
				pair.bodyB.collision = true;
			}
			if (pair.bodyB.label === 'drop' && pair.bodyA.label === 'pad') {
				pair.bodyB.acceleration = 0.002;
			} else if (pair.bodyB.label == 'drop' && pair.bodyA.label == 'cup') {
				reposition(pair.bodyB);
				count++;
			}
		}
	});
	Events.on(engine, 'collisionEnd', function(e) {
		var i, pair,
		length = e.pairs.length;
		for (i = 0; i < length; i++) {
			pair = e.pairs[i];
			if (pair.bodyB.label === 'drop'){
				pair.bodyB.collision = false;
			}
		}
	});

	Events.on(engine, 'beforeTick', function(event) {
		/*
		engine.world.bounds.min.x = -300;
		engine.world.bounds.min.y = -300;
		engine.world.bounds.max.x = 2000;
		engine.world.bounds.max.y = 2000;
		*/
		if(ongoingTouches && ongoingTouches.length>=2){
			var a = ongoingTouches[0];
			var b = ongoingTouches[1];
			var distStart = Math.sqrt(Math.pow(a.current.x-b.current.x,2)+Math.pow(a.current.y-b.current.y,2));
			var distCurrent = Math.sqrt(Math.pow(a.start.x-b.start.x,2)+Math.pow(a.start.y-b.start.y,2));
			var scale = (distStart / distCurrent);
			if(Math.abs(scale*zoomLevelFinal - zoomLevel) > 0.01){
				zoomLevel = scale*zoomLevelFinal;
				transformScale.x=transformScale.y=1/zoomLevel;
				Mouse.setScale(mouseConstraint.mouse, transformScale);
			}
		}else if(ongoingTouches && ongoingTouches.length == 1){
			var a = ongoingTouches[0];
			transformBounds.min.x = transformBounds.prev.x+(a.start.x-a.current.x)*transformScale.x;
			transformBounds.min.y = transformBounds.prev.y+(a.start.y-a.current.y)*transformScale.y;
			Mouse.setOffset(mouseConstraint.mouse, transformBounds.min);
		}
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
			if (dir > 0) {
				var ang = Math.atan((JumpPad.position.y - posY) / (JumpPad.position.x - posX));
				Body.setAngle(JumpPad, ang - angInit + currentAngle - Math.PI);
			} else {
				Body.setPosition(JumpPad, {
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

function render() {
	var bodies = Composite.allBodies(engine.world);
	window.requestAnimationFrame(render);
	context.fillStyle = '#11001d';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#fff';
	context.font = "24px Arial";
	context.fillText("Hits: " + count, 10, 50);
	context.save(); 
	context.translate(-transformBounds.min.x/transformScale.x, -transformBounds.min.y/transformScale.y);
	context.scale(1/transformScale.x, 1/transformScale.y);
	context.beginPath();
	for (var i = 0; i < bodies.length; i += 1) {
		if(bodies[i].label=='pad'){
			Utils.rotateAndPaintImage (context,Resources.img,bodies[i].angle,bodies[i].position.x, bodies[i].position.y,75,20,150,40);
			continue;
		}
		if(bodies[i].label == 'drop'){
			var drp = Resources.drp0;
			var ang = 0;
			var vel = 0;
			vel = Math.sqrt(bodies[i].velocity.x*bodies[i].velocity.x+bodies[i].velocity.y*bodies[i].velocity.y);
			if(vel > 5){
				ang = Math.atan2((bodies[i].position.y - bodies[i].positionPrev.y), (bodies[i].position.x - bodies[i].positionPrev.x));
				drp = Resources.drp1;
				if(bodies[i].collision){
					drp = Resources.drp2;
					ang = Math.PI+ang;
				}
			}
			Utils.rotateAndPaintImage(context,drp,-Math.PI/2+ang,bodies[i].position.x, bodies[i].position.y,20,20,40,40);
			continue;
		}
		var vertices = bodies[i].vertices;
		context.moveTo(vertices[0].x, vertices[0].y);
		for (var j = 1; j < vertices.length; j += 1) {
			context.lineTo(vertices[j].x, vertices[j].y);
		}
		context.lineTo(vertices[0].x, vertices[0].y);
	}
	//
	context.lineWidth = 1;
	context.strokeStyle = '#fff';
	context.stroke();
	context.restore();
	/* circle */
	Utils.rotateAndPaintImage(context, Resources.circle, JumpPad.angle, (JumpPad.position.x-transformBounds.min.x)/transformScale.x, (JumpPad.position.y-transformBounds.min.y)/transformScale.y, 300, 300, 600, 600);
	//
	for (var i = 0; i < ongoingTouches.length; i++) {
		context.fillStyle = '#00ff00';
		context.fillRect(ongoingTouches[i].current.x, ongoingTouches[i].current.y, 10, 10);
	}
	// --- draw fps -- //
	Fps.draw(context,canvas.width - 100, 50);
};
