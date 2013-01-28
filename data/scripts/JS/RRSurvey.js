var qCnt = 0;
var qObj = { };
var qBoxStart = new Array();
var qBoxEnd   = new Array();
var tempObj = new Array();
var testObj = new Array();
var newType = false;
var scale = false;
var scaleOptions = null;
var scaleCnt = 0;
var save = false;
var ansCnt = 0;
var delAnsTarget = null;
var inputCnt = 0;
var edit = false;
var editnum = -1; 

function addAnswer(target, scaleType) {
	var ansID = 'answer' + target + 'Finished' + ansCnt.toString();
	var finID = '';
	var targetDialog = "";
	
	if(typeof(target) != "undefined"){
		finID = 'answer' + target + "Input" + ansCnt.toString();
		switch(target){
			case "multi":
				targetDialog = "#createSurveyQMulti";				
				var detail = $(targetDialog).children(".answerDetail").first();
				detail.append("<div class='answerFinished' title='Click and Drag to Re-Position' id='" + ansID + "'></div>")
				
				$("#" + ansID).button({
					label : "<input type='text' id='" + finID + "' class='answerFinishedInput' value='' />",
					icons : {
						primary : "ui-icon-arrow-4",
						secondary : "ui-icon-trash"
					}
				});
			
				$("#" + ansID).addClass('ui-state-error');
				$("#" + ansID).children(".ui-icon-trash").attr("id", ansID + "Trash");
			
				if (ansCnt >= 1) {
					$("#" + ansID).css("margin-top", "5px");
				}
			
				$("#" + ansID + "Trash").livequery(function() {
					$(this).click(function() {
						delAnsTarget = $("#" + ansID);
			
						var btns = {
							"Yes" : function() {
								if (delAnsTarget != null) {
									if (ansCnt > 1) {
										ansCnt--;
										delAnsTarget.remove();
										$(this).dialog("close");
									} else {
										alert("Cannot have less than one answer.");
										$(this).dialog("close");
									}
								}
							},
							"No" : function() {
								$(this).dialog("close");
							}
						};
			
						var clsFunc = function() {
							$("#messageModal").empty();
							$(this).dialog("close");
						};
			
						var msg = "Are you sure you want to delete this?";
						var icon = "question";
			
						showMessage(msg, icon, btns, clsFunc);
					});
				});
			
				$("#" + finID).livequery(function() {
					$(this).on("change", function() {
						if ($(this).val().length > 0) {
							$("#" + ansID).removeClass('ui-state-error');
						} else {
							$("#" + ansID).addClass('ui-state-error');
						}
					});
				});
			
				detail.sortable(); 
				ansCnt++;
			break;
			
			case "scale": 
				targetDialog = "#createSurveyQScale";
				if(typeof(scaleType) != "undefined"){					
					var mini    = 0;
					var maxi    = 0;
					var intv   = 0;
					var sta    = 0;
					
					if(scaleType == "numeric"){
						mini = 0;
						maxi = 10;
						intv = 1;
						sta = 0;
					} else if(scaleType == "panas"){
						mini = -5;
						maxi = 5;
						intv = 1;
						sta  = 0;	
					}
					
					$("#scaleOptions").empty();
					$("#scaleOptions").append("	<h2>Select values: </h2>" + 
											  " <div class='scaleOptLabel'><label for='scaleMin'>Minimum Value: </label></div>" + 
											  " <div class='scaleOptInput'><input id='scaleMin' name='min'/></div>" + 
											  " <div class='scaleOptLabel'><label for='scaleMax'>Maximum Value: </label></div>" + 
											  " <div class='scaleOptInput'><input id='scaleMax' name='max'/></div>" + 
											  " <div class='scaleOptLabel'><label for='scaleInterval' title='Typical Interval is 1'>Scale Interval: </label></div>" + 
											  " <div class='scaleOptInput'><input id='scaleInterval' name='intv'/></div>" +
											  " <div class='scaleOptLabel'><label for='scaleStart'>Starting Value:</label></div>" + 
											  " <div class='scaleOptInput'><input id='scaleStart' name='sta' />");
					
					$("#scaleOptions :input").each(function(){
						$(this).spinner({
							min: -999,
							max: 999,
							step: 1
						});
						
						switch($(this).attr("name")){
							case "min":
								$(this).spinner("value", mini);
							break;
							
							case "max":
								$(this).spinner("value", maxi);
							break;
							
							case "intv":
								$(this).spinner("value", intv);
							break;
							
							case "sta":
								$(this).spinner("value", sta);
							break;
						}
						
						$(this).livequery("change", function(){
							updateScaleOption($(this).attr("id").substring(4), $(this).val());
						});
					});
						  
					$("#scaleOptions").dialog({
						autoOpen: true,
						modal: true,
						buttons: {
							"OK" : function(){
								updateScaleOption("int", $("#scaleInterval").val());
								updateScaleOption("min", $("#scaleMin").val());
								updateScaleOption("max", $("#scaleMax").val());
								updateScaleOption("sta", $("#scaleStart").val());
																
								if(checkScaleOptions(scaleType)){
									// Passed all checks, good to draw scale
									createScale("#scaleDetail");
									$("#scaleOptions").dialog("close");
								} else {
									alert("Please make sure all input fields are filled out.");
								}								
							}, 
							"Cancel": function(){
								$("#scaleOptions").dialog("close");
							}	
						},
						close: function(){
							
						},
						width: 300,
						height: 300
					});
				}
			break;
			
			case "normal":
				targetDialog = "#createSurveyQuestion";
				switch(newType){
					case "date":
						$("#questionDetail").empty();
						$("#questionDetail").append('<div class="modalQuestion" title="Choose type of picker."></div>');
						var detail = $("#questionDetail").children(".modalQuestion").first();
						if(typeof(detail) != "undefined"){
							detail.append('<div class="modalLabelS">' +
										  		'<label for="typePicker">Select The Type of Picker:</label>' +
										  '</div>' + 
										  '<div class="modalInput">' +
										  	'<select name="typePicker" id="typePicker">' +
										  		'<option value="date" selected="selected">Date Picker Only</option>' + 
										  		'<option value="time">Time Picker Only</option>' + 
										  		'<option value="datetime">Date and Time Picker</option>' + 
									      	'</select>' +
									      '</div>' + 
									      '<div id="pickerImage"' +
										  '</div>');
						}	
					break;
					
					case "text":
						$("#questionDetail").empty();
						$("#questionDetail").append('<div class="modalQuestion" title="# of rows describes the textbox height."></div>');
						var detail = $("#questionDetail").children(".modalQuestion").first();
						if(typeof(detail) != "undefined"){
							detail.append('	<div class="modalLabelS">' +
										  		'<label for="numberOfRows">Select # of Rows:</label>' +
										  	'</div>' + 
									  		'<div class="modalInput">' +
									  			'<select name="numberOfRows" id="numberOfRows">' +
									  				'<option value="1" selected="selected">1</option>' + 
										  			'<option value="2">2</option>' + 
										  			'<option value="3">3</option>' + 
										  			'<option value="4">4</option>' + 
										  			'<option value="5">5</option>' +
										  			'<option value="6">6</option>' +
										  			'<option value="7">7</option>' +
										  			'<option value="8">8</option>' +
									      		'</select>' +
										  	'</div>');
						}
					break;
				}
			break;
		}
	}
}

