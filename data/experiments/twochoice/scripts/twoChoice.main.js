/* main.js file
 * Created By: Colin Knapp
 * 
 * This is an 'impulsivity' test for use in research by psychology teams
 * Programmed in JS/jQuery/HTML5 Canvas
 * 
 * Purpose: On load of the page, ask for # of rounds and then randomly put a square or a circle in the left or right window
 * The shape must be unique, as in no duplicate shapes
 * When the circle is "selected" after 5 seconds it will begin to flash, upon clicking again you add it's score of 5 to the scoreboard
 * When the square is "selected" after 15 seconds it will begin to flash, upon clicking again you add it's score of 15 to the scoreboard
 * 
 * After 500 milliseconds after clicking the second time, the boxes will re-randomize and reset.
 * At the end of the test statistics will be shown as well.
 */
var tcipcanvasLeft 		= null;
var tcipcanvasRight 	= null;
var tcipchoices			= null;
var tcipchoicecount		= 0;
var tcipcirclePts		= 5;
var tcipcircleDelay		= 5000;
var tcipcontextLeft 	= null;
var tcipcontextRight	= null;
var tcipcurround		= 0;
var tcipleft			= "";
var tciplockedin		= false;
var tciprounds			= 0;
var tcipscore			= 0;
var tcipselected		= "";
var tcipselectcount		= 0;
var tcipsquarePts		= 15;
var tcipsquareDelay		= 15000;
var tciptotaltime		= 0;
var tcipvanishTime		= 500;
var tcipfromReactive	= (document.referrer.toLowerCase().indexOf("reactiveresearch") >= 0); 

function beginTCIPExperiment(){
	tcipchoices = Array();
	
	$("head link").each(function(){
		var href = $(this).attr("href");
		if(href != "undefined"){
			if(href.indexOf("twochoice") > 0){
				$(this).remove();
			}
		}
	});
	
	$("<link/>", {
	   rel: "stylesheet",
	   type: "text/css",
	   href: "//reactiveresearch.xperimentalcode.com/data/experiments/twochoice/css/twochoicemain.css"
	}).appendTo("head");
	
	tciprounds = tcipParams['rounds'];
	updateTCIPRounds();	
 	initTCIPCanvas();
 	drawTCIPShapes();

 	$(".tcipcontrol").hover(function(){
 		$(this).css({"background-color": "#3366FF", "color": "#FFFFFF"});
 	}, function(){
 		$(this).css({"background-color": "#FFFFFF", "color": "#000000"});
 	});
 	
 	$(".tcipcontrol").click(function(){
 		var selectid = $(this).attr("id");
 		
 		if(tcipselectcount == 0){
	 		tcipFirstAction(selectid);
	 		tcipselectcount++;
	 	} else {
	 		if(tciplockedin){
	 			return;
	 		} else {
	 			// Then it's clear to add points!
	 			tcipselectcount++;
	 			if(tcipselected == "left"){
	 				$("#tcipcanvasLeft").stop();
	 				$("#tcipcanvasLeft").css("opacity", "1");
	 			} else {
	 				$("#tcipcanvasRight").stop();
	 				$("#tcipcanvasRight").css("opacity", "1"); 
	 			}
	 			
	 			tcipCalculatePoints();
	 		}
	 	}
 	});
}

function tcipCalculatePoints(){
	if(!tciplockedin && tcipselectcount > 1){
		if(tcipselected == "left"){
			if(tcipleft == "square"){
				tcipscore += tcipsquarePts;
			} else {
				tcipscore += tcipcirclePts;
			}
		} else {
			if(tcipleft == "square"){
				tcipscore += tcipcirclePts;
			} else {
				tcipscore += tcipsquarePts;
			}
		}
	}
	$("#tcipscoreDisplay").html("");
	$("#tcipscoreDisplay").html("<h1>" + tcipscore.toString() + "</h1>");
	
	resetTCIPPage();
}

function drawTCIPShapes(){
	if(tcipleft == "square"){
		tcipcontextLeft.beginPath();
	 	tcipcontextLeft.fillStyle = '#000';
	 	tcipcontextLeft.fillRect(40, 40,200,200);
	 	
	 	tcipcontextRight.fillStyle = '#000';
	 	tcipcontextRight.beginPath();
	 	tcipcontextRight.arc(140, 150, 100, 0, 360);
	 	tcipcontextRight.fill();
	} else {
		tcipcontextRight.beginPath();
	 	tcipcontextRight.fillStyle = '#000';
	 	tcipcontextRight.fillRect(40, 40,200,200); 
	
	 	tcipcontextLeft.fillStyle = '#000';
	 	tcipcontextLeft.beginPath();
	 	tcipcontextLeft.arc(140, 150, 100, 0, 360);
	 	tcipcontextLeft.fill();
	}
}

