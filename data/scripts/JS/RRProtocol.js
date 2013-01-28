var pitemcnt  = 0;
var protocol  = null;
var vardialog = null;

function addToProtocol(type){
	var rounds = -1;
	
	if(protocol == null){
		protocol = { };
	}
	
	protocol[pitemcnt] = { };
	
	switch(type){
		case "0":
			rounds = parseInt($("#stroopRounds").spinner("value"));
			type   = parseInt($("#stroopType").val());
			
			protocol[pitemcnt]['type']    = "EXPERIMENT";
			protocol[pitemcnt]['id']   	  = "STROOP";
			protocol[pitemcnt]['stype']   = type;
			protocol[pitemcnt]['rounds']  = rounds;
		break;
		
		case "1":
			rounds = parseInt($("#tcRounds").spinner("value"));
			protocol[pitemcnt]['type']    = "EXPERIMENT";
			protocol[pitemcnt]['id']   	  = "TWO-CHOICE";
			protocol[pitemcnt]['rounds']  = rounds;
		break;
		
		case "S":
			protocol[pitemcnt]['type']    = "SURVEY";
			protocol[pitemcnt]['id']      = parseInt($("#surveySelectDialog").val());
			protocol[pitemcnt]['detail']  = $("#surveyDetailDialog").html();
		break;
		
		case "U":
			protocol[pitemcnt]['type']    = "USERGROUP";
			
			var ugids = $("#userGroupSelect").multiselect("getChecked");
			if(ugids.length > 0){
				protocol[pitemcnt]['id']  = JSON.stringify(ugids);
			}
		break; 
		
		default:
			break;
	}
	
	writeProtocol(false);
	pitemcnt++;
}

function createProtocolBoxes(){
	var psize = Object.size(protocol);
	if(psize > 0){
		var stage = $("#protocolEditArea");
		var etype = null;
		var type  = "";
		var box	  = null;
		var header = null;
		
		stage.empty();
		
		for(var i=0;i<psize;i++){
			box   	= null;
			etype	= null;
			type 	= null;
			header	= null;
			
			etype 	= (protocol[i]['type'] == "EXPERIMENT") ? (" - Sub-Type: " +  capFirst(protocol[i]['id'].toString().toLowerCase())) : null;
			type  	= capFirst(protocol[i]['type'].toLowerCase());
			box   	= $("<div id='protocolBox" + i.toString() + "' class='questionBox ui-corner-all'></div>");
			header  = $("<div id='protocolBoxHead" + i.toString() + "' class='questionHead ui-widget-header'></div>")
			header.append("	<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-arrow-4'></span></span>" + 
						"	<span class='qheadNum'>" + "Step #: " + (i + 1).toString() + "</span>" + 
						"	<span class='qheadText'>Type: " + type + ((etype != null) ? etype : "") + "</span>" + 
						"	<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-wrench' data-protocoltype='" + type + "' id='pEdit" + i.toString() + "'></span></span>" + 
						"	<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-trash' id='pDelete" + i.toString() + "'></span></span>");
			
			body  = $("<div class='pboxBody ui-widget-content'></div>");
							
			switch(protocol[i]['type']){
				case "EXPERIMENT":
					var detail = "";
					switch(protocol[i]['id']){
						case "STROOP":
							detail = "The Stroop Task is an experiment that will present a series of colors and words and ask the " + 
									 "participant to match the color of the text to a keypad press.";
						break;
						
						case "TWO-CHOICE":
							detail = "The Two-Choice Task is an experiment that is a delayed gratification exam.";
					}
					body.append("<div class='pbodyContent'>" + 
									"<p class='pbchead'>" + etype + " Detail:</p>" + 
									"<p>" + detail + "</p>" + 
								"</div>");
				break;
				
				case "SURVEY":
					body.append(protocol[i]['detail']);					
				break;
				
				case "USERGROUP":
					
				break;
			}
			
			box.append(header).append(body);
			stage.append(box); 
		}
	}
}