function checkScaleOptions(scaleType){
	if(scaleOptions != null){
		if(scaleOptions['min'] == scaleOptions['max']){
			alert("Minimum Value cannot equal the maximum!");
			return false;
		}
		
		if(scaleOptions['min'] > scaleOptions['max']){
			alert("Minimum Value cannot be greater than the maximum!");
			return false;
		}
		
		if(scaleOptions['int'] < scaleOptions['min'] || scaleOptions['int'] > scaleOptions['max']){
			alert("Interval Value is Invalid.");
			return false;
		}
		
		if(scaleOptions['sta'] < scaleOptions['min'] || scaleOptions['sta'] > scaleOptions['max']){
			alert("Start Value is Invalid.");
			return false;	
		}
		
		var good = 0;
		for(var key in scaleOptions){
			if(scaleOptions[key] != null){
				good++;
			}	
		}
		
		if(good >= 4){
			scaleOptions['type'] = scaleType;
			return true;
		}
	}
	
	return false;
}

function clearDialog(name){
	if(typeof(name) != "undefined"){
		if($(name).length > 0){
			$(name).children().each(function(){
				if($(this).is(":input")){
					switch(this.type){
						case 'password':
						case 'select-multiple':
						case 'select-one':
						case 'text':
						case 'textarea':
							$(this).val('');
						break;
						case 'checkbox':
						case 'radio':
							this.checked = false;
						break;
					}
				}
			});
		}
	}
}