function tcipFirstAction(selectid){
	tciplockedin = true;
	
	if(typeof(selectid) != "undefined"){
 		if(tcipleft != ""){
			if(selectid == "tcipleftControl"){
				tcipselected = "left";
				$("#tcipcanvasRight").hide();
				$("#tciprightControl").attr("disabled", "disabled");
				tcipcontextLeft.fillStyle = '#cccccc';
				tcipchoices[tcipchoicecount] = tcipleft;
				
				if(tcipleft == "square"){
					tciptotaltime += 15;
					tcipcontextLeft.fillRect(40, 40,200,200);
				} else {
					tciptotaltime += 5;
				}
				
				tcipcontextLeft.fill();
				triggerTCIPAnimation();
			} else if(selectid == "tciprightControl"){
				tcipselected = "right";
				$("#tcipcanvasLeft").hide();
				$("#tcipleftControl").attr("disabled", "disabled");
				tcipcontextRight.fillStyle = '#cccccc';
				
				if(tcipleft == "circle"){
					tciptotaltime += 15;
					tcipchoices[tcipchoicecount] = "square";
					tcipcontextLeft.fillRect(40, 40,200,200);
				} else {
					tciptotaltime += 5;
					tcipchoices[tcipchoicecount] = "circle";
				}
				
				tcipcontextRight.fill();
				triggerTCIPAnimation();
			}
			
			tcipchoicecount++;
 		} else {
 			return;
 		}
	} else {
		return;
	}
}

function formatSecondsAsTime(sec){
	minVar = Math.floor(sec/60);  // The minutes
	secVar = sec % 60;              // The balance of seconds
	
	return minVar.toString() + "m " + secVar.toString() + "s";
}


function initTCIPCanvas(){
	var rand = Math.floor(Math.random() * 100);
	if(rand >= 49){	
		tcipleft = "square";	
	} else {
		tcipleft = "circle";
	}
	
	tcipcanvasLeft 		= document.getElementById("tcipcanvasLeft");
	tcipcontextLeft 	= tcipcanvasLeft.getContext('2d');
	
	tcipcanvasRight 	= document.getElementById("tcipcanvasRight");
	tcipcontextRight	= tcipcanvasRight.getContext('2d');
	
	tcipcanvasLeft.width  = tcipcanvasLeft.width;
	tcipcanvasRight.width = tcipcanvasRight.width;
}

function resetTCIPPage(){
	tcipselectcount = 0;
	tcipselected	= "";
	tcipleft		= "";
	tciplockedin	= false;
	
	setTimeout(function(){
		$("#tcipcanvasLeft").show();
		$("#tcipcanvasRight").show();
		
		$(".tcipcontrol").each(function(){
			if($(this).attr("disabled") != "undefined"){
				$(this).removeAttr("disabled");
			}
		});
		
		updateTCIPRounds();
		initTCIPCanvas();
		drawTCIPShapes();
	}, 500);
}

function triggerTCIPAnimation(){	
	if(tcipselected == "left"){
		if(tcipleft == "square"){
			setTimeout(function(){
				tciplockedin = false;
				triggerTCIPFlasher();
			}, tcipsquareDelay);
		} else {
			setTimeout(function(){
				tciplockedin = false;
				triggerTCIPFlasher();
			}, tcipcircleDelay);
		}
	} else {
		if(tcipleft == "circle"){
			setTimeout(function(){
				tciplockedin = false;
				triggerTCIPFlasher();
			}, tcipsquareDelay);
		} else {
			setTimeout(function(){
				tciplockedin = false;
				triggerTCIPFlasher();
			}, tcipcircleDelay);
		}
	}
}

function triggerTCIPFlasher(){
	if(tcipselected == "left"){
		$("#tcipcanvasLeft").animate({ opacity: "toggle" }, 1000, function() { triggerTCIPFlasher(); });
	} else {
		$("#tcipcanvasRight").animate({ opacity: "toggle" }, 1000, function() { triggerTCIPFlasher(); });
	}
}

function updateTCIPRounds(){
	tcipcurround++;
	if(tcipcurround <= tciprounds){
		$("#tciproundDisplay").html("");
		$("#tciproundDisplay").html("<h1>" + tcipcurround.toString() + "</h1>");
	} else {
		savingData = true;
		var params = { };
		
		params['scoreobj'] = { };
		params['scoreobj']['time']	   	 = tciptotaltime;
		params['scoreobj']['scoretotal'] = $("#tciptotalScore").val();
		params['duration'] 				 = tciptotaltime;
		params['user']					 = currentUser;
		params['testtype']				 = "tcip";
		
		fetchData("experimentLoader", true, "sendTestData", params);
	}	
}