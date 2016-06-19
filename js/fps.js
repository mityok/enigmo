var Fps = (function(){
	var lastLoop = new Date;
	var count = 0;
	var oldVal = 0;
	var tmp = 0;
	function draw(ctx, x,y){
		var thisLoop = new Date;
		var fps_val = 1000 / (thisLoop - lastLoop);
		lastLoop = thisLoop;
		count++;
		if(count < 10){
			oldVal+=fps_val;
			
		}else{
			tmp = ~~(oldVal/count);
			oldVal = 0;
			count = 0;
		}
		ctx.fillStyle = '#fff';
		ctx.font = "24px Arial";
		ctx.fillText("fps: " + tmp, x,y);
	}
	return {
		draw: draw
	};
}());