function createDialog(type) {
	if ( typeof (type) != "undefined") {		
		switch(type) {
			case "instruction":
				clearDialog("createSurveyInstruction");
				if($("#instructionText").hasClass("ui-state-error")){
					$("#instructionText").removeClass("ui-state-error");
				}
				
				if(tinyMCE.getInstanceById("instructionText")){
					tinyMCE.execCommand('mceFocus', false, "instructionText");
					tinyMCE.execCommand('mceRemoveControl', false, "instructionText");
				}
				
				$("#instructionText").val("");
				
				tinyMCE.init({
					mode: "none",
					theme: "advanced",
					plugins : "autolink,lists,pagebreak,style,table,advhr,advimage,advlink,insertdatetime,searchreplace,paste",

					theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,forecolor,backcolor,formatselect,fontselect,fontsizeselect",
			        theme_advanced_buttons2 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup",
			        theme_advanced_toolbar_location : "top",
			        theme_advanced_toolbar_align : "left",
			        theme_advanced_statusbar_location : "bottom",
			        theme_advanced_resizing : false,
				});
				
				tinyMCE.execCommand('mceAddControl', false, 'instructionText');
				
				var btns = { 
					"Save" : function(){
						if(createInstruction()){
							$("#createSurveyInstruction").dialog("close");
							createQuestion();
						} else {
							showMessage("Please enter instructions!", "error", null, null);
							return false;
						}
					},
					"Cancel" : function() {
						$("#createSurveyInstruction").dialog("close");
					}
				};
				
				$("#createSurveyInstruction").dialog({ 
					autoOpen : false,
					buttons : btns,
					modal : true,
					width : 600,
					height : 600
				});
				break;

			case "multi":
				clearDialog("createSurveyQMulti");				
				$("#answerDetail").empty();

				if(!edit){
					addAnswer(type, null);
				}
				
				var ansbutton = $("#answerVal");
				ansbutton.unbind("click");
				ansbutton.button({
					label : "New Answer",
					icons : {
						primary : "ui-icon-plusthick"
					}
				});
				
				ansbutton.click(function(){
					addAnswer(type, null);
				});

				
				var btns = { 
					"Save" : function(){
						createMultiQuestion();	
					},
					"Cancel" : function() {
						$("#createSurveyQMulti").dialog("close");
					}
				};
				
				resetRadio("M");
												
				$("#yesNoRadioM").buttonset();				
				$("#createSurveyQMulti").dialog({ 
					autoOpen : false,
					buttons : btns,
					modal : true,
					width : 600,
					height : 600,
					close: function(){
						$("#createSurveyQMulti").find(".answerDetail").empty();
						$("#createSurveyQMulti").find(":input").val("");
						$("#yesNoRadioM").buttonset("destroy");
					}
				});
				break;

			case "normal":
				clearDialog("createSurveyQuestion");	
				addAnswer(type, null);
				resetRadio("");
				
				$("#yesNoRadio").buttonset();				
				$("#createSurveyQuestion").dialog({
					autoOpen : false,
					buttons : {
						"Save" : function() {
							createNormalQuestion();						
						},
						"Cancel" : function() {
							$("#createSurveyQuestion").dialog("close");
						}
					},
					close : function() {
						$("#createSurveyQuestion").find(":input").val("");
						$("#yesNoRadio").val("0");
					},
					width : 600,
					height : 300,
					modal : true
				});
				break;

			case "scale":
				clearDialog("createSurveyQScale");	
				$("#scaleDetail").empty();
				$("#scaleSelector").empty();
				
				resetRadio("S");
				$("#yesNoRadioS").buttonset();
				
				var numericScale = $("<div id='numericScale' class='scaleOption'></div>");
				var panasScale = $("<div id='panasScale' class='scaleOption'></div>");
				
				$("#scaleSelector").append(numericScale).append(panasScale);
				
				numericScale.button({
					label : "Numeric Scale",
					icons : {
						primary : "ui-icon-arrowthick-1-e"
					}
				});
				
				panasScale.button({
					label : "Positive and Negative Scale",
					icons: {
						primary : "ui-icon-arrowthick-2-e-w"
					}
				});

				numericScale.click(function() {
					addAnswer(type, "numeric");
				});
				
				panasScale.click(function(){
					addAnswer(type, "panas");	
				});
				
				$("#createSurveyQScale").dialog({
					autoOpen : false,
					buttons : {
						"Save" : function() {
							createScaleQuestion();						
						},
						"Cancel" : function() {
							$("#createSurveyQScale").dialog("close");
						}
					},
					close : function() {
						$("#createSurveyQScale").find(".scaleDetail").empty();
						$("#createSurveyQScale").find(":input").val("");
						$("#yesNoRadioS").val("0");
					},
					width : 600,
					height : 600,
					modal : true
				});
				break;
		}
	}
}

function createInstruction(){
	tinyMCE.triggerSave();
	var text = tinyMCE.activeEditor.getContent();
	if(typeof(text) != "undefined"){
		if(text != ""){
			text = escape(text);
			if(!edit){
				qObj[qCnt] = {};
				qObj[qCnt]['type'] = "instruction";
				qObj[qCnt]['text'] = "instruction";
				qObj[qCnt]['req']  = false;
				qObj[qCnt]['data'] = text;
				qCnt++;
			} else {
				qObj[editnum]['type'] = "instruction";
				qObj[editnum]['text'] = "instruction";
				qObj[editnum]['req']  = false;
				qObj[editnum]['data'] = text;
			}
			return true;
		}
	}
	
	$("#instructionText").addClass("ui-state-error");
	$("#instructionText").livequery("change", function(){
		if($(this).val().length > 0){
			if($(this).hasClass("ui-state-error")){
				$(this).removeClass("ui-state-error");
			}
		}
	});
	return false;
}

