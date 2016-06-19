var Resources =(function(){
	var images = {};
	images.pad = new Image();
	images.drp0 = new Image();
	images.drp1 = new Image();
	images.drp2 = new Image();
	images.circle = new Image();



	for(var i in images){
		images[i].addEventListener("load", function(e) {
			e.target.loaded = true;
		}, false);
	}

	images.pad.src = "./images/pad.png";

	images.drp0.src =  "./images/drp0.png";

	images.drp1.src =  "./images/drp1.png";
	
	images.drp2.src = "./images/drp2.png";

	images.circle.src = "./images/circle.png";
	return images;
}());