/* Globals */
var stroopcounter 	= null;
var stroopcurcolor 	= -1;
var stroopcurresp	= -1;
var stroopcurround	= 0;
var stroopkeyset 	= new Array();
var stroopvals  	= { };
var strooprespint	= null; 
var stroopresptime	= 0;
var strooprounds	= -1;
var stroopscores	= { };
var stroopseed 		= 0;
var stroopsend		= false;
var stroopsession	= "";
var stroopsets 		= new Array();
var stroopset  		= 0;
var stroopstartmode	= true;
var strooptime   	= -1;
var strooptype 		= -1;

stroopsets[1]  = [49,50,51,97,98,99];
stroopsets[2]  = [52,53,54,100,101,102];
stroopsets[3]  = [55,56,57,103,104,105];

stroopkeyset[1] = ["1", "2", "3"];
stroopkeyset[2] = ["4", "5", "6"];
stroopkeyset[3] = ["7", "8", "9"];

function beginStroopExperiment(){
	$("#numberP").css("font-size", "72px").css("color", "#000");
	$("#numberP").empty().text("Press Enter To Start");
	
	$("head link").each(function(){
		var href = $(this).attr("href");
		if(href != "undefined"){
			if(href.indexOf("stroopmain") > 0){
				$(this).remove();
			}
		}
	});
	
	$("<link/>", {
	   rel: "stylesheet",
	   type: "text/css",
	   href: "//reactiveresearch.xperimentalcode.com/data/experiments/strooptask/data/styles/stroopmain.css"
	}).appendTo("head");
		
	createStroopButtons();
}

function createStroopButtons(){
	var newButton = null;
	var buttonContainer = null;
	
	$("#answerBar").empty();
	resetStroopVars();
	
	for(var i=0;i<3;i++){
		var color = (i == 0 ? "Red" : (i == 1) ? "Green" : (i == 2) ? "Blue" : "");
		
		buttonContainer = $("<div id='buttonCont" + i.toString() + "' class='buttonContainer'></div>");
		newButton = $("<button id='button" + i.toString() + "' class='button'></button>");
		buttonContainer.append(newButton);
		newButton.button({
			label : color,
			icons : {
				primary: "ui-icon-lightbulb"
			}
		});	
		
		newButton.click(function(){
			// Click handler
			stroopcurresp = parseInt($(this).attr("id").substring(6));	
			stroopscores['answers'][stroopcurround]['selected'] = $("#numberP").text();		
			verifyStroopResponse((stroopcurresp == stroopcurcolor));
		});
		
		buttonContainer.append("<div id='keypad" + i.toString() + "' class='keypadVal'>Press " + stroopkeyset[stroopset][i].toString() + " on keypad.</div>");
		$("#answerBar").append(buttonContainer);
	}
}

function createStroopTask(){
	$("#numberP").css("font-size", "172px");
	stroopcounter = setInterval(function(){ strooptime++; }, 1000);
	if(typeof(stroopParams) != "undefined"){
		strooprounds = stroopParams['rounds'];
		strooptype   = stroopParams['type'];	
		
		if(strooprounds != -1 && strooptype != -1 && currentUser != ""){
			stroopcurround++; 
			stroopscores['totalpossible'] 			= strooprounds;
			stroopscores['totalscore']				= 0;
			stroopscores['tasktype']				= (strooptype == 0) ? "Congruous" : "Incongruous";
			stroopscores['answers'] 				= new Array();
			stroopscores['answers'][stroopcurround] = { };
			
			showStroopText();
		}
	}
}

