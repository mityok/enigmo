var Utils = (function(){
	function radiansToDegrees(rad) {
		return rad * (180 / Math.PI);
	}
	function rotateAndPaintImage (ctx, image, angleInRad , positionX, positionY, axisX, axisY , width, height) {
		if(!image.loaded){
			return;
		}
		ctx.save(); 
		ctx.translate( positionX, positionY );
		ctx.rotate( angleInRad );
		ctx.drawImage( image, -axisX, -axisY, width, height );
		ctx.restore();
	}
	return {
		radiansToDegrees: radiansToDegrees,
		rotateAndPaintImage: rotateAndPaintImage
	};
}());