function createMultiQuestion(){
	var question = null;
	var result = null;
	result = questionValid();
	
	if (result != null) {
		if (Array.isArray(result)) {
			for (var i = 0; i < result.length; i++) {
				$("#" + result[i]).addClass("ui-state-error");
				$("#" + result[i]).livequery(function() {
					$(this).on('change', function() {
						if ($(this).val().length > 0) {
							$(this).removeClass("ui-state-error");
							$(this).off("change");
						}
					});
				});
			}
	
			var btns = {
				"OK" : function() {
					$(this).dialog("close");
				}
			};
	
			showMessage("Please either delete or fill out empty answers.", "error", btns);
			return false;
		} else if (result == "required") {
			$("#yesNoRadioM").addClass("ui-state-error");
			$("#yesNoRadioM").livequery(function() {
				$(this).on('click', function() {
					$("#yesNoRadioM").removeClass("ui-state-error");
				});
			});
			showMessage("Please select if question is required.", "error");
			return false;
		} else if (result == "questionText") {
			// Throw to error handler
			$("#multiQuestionText").addClass("ui-state-error");
			$("#multiQuestionText").livequery(function() {
				$(this).on('change', function() {
					if ($(this).val().length > 0) {
						$("#multiQuestionText").removeClass("ui-state-error");
						$("#multiQuestionText").off("change");
					}
				});
			});
			showMessage("The question text is either empty or the same as another question, which is not allowed.", "error");
			return false;
		} else if (result == "noAnswers") {
			// This is basically impossible
			showMessage("Must have at least one answers.", "error");
			return false;
		} else if (result == "good") {
			// Everything is good to go! 
			createQuestion();
			$("#createSurveyQMulti").dialog("close");
		}
	}
}

function createNormalQuestion(){
	var result = questionValid();
	if(typeof(result) != "undefined"){
		switch(result){
			case "good":
				createQuestion();
				$("#createSurveyQuestion").dialog("close");
			break;
			
			case "questionText":
				$("#questionText").addClass("ui-state-error");
				$("#questionText").livequery(function() {
					$(this).on('change', function() {
						if ($(this).val().length > 0) {
							$("#questionText").removeClass("ui-state-error");
							$("#questionText").off("change");
						}
					});
				});
			break;
		}
	}	
}

function createQuestionBox(lastQ){
	if(typeof(qObj) != "undefined"){
		if(typeof(qObj[lastQ]) != "undefined"){			
			var qID = "questionBox" + lastQ.toString();
			var qType = qObj[lastQ]['type'];
			
			if(typeof(qType) != "undefined"){
				if(typeof(edit) != "undefined"){		
					if(edit && lastQ > 0){
						$("#questionBox" + (lastQ - 1).toString()).after("<div id='" + qID + "' class='questionBox ui-corner-all'></div>");
					} else {
						$("#tabEditArea").append("<div id='" + qID + "' class='questionBox'></div>");
					}
				}
				
				$("#" + qID).append("<div class='questionHead ui-widget-header' id='questionHead" + lastQ.toString() + "'></div>");
				$("#" + qID).append("<div class='questionInput ui-widget-content' id='questionInput" + lastQ.toString() + "'></div>");
	
				var qhead = $("#questionHead" + lastQ.toString());
				if(qType != "instruction"){					
					qhead.append("<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-arrow-4'></span></span><span class='qheadNum'>" + "Question #:" + (lastQ + 1).toString() + "</span>");
					qhead.append("<span class='qheadText'>"	+ qObj[lastQ]['text'] + "</span>");
					
					if(qObj[lastQ]['req'] == true){
						qhead.append("<span class='qheadIconBox qheadReqStar'> * </span><span class='qheadReq'>Required</span>");
						qhead.children(".qheadText").first().css("width", "460px");
					}
				} else {
					qhead.append("<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-arrow-4'></span></span><span class='qheadNum'>Instructions</span>");
					qhead.append("<span class='qheadText'>Please Follow The Instructions Below: </span>");
					
				}
				
				qhead.append("<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-wrench' data-questiontype='" + qType + "' id='qEdit" + lastQ.toString() + "'></span></span>");
				qhead.append("<span class='qheadIconBox'><span class='qheadIcon ui-icon ui-icon-trash' id='qDelete" + lastQ.toString() + "'></span></span>");
					
				$("#qEdit" + lastQ.toString()).livequery("click", function(){
					loadQuestion($(this).attr("id").substring(5), $(this).attr("data-questiontype"));
				});
				
				$("#qDelete" + lastQ.toString()).livequery("click", function(){
					deleteQuestion($(this).attr("id").substring(5)); 
				});					
	
				switch(qType){
					case "radio":
					case "checkbox":
						if(typeof(qObj[lastQ]['data'] != "undefined")){		
							var inputSelector = $("#questionInput" + lastQ.toString());
							inputSelector.append("<div class='questionInputSpacer'><p>Select Answer From Below:</p></div>");
							
							for(var i=0;i<qObj[lastQ]['data'].length;i++){
								// Add answers to multichoice type
								inputSelector.append("<input type='" + qObj[lastQ]['type'] + "' id='qInput"	+ inputCnt.toString() + "' value='" + i.toString() + "' name='qInputName" + lastQ.toString() + "' />");
								inputSelector.append("<label for='qInput" + i.toString() + "'>" + qObj[lastQ]['data'][i] + "</label>");
								inputSelector.append("<br />");
								inputCnt++;
							}						
						}
					break;
					
					case "date":
					case "text":
						var inputSelector = $("#questionInput" + lastQ.toString());
						var dTarget = "#qInput" + inputCnt.toString();
						
						if(typeof(qObj[lastQ]['data'] != "undefined")){
							if(qObj[lastQ]['data'] != false || qObj[lastQ]['data'] != null){
								if(validScaleValue(qObj[lastQ]['data'])){
									// This is really a 'valid int' check.
									// If it's an int then it's a # of rows
									var rows = parseInt(qObj[lastQ]['data']);	
									inputSelector.append("<div class='questionInputSpacer'><p>Please enter Answer Below:</p></div>");
								
									if(rows == 1){
										inputSelector.append("<input type='" + qObj[lastQ]['type'] + "' id='qInput" + inputCnt.toString() + 
														 "' value='' name='qInputName" + lastQ.toString() + "' />");
									} else {
										inputSelector.append("<textarea id='qInput" + inputCnt.toString() + 
														 "' value='' name='qInputName" + inputCnt.toString() + 
															 "' rows='" + rows + "' />");
									}
									inputSelector.append("<br />");
									inputCnt++;
								} else {
									// Then it's probably text, make sure the length is good
									if(qObj[lastQ]['data'].length > 0){
										inputSelector.append("<input type='text' id='qInput" + inputCnt.toString() + "' />");
	
										var dType = qObj[lastQ]['data'];
										switch(dType){
											case "date":
												$(dTarget).before("<div class='questionInputSpacer'><p>Click to Select the Date:</p></div>");
												$(dTarget).datepicker();
											break;
											
											case "datetime":
												$(dTarget).before("<div class='questionInputSpacer'><p>Click to Select the Date and Time:</p></div>");
												$(dTarget).datetimepicker();
											break;
											
											case "time":
												$(dTarget).before("<div class='questionInputSpacer'><p>Click to Select the Time:</p></div>");
												$(dTarget).timepicker();
											break;	
										}
										inputCnt++;
									}
								}
							}
						}
					break;
					
					case "instruction":
						if(typeof(qObj[lastQ]['data'] != "undefined")){
							var inputSelector = $("#questionInput" + lastQ.toString());
							inputSelector.append("<div class='instructionClass' id='inst" + lastQ.toString() + "'></div>");
							$("#inst" + lastQ.toString()).html(decodeURIComponent(qObj[lastQ]['data']));
							inputCnt++;
						}
					break;
					
					case "scale":
						if(typeof(qObj[lastQ]['data'] != "undefined")){
							var inputSelector = "#questionInput" + lastQ.toString();
							createScale(inputSelector);
							$("#scaleHolder" + (scaleCnt - 1).toString()).before("<p>Move Slider to Select Answer:</p>");
						}
					break;			
				}	
			}
		}
	}
}