function resetStroopVars(){
	stroopcounter 	= null;
	stroopcurcolor 	= -1;
	stroopcurresp	= -1;
	stroopcurround	= 0;
	stroopkeyset 	= new Array();
	stroopvals  	= { };
	strooprespint	= null; 
	stroopresptime	= 0;
	strooprounds	= -1;
	stroopscores	= { };
	stroopseed 		= Math.floor((Math.random()*99)+1);
	stroopsend		= false;
	stroopsession	= "";
	stroopsets 		= new Array();
	stroopset  		= (stroopseed <= 33) ? 1 : (stroopseed <= 66) ? 2 : 3;
	stroopstartmode	= true;
	strooptime   	= -1;
	strooptype 		= -1;
	
	stroopsets[1]  = [49,50,51];
	stroopsets[2]  = [52,53,54];
	stroopsets[3]  = [55,56,57];
	
	stroopkeyset[1] = ["1", "2", "3"];
	stroopkeyset[2] = ["4", "5", "6"];
	stroopkeyset[3] = ["7", "8", "9"];
}

function sendStroopData(){
	/*	stroopvals['scoreobj'] = stroopscores;
		stroopvals['duration']  = strooptime;
		stroopvals['strooptype']  = strooptype;
		stroopvals['sessionid'] = stroopsession;
	*/
	savingData = true;
	var good = 0;
	for(value in stroopvals){
		if(typeof(stroopvals[value]) != "undefined"){
			good++;
		}
	}
	
	if(good == 4){
		var params = { };
		params['scoreobj'] = stroopvals['scoreobj'];
		params['duration'] = stroopvals['duration'];
		params['testtype'] = "stroop-" + (stroopvals['strooptype'] == 0 ? "con" : "incon");
		params['user']	   = currentUser;
		fetchData("experimentLoader", true, "sendTestData", params);
	} else {
		showMessage("Some data is not ready to send.", "error", null, null);
	}
}

function showStroopText(){
	if(stroopcurround <= strooprounds){
		var randomval = Math.floor((Math.random()*99)+1);
		var textval   = "";
		var colcode   = new Array();
		colcode[1] = "#FF0000";
		colcode[2] = "#00FF00";
		colcode[3] = "#0000FF";
		
		if(randomval <= 33){
			textval = "RED";
			stroopcurcolor = 0;
		} else if(randomval <= 66){
			textval = "GREEN";
			stroopcurcolor = 1;
		} else if(randomval > 66){
			textval = "BLUE";
			stroopcurcolor = 2;
		}
		
		stroopscores['answers'][stroopcurround]['text'] = textval;
		
		$("#numberP").empty().text(textval);
		if(strooptype == 0){
			stroopscores['answers'][stroopcurround]['anstype'] = "C";
			
			$("#numberP").css("color", colcode[stroopcurcolor+1]);
		} else {
			var randcolor = Math.floor((Math.random() * 3)+1);
			stroopscores['answers'][stroopcurround]['anstype'] = (stroopcurcolor != randcolor - 1) ? "I" : "C";
			stroopcurcolor = randcolor - 1;
			$("#numberP").css("color", colcode[randcolor]);
		}
		
		$("#numberP").show(200, function(){
			stroopscores['answers'][stroopcurround]['displaycolor'] = (stroopcurcolor == 0) ? "Red" : (stroopcurcolor == 1) ? "Green" : "Blue";			
			$("#roundNumber").empty().text(stroopcurround.toString() + " of " + strooprounds.toString());
			strooprespint = setInterval(function(){ stroopresptime++; }, 100);
		});
	} else {
		$("#numberP").empty().css({ "font-size" : "72px", "color" : "#000" }).text("Task Complete!").show();
		window.clearInterval(stroopcounter);
		var btns = { 
			"OK" : function() {
				stroopvals = { };
				stroopvals['scoreobj'] = stroopscores;
				stroopvals['duration']  = strooptime;
				stroopvals['strooptype']  = strooptype;
				stroopvals['sessionid'] = stroopsession;
				
				stroopsend = true;
				$(this).dialog("close");
			}
		}
		
		var cls = function(){
			sendStroopData();
		}
		showMessage("You have finished this test, press OK to return to go to the next test.", "success", btns, cls);
	}
}

function verifyStroopResponse(answer){
	stroopscores['answers'][stroopcurround]['correct'] = answer;
	
	if(answer){
		stroopscores['totalscore']++;	
	}
	
	stroopcurround++;
	stroopscores['answers'][stroopcurround] = { };
	showStroopText();
}