function initProtocol(){
	$(".modal").hide();
	
	$("#protocolStartDate").datetimepicker();
	$("#protocolEndDate").datetimepicker();
	
	$("#protocolSubmit").button({
		label: "Create Protocol",
		icons: {
			primary: "ui-icon-check"
		}
	});
	
	$("#protocolClear").button({
		label: "Clear Protocol",
		icons: {
			primary: "ui-icon-trash"
		}
	});
	
	$("#protocolName").livequery("change", function(){
		writeProtocol(false);
	});
	
	$("#protocolEndDate").livequery("change", function(){
		writeProtocol(false);
	});
	
	$("#protocolStartDate").livequery("change", function(){
		writeProtocol(false);
	});
	
	$("#protocolSubmit").livequery("click", function(){
		if($("#protocolName").val() != ""){
			if(Object.keys(protocol).length > 0){
				// The the name exists and the protocol values are already guaranteed to be valid
				writeProtocol(true);
			} else {
				// No questions, no point to save
				showMessage("You must have at least one survey and / or experiment to save.", "error", null, null);
			}
		} else {
			// No name, existing auto does this so no need to check that
			showMessage("You must have at least one survey and / or experiment to save.", "error", null, null);
		}
	});
	
	$("#protocolClear").livequery("click", function(){
		if(Object.keys(protocol).length > 0){
			var btn = {
				"Yes" : function(){
					$("#protocolEditArea").empty();
					protocol = null;
					$(this).dialog("close");
				}, 
				"No" : function(){
					return false;
					$(this).dialog("close");
				}
			};
			
			showMessage("Do you want to clear the protocol?", "question", btn, null);
		} else {
			showMessage("Cannot clear without any survey(s) / experiment(s).", "error", null, null);
		}
	});	
	
	$(".toolButton").button();
	$(".toolButton").livequery("click", function() {
		var eleID = $(this).attr("id");
		switch(eleID) {
			case "attachSurvey":
				showMessage("Loading Surveys...", "notice", null, null);
				fetchData("surveyHandler", true, "getSurveyList", null);
			break;
			
			case "attachExperiment":
				showExperiments();
			break;
			
			case "attachUsers":
				showMessage("Loading User Groups...", "notice", null, null);
				fetchData("users", true, "getUserGroups", null);
			break;
		}

	});
}

function loadSurveyDetail(sid, skipfetch, detail, retval){
	var content 	= "";
	
	if(!skipfetch){
		var params 		= { };
		params['sid'] 	= sid;
		$().toastmessage('removeToast', toasty);
		showMessage("Loading Survey Detail...", "notice", null, null);
		fetchData("surveyHandler", true, "loadSurveyDetail", params);
	} else {
		$().toastmessage('removeToast', toasty);
		if(typeof(detail['description']) != "undefined"){
			content = $("<div class='pbodyContent'>" + 
							"<p class='pbchead'>Survey Details</p>" + 
							"<div class='pbodyContentLeft'>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Survey Name: </div>" + detail['name'] + "</div>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Survey Creator: </div>" + detail['creator'] + "</div>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Creation Date: </div>" + detail['createdon'] + "</div>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Survey Length: </div>" + detail['qcnt'].toString() + "</div>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Survey Start Date: </div>" + ((detail['startdate'] == "") ? "N/A" : detail['startdate']) + "</div>" + 
								"<div class='pbodyRow'><div class='pbrtxt'>Survey End Date: </div>" + ((detail['enddate'] == "") ? "N/A" : detail['enddate']) + "</div>" +
								"<div class='pbodyRow'><div class='pbrtxt'>Survey Description: </div>" + detail['description'] + "</div>" + 
							"</div>" + 
						"</div>");
		} else {
			content = $("<div class='pbodyContent'>" + 
								"<p class='pbchead'>Survey Details</p>" + 
								"<div class='pbodyContentLeft'>" + 
									"<div class='pbodyRow'><div class='pbrtxt'>Survey Name: </div>" + detail['name'] + "</div>" + 
									"<div class='pbodyRow'><div class='pbrtxt'>Survey Creator: </div>" + detail['creator'] + "</div>" + 
									"<div class='pbodyRow'><div class='pbrtxt'>Created On: </div>" + detail['createdon'] + "</div>" +  
									"<div class='pbodyRow'><div class='pbrtxt'># of Questions: </div>" + detail['qcnt'].toString() + "</div>" + 
									"<div class='pbodyRow'><div class='pbrtxt'>Start Date: </div>" + ((detail['startdate'] == "") ? "N/A" : detail['startdate']) + "</div>" + 
									"<div class='pbodyRow'><div class='pbrtxt'>End Date: </div>" + ((detail['enddate'] == "") ? "N/A" : detail['enddate']) + "</div>" + 
								"</div>" + 
							"</div>");
		}
		
		if(typeof(retval) != "undefined"){
			if(retval){
				return content;
			}
		}
		
		$("#surveyDetailDialog").empty().append(content);
	}
}