function createQuestion() {
	var lastID = -1;
	var lastQ = -1;
	
	if ( typeof (qObj) != "undefined") {
		if (qObj != null) {
			if(!masterReload){
				var questions = $("#tabEditArea").children().last();
				if (questions.length > 0) {
					lastID = questions.attr('id');
					lastQ = parseInt(lastID.substring(lastID.length - 1));
				}
	
				lastQ++;
				
				if(typeof(edit) != "undefined"){
					if(edit){
						lastQ = editnum;
						$("#questionBox" + lastQ.toString()).empty().remove();
					}
				}
				
				createQuestionBox(lastQ);
			} else {
				$("#tabEditArea").empty();
				for(var z=0;z<qObj.length;z++){
					createQuestionBox(z);
				}
			}
		}
	}
	
	qBoxStart = new Array();
	qBoxEnd   = new Array();
	
	$("#tabEditArea").sortable({
		stop: function(event, ui){
			var changes = $(this).sortable("toArray");
			var ccnt    = 0;
			var pos		= new Array();
			
			if(typeof(changes) != "undefined"){
				for(var i=0;i<changes.length;i++){
					if(changes[i] != qBoxStart[i]){
						pos[ccnt] = i;
						ccnt++;														
					}
				}
				
				if(ccnt == 2){
					// We have both positions
					// pos[0] and pos[1] just switch in qObj
					var movedata = qObj.splice(pos[1], 1);
					qObj.splice(pos[0], 0, movedata[0]);
												
					// Rebuild question boxes to renumber
					for(var k=0;k<qObj.length;k++){
						edit = true;			
						editnum = k;
						createQuestion();
					}
					
					// Save to DB the new order
					writeQuestion(false);
				}	
			}
			
		},
		start: function(event, ui){
			var original = $(this).sortable("toArray");
			
			if(typeof(original) != "undefined"){
				qBoxStart = original;
			}
		}
	});
	
	edit = false;
	editnum = -1;
}

