
function goFull(){
	launchIntoFullscreen(document.getElementById("cvs"));
}
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
  setTimeout(function(){
	  alert(window.devicePixelRatio+ ' : '+ screen.width+ ' : '+screen.height+ ' : '+screen.availWidth+ ' : '+screen.availHeight+ ' : '+window.innerWidth+ ' : '+window.innerHeight+ ' : '+document.documentElement.clientWidth+ ' : '+document.documentElement.clientHeight);
  },100)
}