function protocolsComplete(resultset){
		switch(resultset){
		case "json-failed":
			var prjfailed = $().toastmessage('showToast', {
				text: 'Failed - Broken JSON Data.',
				position: 'middle-center',
				sticky: false,
				type: 'error',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', prjfailed);
				}	
			});
		break;
		
		case "no-data":
			var prndfailed = $().toastmessage('showToast', {
				text: 'Failed - No Data Received.',
				position: 'middle-center',
				sticky: false,
				type: 'error',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', prfailed);
				}	
			});
		break;
		
		case "tmp-saved":
			var prtSave = $().toastmessage('showToast', {
				text: 'Protocol Saved...',
				position: 'middle-center',
				sticky: false,
				type: 'success',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', prtSave);
				}	
			});
		break;
		
		case "final-save":
			var prfSave = $().toastmessage('showToast', {
				text: 'Protocol Saved Successfully.',
				position: 'middle-center',
				sticky: false,
				type: 'success',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', prfSave);
				}	
			});
		break;
	} 
}

function reloadProtocol(loaded, data){
	if(!loaded){
		showMessage("Reloading from cache...", "notice", null, null);
		fetchData("protocolHandler", true, "loadTempProtocol", null);
	} else {
		protocol = null;
		protocol = data['data'];
		if(protocol != null){
			createProtocolBoxes();
		}
		
		if(data['enddate'] != -1){
			$("#protocolEndDate").val(data['enddate']);
		}
		
		if(data['name'] != ""){
			$("#protocolName").val(data['name']);
		}
		
		if(data['startdate'] != -1){
			$("#protocolStartDate").val(data['startdate']);
		}
		
		if(data['description'] != ""){
			$("#protocolDescription").val(data['description']);
		}
		
		$().toastmessage('removeToast', toasty);
	}	
}

function showDetail(detail){
	switch(detail){
		case "0":
			showStroop();
		break;
		
		case "1":
			showTwoChoice();
		break;
	}
}

function showExperiments(){
	if(vardialog != null){
		$("#protocolDialog").dialog("destroy");
		vardialog = null;
	}
	
	$("#protocolDialog").empty().append(	"<p class='pbchead'>Select Experiment</p>" +
											"<select id='experimentSelect'>" + 
												"<option value='0'>Stroop Task</option>" + 
												"<option value='1'>Two-Choice Experiment</option>" + 
											"</select><br />" + 
											"<div id='experimentDetail' class='detailbox'></div>");
	$("#experimentSelect").selectBoxIt({
		theme: "jqueryui"
	});
	
	$("#experimentSelect").livequery("change", function(){
		switch($(this).val()){
			case "0":
				showStroop();
			break;
			
			case "1":
				showTwoChoice();
			break;
		}
	});	
	
	showStroop();		
	
	vardialog = $("#protocolDialog").dialog({
		autoOpen: true,
		height: 470,
		width: 500,
		modal: true,
		buttons: {
			"OK" : function(){
				var eval = $("#experimentSelect :selected").val();
				addToProtocol(eval);
				$(this).dialog("close");
			}, 
			"Cancel" : function(){
				$(this).dialog("close");
			}
		}
	});
}

