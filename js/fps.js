var Fps = (function(){
	var lastLoop = new Date;
	var count = 0;
	var oldVal = 0;
	function draw(ctx, x,y){
		var thisLoop = new Date;
		var fps_val = Math.floor(1000 / (thisLoop - lastLoop));
		lastLoop = thisLoop;
		count++;
		if(count < 10){
			fps_val = oldVal;
		}else{
			oldVal = fps_val;
			count = 0;
		}
		ctx.fillStyle = '#fff';
		ctx.font = "24px Arial";
		ctx.fillText("fps: " + oldVal, x,y);
	}
	return {
		draw: draw
	};
}());