function createScale(target){ 
	var intv = scaleOptions['int'];
	var maxi = scaleOptions['max'];
	var mini = scaleOptions['min'];
	var sta  = scaleOptions['sta'];
	var type = scaleOptions['type'];
	
	$(target).empty();
	$(target).append("<div class='scaleHolder' id='scaleHolder" + scaleCnt.toString() + "'></div>");
	$("#scaleHolder" + scaleCnt.toString()).append("<div class='scaleLabel'>Min: " + mini + "</div>" + 
	                         "<div class='scaleSlider' id='scaleSlider" + scaleCnt.toString() + "'></div>" + 
	                         "<div class='scaleLabel'>Max: " + maxi + "</div>");
	$(target).append("<div class='scaleInfo' id='scaleInfo" + scaleCnt.toString() + "'></div>");
    $("#scaleInfo" + scaleCnt.toString()).append("<label for='slideAmount'>Current Value:</label>" + 
   						   "<input type='text' readonly='readonly' id='slideAmount" + scaleCnt.toString() + "' value='" + sta + "' style='border: 0; color: #f6931f; font-weight: bold;' />");

	
	$("#scaleSlider" + scaleCnt.toString()).slider({
		value: sta,
		min: mini,
		max: maxi,
		step: intv,
		slide: function(event, ui){
			$("#slideAmount" + scaleCnt.toString()).val(ui.value);
		}
	});
	
	scaleCnt++;
}

function createScaleQuestion(){
	var result = questionValid();
	switch(result){
		case "good":
			createQuestion();
			
			$("#createSurveyQScale").dialog("close");
		break;
		
		case "questionText":
			showMessage("Question Text is either not set, or duplicates previous question.", "error", null, null);
		break;
		
		case "scaleOptions":
			showMessage("Something is wrong with the scale options. Try again.", "error", null, null);
		break;
		
		case "unknown":
			showMessage("An unknown error has occured.", "error", null, null);
		break;
	}		
}

function deleteQuestion(num){
	// Have to remove object from the array AND adjust all numbers...
	var btns = {
		"Yes" : function(){
			qObj.splice(num,1);
			$("#tabEditArea").empty();
			
			if(num == 0){
				qCnt = 0;
			} else {
				qCnt--;
				
				for(var i=0;i<qObj.length;i++){	
					edit = true;			
					editnum = i;
					createQuestion();	
				}
				
				edit = false;
				editnum = -1;
			}
			
			$(this).dialog("close");
		},
		"No" : function(){
			$(this).dialog("close");
		}
	};
	var cls  = null;
	
	showMessage("Do you want to delete this question?", "question", btns, cls);
	
}

function initSurvey(){
	$(".modal").hide();
	
	$("#surveyStartDate").datetimepicker();
	$("#surveyEndDate").datetimepicker();
	
	$("#surveySubmit").button({
		label: "Create Survey",
		icons: {
			primary: "ui-icon-check"
		}
	});
	
	$("#surveyClear").button({
		label: "Clear Survey Fields",
		icons: {
			primary: "ui-icon-trash"
		}
	});
	
	$("#surveySubmit").livequery("click", function(){
		if($("#surveyName").val() != ""){
			if(Object.keys(qObj).length > 0){
				// The the name exists and the questions are already guaranteed to be valid
				writeQuestion(true);
			} else {
				// No questions, no point to save
				showMessage("You must have at least one question to save.", "error", null, null);
			}
		} else {
			// No name, existing auto does this so no need to check that
			showMessage("You must have at least one question to save.", "error", null, null);
		}
	});
	
	$("#surveyClear").livequery("click", function(){
		if(Object.keys(qObj).length > 0){
			var btn = {
				"Yes" : function(){
					$("#tabEditArea").empty();
					qObj = null;
					qObj = { };
					$(this).dialog("close");
				}, 
				"No" : function(){
					return false;
					$(this).dialog("close");
				}
			};
			
			showMessage("Do you want to clear the survey?", "question", btn, null);
		} else {
			showMessage("Cannot clear without any questions.", "error", null, null);
		}
	});	
	
	$(".toolButton").button();
	$(".toolButton").livequery(function() {
		var eleID = $(this).attr("id");

		$(this).click(function() {
			switch(eleID) {
				case "addCheckbox":
					newType = "checkbox";
					createDialog("multi");
					$("#createSurveyQMulti").dialog("open");
					break;

				case "addDatetime":
					newType = "date";
					createDialog("normal");
					$("#createSurveyQuestion").dialog("open");
					break;
					
				case "addInstruction":
					newType = "instruction";
					createDialog("instruction");
					$("#createSurveyInstruction").dialog("open");
					break;

				case "addScale":
					newType = "scale";
					createDialog("scale");
					$("#createSurveyQScale").dialog("open");
					break;

				case "addRadio":
					newType = "radio";
					createDialog("multi");
					$("#createSurveyQMulti").dialog("open");
					break; 

				case "addTextbox":
					newType = "text";
					createDialog("normal");
					$("#createSurveyQuestion").dialog("open");
					break;

				//case "addUpload":
				//	newType = "upload";
				//	createDialog("normal", false, -1);
				//	$("#createSurveyQuestion").dialog("open");
				//	break;
			}

		});
	});
}