function showStroop(){
	var detail = $("#experimentDetail");
	detail.empty().append(" <p class='pbchead'>Please choose the number of rounds and type of test</p>" + 
						   "<label for='stroopRounds'># of Rounds: </label>" + 
						   "<input id='stroopRounds' type='text' /><br />" + 
						   "<p class='pbchead'>Select Type</p>" + 
						   "<select id='stroopType'>" + 
						   		"<option value='0'>Congruous Color Test</option>" + 
						   		"<option value='1'>Incongruous Color Test</option>" + 
						   "</select>");
	
	$("#stroopRounds").spinner({
		max: 100,
		min: 1
	});
	
	$("#stroopType").selectBoxIt({
		theme: "jqueryui"
	});
}

function showSurveys(surveys){
	$().toastmessage('removeToast', toasty);
	if(Object.keys(surveys).length > 0){
		if(vardialog != null){
			$("#protocolDialog").dialog("destroy");
			vardialog = null;
		}
		
		$("#protocolDialog").empty().append(	"<p class='pbchead'>Select Survey</p>" +
												"<select id='surveySelectDialog'></select>" + 
												"<div id='surveyDetailDialog' class='detailbox'></div>");
		
		for(var i=0;i<Object.keys(surveys).length;i++){
			$("#surveySelectDialog").append("<option value='" + surveys[i]['id'] + "'>" + surveys[i]['name'] + "</option>");
		}							
		
		$("#surveySelectDialog").selectBoxIt({
			theme: "jqueryui"
		});	
		
		var sid = $("#surveySelectDialog :first-child").val();
		loadSurveyDetail(sid, false, null, false);
		
		$("#surveySelectDialog").livequery("change", function(){
			loadSurveyDetail($(this).val(), false, null, false);
		});
		
		vardialog = $("#protocolDialog").dialog({
			autoOpen: true,
			height: 470,
			width: 500,
			modal: true,
			buttons: {
				"Add" : function(){
					addToProtocol("S");
					$(this).dialog("close");
				}, 
				"Cancel" : function(){
					$(this).dialog("close");
				}
			}
		});
	}
}

function showTwoChoice(){
	var detail = $("#experimentDetail");
	detail.empty().append(" <p class='pbchead'>Please choose the number of rounds</p>" +  
						   "<label for='tcRounds'># of Rounds: </label>" + 
						   "<input id='tcRounds' type='text' />");
						   
	$("#tcRounds").spinner({
		max: 100,
		min: 1
	});
}

function showUserGroups(usergroups){
	$().toastmessage('removeToast', toasty);
	if(Object.keys(usergroups).length > 0){
		if(vardialog != null){
			$("#protocolDialog").dialog("destroy");
			vardialog = null;
		}
		
		$("#protocolDialog").empty().append(	"<label for='userGroupSelect'>Select Usergroup(s):</label>" +
												"<select id='userGroupSelect' multiple>" + 
													"<option value='-1'>All Users</option>" +
												"</select>" + 
												"<div id='userGroupDetail' class='detailbox'></div>");
		
		for(var i=0;i<Object.keys(usergroups).length;i++){
			$("#userGroupSelect").append("<option value='" + usergroups[i]['id'] + "'>" + usergroups[i]['name'] + "</option>");
		}
		
		$("#userGroupSelect").multiselect().multiselectfilter();			
				
		vardialog = $("#protocolDialog").dialog({
			autoOpen: true,
			height: 470,
			width: 500,
			modal: true,
			buttons: {
				"Add" : function(){
					addToProtocol("U");
					$(this).dialog("close");
				}, 
				"Cancel" : function(){
					$(this).dialog("close");
				}
			}
		});
	}
}

function writeProtocol(finalwrite){
	var params = { };
	params['name']  = $("#protocolName").val();
	params['desc']  = $("#protocolDescription").val();
	params['sdate'] = $("#protocolStartDate").datetimepicker('getDate');
	params['edate'] = $("#protocolEndDate").datetimepicker('getDate');
	params['pdata'] = protocol;
	params['user']  = currentUser;
	
	createProtocolBoxes();
	
	if(finalwrite){
		fetchData("protocolHandler", true, "protocolFullSave", params);
	} else {
		fetchData("protocolHandler", true, "protocolQuickSave", params);
	}
}
