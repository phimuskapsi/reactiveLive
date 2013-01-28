var stroopResults = null;
var stroopParams = { };
var tcipParams = { };
var tcipResults = null;

function loadExperimentSet(){
	// Dad just wants to run the experiments and gather data, we can do that...
	inExperiment = true;
	stroopParams = { };
	
	var btns = { 
		"OK" : function() {
			$(this).dialog("close");
		}
	};
	
	if(expLoop < 3){
		inStroop = true;
		var cls = function(){
			beginStroopExperiment();
		};
		
		if(expLoop == 0){
			stroopParams['type']   = 0;
			stroopParams['rounds'] = 15;
			$("#centerContainer").empty().load('../data/experiments/strooptask/index.html #stroopMain', function(){			
				showMessage("In order to complete the following test press the # key that corresponds to the color of the text. There are " + stroopParams['rounds'] + " rounds to complete.", "notice2", btns, cls);
				return;
			});
			
		} else if(expLoop == 1){
			stroopParams['type']   = 1;
			stroopParams['rounds'] = 30;
		} else if(expLoop == 2){
			stroopParams['type']   = 0;
			stroopParams['rounds'] = 15;
		}
		
		showMessage("In order to complete the following test press the # key that corresponds to the color of the text. There are " + stroopParams['rounds'] + " rounds to complete.", "notice2", btns, cls);
	} else {
		var cls = function(){
			beginTCIPExperiment();
		};
		
		inStroop = false;
		inTCIP = true;
		tcipParams['rounds'] = 30;
		$("#centerContainer").empty().load('../data/experiments/twochoice/index.html #tcipmainPage', function(){
			showMessage("In the following test, click the select button for a shape. Circles are worth 5 points and Squares are worth 15. Click the select button again when the shape begins flashing to earn the points. The test is set for " + tcipParams['rounds'] + " rounds.", "notice2", btns, cls);		
		});
	}
}