function loadQuestion(num, type){
	edit = true;
	editnum = parseInt(num);
	if(!isNaN(editnum)){
		if(typeof(qObj[editnum]) != "undefined"){
			newType = type;
			switch(type){
				case "checkbox":
				case "radio":
					createDialog("multi");
					$("#multiQuestionText").val(qObj[editnum]['text']);
					loadRadio(qObj[editnum]['req'], "M");
					
					$("#answerDetail").empty();
					
					var answers = qObj[editnum]['data'];
					for(var i=0;i<answers.length;i++){
						addAnswer("multi", null);
						$("#answermultiInput" + (ansCnt - 1).toString()).val(answers[i]);
					}
					
					$(".answerFinished").removeClass("ui-state-error");
					$("#createSurveyQMulti").dialog("open");
				break;
				
				case "instruction":
					createDialog("instruction");
					$("#createSurveyInstruction").dialog("open");
					tinyMCE.activeEditor.setContent(decodeURIComponent(qObj[editnum]['data']));
				break;
				
				case "date":
					createDialog("normal");
					$("#questionText").val(qObj[editnum]['text']);
					loadRadio(qObj[editnum]['req'], "");
					$("#typePicker").val(qObj[editnum]['data']);
					$("#createSurveyQuestion").editnum("open");
				break;
				
				case "scale":
					createDialog("scale");
					$("#scaleQuestionText").val(qObj[editnum]['text']);
					loadRadio(qObj[editnum]['req'], "S");
					scaleOptions = qObj[editnum]['data'];
					$("#createSurveyQScale").dialog("open");
					createScale("#scaleDetail");
				break;
				
				case "text":
					createDialog("normal");
					$("#questionText").val(qObj[editnum]['text']);
					$("#yesNoRadio").val(qObj[editnum]['req']);
					$("#numberOfRows").val(qObj[editnum]['data']);
					$("#createSurveyQuestion").dialog("open");
				break;				
			}
		}
	}
}

function loadRadio(r, l){
	if(r == true){
		$("#yesReq" + l).attr("checked", "checked");
		$("#noReq" + l).removeAttr("checked");
	} else {
		$("#noReq" + l).attr("checked", "checked");
		$("#yesReq" + l).removeAttr("checked");
	}
}

function questionTextCheck(txtID, edit){
	var tmpReq = false;
	var tmpTxt = "";
	var qTextGood = false;

	tmpTxt = $(txtID).val();
	qTextGood = (tmpTxt == "") ? false : true;
	
	if(!edit){
		if(qObj.length > 0){
			for(var j=0;j<qObj.length;j++){
				if(qObj[j]['text']){
					if(qObj[j]['text'] == tmpTxt){
						qTextGood = false;
					}
				}
			}
		}
	}
	return (qTextGood);
}

function questionValid() {
	var answers = Array();
	var cntGood = false;
	var date = false;
	var empty = Array();
	var empCnt = 0;
	var goodCnt = 0;
	var qTextGood = false;
	var scale = false;
	var upload = false;

	if ( typeof (newType) != "undefined") {
		switch(newType) {
			case "radio":
			case "checkbox":
				var acnt   = 0;
				var afiLen = $(".answerFinishedInput").length;
				if (afiLen > 0) {
					$(".answerFinishedInput").each(function() {
						if ($(this).val().length > 0) {
							answers[acnt] = $(this).val();
							acnt++;
						} else {
							empty[empCnt] = $(this).attr("id");
							empCnt++;
						}
					});

					if (afiLen == acnt) {
						cntGood = true;
					} else {
						return empty;
					}
				} else {
					return "noAnswers";
				}
				var tmpTxt = "#multiQuestionText";
				var tmpReq = "#yesNoRadioM";	
				var reqVal = $(tmpReq + " :radio:checked").val();
								
				var qGood = questionTextCheck(tmpTxt, edit);
				if(qGood && cntGood){
					// Add to question array for test
					if(!edit){
						qObj[qCnt] = { };
						qObj[qCnt]['type'] 	= newType;
						qObj[qCnt]['text'] 	= $(tmpTxt).val();
						qObj[qCnt]['req']  	= reqVal;
						qObj[qCnt]['data'] 	= answers;
						qCnt++;
					} else {
						qObj[editnum]['type'] 	= newType;
						qObj[editnum]['text'] 	= $(tmpTxt).val();
						qObj[editnum]['req']  	= reqVal;
						qObj[editnum]['data'] 	= answers;
					}
					
					writeQuestion(false);
					return "good";
				} else if (!cntGood) {
					return empty;
				} else if (!qGood) {
					return "questionText";
				}
				
			break;
			
			case "date":			
			case "text":	
				var tmpTxt = "#questionText";
				var tmpReq = "#yesNoRadio";	
				var reqVal = $(tmpReq + " :radio:checked").val();
	
				if(!questionTextCheck(tmpTxt, edit)){
					return "questionText";
				} else {
					if(!edit){
						qObj[qCnt] = { };
						qObj[qCnt]['type']	  = newType;
						qObj[qCnt]['text'] 	  = $(tmpTxt).val();
						qObj[qCnt]['req']  	  = reqVal;
						qObj[qCnt]['data'] 	  = (newType == "text" ? $("#numberOfRows").val() : ((newType == "date") ? $("#typePicker").val() : false));
						qCnt++;				
					} else {
						qObj[editnum]['type'] 	= newType;
						qObj[editnum]['text'] 	= $(tmpTxt).val();
						qObj[editnum]['req']  	= reqVal;
						qObj[editnum]['data'] 	= answers;
					}
					
					writeQuestion(false);
					return "good";
				}				
			break;
			
			case "scale":
				var tmpTxt = "#scaleQuestionText";
				var tmpReq = "#yesNoRadioS";
				var reqVal = $(tmpReq + " :radio:checked").val();
	
				if(!questionTextCheck(tmpTxt, edit)){
					return "questionText";
				} else {
					if(scaleOptions == null){
						return "scaleOptions";
					} else {										
						if(!edit){
							qObj[qCnt] = { };
							qObj[qCnt]['type']	  = newType;
							qObj[qCnt]['text'] 	  = $(tmpTxt).val();
							qObj[qCnt]['req']  	  = reqVal;
							qObj[qCnt]['data']    = scaleOptions;
							qCnt++;
						} else {
							qObj[editnum]['type'] 	= newType;
							qObj[editnum]['text'] 	= $(tmpTxt).val();
							qObj[editnum]['req']  	= reqVal;
							qObj[editnum]['data'] 	= answers;
						}
						
						writeQuestion(false);
						return "good";
					}
				}
				
				return "unknown";
				
			break;
		}
	}

}

function reloadSurvey(loaded, data){
	// Load data from temp table and push to qObj, then go to createQuestion()
	if(!loaded){
		showMessage("Reloading from cache...", "notice", null, null);
		fetchData("surveyHandler", true, "loadTempSurvey", null);
	} else {
		qObj = null;
		qObj = data['questions'];
		if(qObj != null){
			createQuestion();
		}
		
		if(data['enddate'] != -1){
			$("#surveyEndDate").val(data['enddate']);
		}
		
		if(data['name'] != ""){
			$("#surveyName").val(data['name']);
		}
		
		if(data['startdate'] != -1){
			$("#surveyStartDate").val(data['startdate']);
		}
		
		if(data['description'] != ""){
			$("#surveyDescription").val(data['description']);
		}
		
		$().toastmessage('removeToast', toasty);
	}	
}

function resetRadio(letter){
	$("#yesNoRadio" + letter).val("0");
	$("#yesNoRadio" + letter + " :radio").each(function(){
		if($(this).attr("id") != "undefined"){
			if($(this).attr("checked") != "undefined"){
				$(this).removeAttr("checked");
			}
			
			if($(this).attr("id").substring(0,2) == "no"){
				$(this).attr("checked", "checked");
			}
		}
	});
}

function surveyComplete(resultset){
	switch(resultset){
		case "json-failed":
			var sujFailed = $().toastmessage('showToast', {
				text: 'Failed - Broken JSON Data.',
				position: 'middle-center',
				sticky: false,
				type: 'error',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', sujFailed);
				}	
			});
		break;
		
		case "no-data":
			var sundFailed = $().toastmessage('showToast', {
				text: 'Failed - No Data Received.',
				position: 'middle-center',
				sticky: false,
				type: 'error',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', sundFailed);
				}	
			});
		break;
		
		case "tmp-saved":
			var sutSaved = $().toastmessage('showToast', {
				text: 'Saved...',
				position: 'middle-center',
				sticky: false,
				type: 'success',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', sutSaved);
				}	
			});
		break;
		
		case "final-save":
			var sufSaved = $().toastmessage('showToast', {
				text: 'Survey Saved Successfully.',
				position: 'middle-center',
				sticky: false,
				type: 'success',
				ineffectDuration: 500,
				stayTime: 1000,
				close: function(){
					$().toastmessage('removeToast', sufSaved);
				}	
			});
		break;
	} 
}

function updateScaleOption(option, value){  
	if(scaleOptions == null){
		scaleOptions = {};
		scaleOptions['min'] = 0;
		scaleOptions['max'] = 0;
		scaleOptions['int'] = 0;
		scaleOptions['sta'] = 0;	
	}	
	
	if(typeof(scaleOptions[option]) != "undefined"){
		if(validScaleValue(value)){
			scaleOptions[option] = value;
			return true;	
		}
	} 
	
	return false;
}

function validScaleValue(value){
	if(typeof(value) != "undefined"){
		var iVal = parseInt(value);
		if(!isNaN(iVal)){
			return true;
		} 
	}
	
	return false;
}

function writeQuestion(finalWrite){
	// Write the question to the temp DB table until finalWrite, then write to new survey.
	var data     = { };
	var result   = null;
	data['user']  = currentUser;
	data['qdata'] = qObj;
	data['name']  = $("#surveyName").val();
	data['desc']  = $("#surveyDescription").val();
	data['sdate'] = $("#surveyStartDate").datetimepicker('getDate');
	data['edate']   = $("#surveyEndDate").datetimepicker('getDate');
	
	if(finalWrite){
		result = fetchData("surveyHandler", true, "surveyFullSave", data);
	} else {
		result = fetchData("surveyHandler", true, "surveyQuickSave", data);
	}
}
