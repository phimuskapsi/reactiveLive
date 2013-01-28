var currentUser = "";
var currentAccess = -1;
var currentSession = "";
var inExperiment = false;
var inLogin = true;
var inStroop = false;
var inTCIP = false;
var lastUserTab = -1;
var lastAdminTab = -1;
var savingData = false;
var toasty = null;
var masterReload = false;
var expLoop = 0;

$(function(){
	cookieRefresh();
	/*if(currentUser != ""){
		doLogin();
	} else { } */
	loadLogin();
	
	$(document).keydown(function(e) {
		if(e.which == 13){
			if(!savingData){
				if(inStroop){
					stroopstartmode = false;
					createStroopTask();
				} else if(inLogin){
					loginUser(false);
				} else if(inTCIP){
					// Nothing yet
					//tcipstartmode = false;
					//createTCIPTask();
				}
			}
		} else {
			if(!savingData){
				if(inStroop){
					for(var i=0;i<5;i++){
						if(e.which == stroopsets[stroopset][i]){
							// Then the keypress is in the appropriate row
							if(strooprespint != null){
								//alert("Response Time: " + (resptime * 100 ).toString() + " ms");
								stroopscores['answers'][stroopcurround]['resptime'] = stroopresptime * 100;
								stroopresptime = 0;
								window.clearInterval(strooprespint);	
							}
							
							$("#numberP").hide();
							$("#button" + i).click();	
						}
					}
				} else if(inTCIP){
					if (e.keyCode == 27 && inExperiment) { 
				  		$("#tcipresetModal").dialog("open");
				  	} 
				}
			}			
		}
	});
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function are_cookies_enabled(){
	var cookieEnabled = (navigator.cookieEnabled) ? true : false;

	if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
	{ 
		document.cookie="testcookie";
		cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
	}
	return (cookieEnabled);
}

function cookieRefresh(){
	var cookiejar = document.cookie.split(";");
	for(var i=0;i<cookiejar.length;i++){
		var cookieval = $.trim(cookiejar[i]);
		if(cookieval.indexOf("user") >= 0){
			currentUser = cookieval.substr(5);
		} else if(cookieval.indexOf("access") >= 0){
			currentAccess = parseInt(cookieval.substr(7));
		} else if(cookieval.indexOf("sessionid") >= 0){
			currentSession = cookieval.substr(10);
			if(currentSession != ""){
				masterReload = true;
			}
		} else if(cookieval.indexOf("lastAdminTab") >= 0){
			lastAdminTab = parseInt(cookieval.substr(13));
			if(lastAdminTab != "NaN" && lastAdminTab != -1){
				$("#adminTabs").tabs("option", "selected", lastAdminTab);
			}
		} else if(cookieval.indexOf("lastUserTab") >= 0){
			lastUserTab = parseInt(cookieval.substr(12));
			if(lastUserTab != "NaN" && lastUserTab != -1){
				$("#centerTabs").tabs("option", "selected", lastUserTab);
			}
		}
	}
}

function checkLength( o, n, min, max ) {
	if( max == -1){
		if(o.val().length < min){
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
			min + " and " + max + "." );
			return false;
		} else {
			return true;
		}
	} else {
		if ( o.val().length > max || o.val().length < min ) {
			o.addClass( "ui-state-error" );
			updateTips( "Length of " + n + " must be between " +
				min + " and " + max + "." );
			return false;
		} else {
			return true;
		}
	}
}

function capFirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkRegexp( o, regexp, n ) {
	if ( !( regexp.test( o.val() ) ) ) {
		o.addClass( "ui-state-error" );
		updateTips( n );
		return false;
	} else {
		return true;
	}
}

function fetchData(target, asyn, command, params){
	var result = null;
	var senddata = "";
	var sendtype = "GET";
	
	if(typeof(params) != "undefined"){
		if(typeof(command) != "undefined"){
			senddata = "command=" + command;
			if($.isPlainObject(params)){
				senddata += "&params=" + encodeURIComponent(JSON.stringify(params));
			}
		}
	}
	
	if(typeof(target) == "undefined"){
		return false;
	}
	
	if(command != null){
		if(command.toLowerCase().indexOf("save") >= 0 || command.toLowerCase().indexOf("load") >= 0){
			sendtype = "POST";
		}
	}
	
	$.ajax({
		async : asyn,
		complete: function(jqXHR, textStatus){
			switch(textStatus){
				case "abort":
				
				break;
				
				case "success":
					if(jqXHR.responseText.length > 0){ 
						result = $.trim(jqXHR.responseText);
						
						switch(target){
							case "experimentLoader":
								switch(result){
									case "success":
										showMessage("Successfully saved test results.", "notice", null, null);
										setTimeout(function(){
											savingData = false;
											$().toastmessage('removeToast', toasty);
											expLoop++;
											if(expLoop < 4){
												loadExperimentSet();
											} else {
												expLoop = -1;
												inExperiment = false;
												inTCIP = false;
												var cls = function(){
													logoffUser();
												};
												
												var btns = { "OK" : function(){ $(this).dialog("close"); }};
												
												showMessage("You have successfully completed the protocol. You will now be logged out and taken to the diary page. Thank you!", "notice2", btns, cls);
											}
										}, 500);
									break;
								}
							break;
							
							case "login":
								if(command == "logoffUser"){
									window.location = "//tinyurl.com/factorsdiary/";
								} else if(command == "loginUser"){
									switch(result){
										case "failed-user":
											// User is invalid
											showMessage("Username incorrect, try again!", "error", null, null);
											flagError("#username");
										break;
										
										case "failed-pass":
											// Pass is invalid
											showMessage("Password incorrect, try again!", "error", null, null);
											flagError("#password");
										break;
										
										case "failed-server":
											// Server not reachable - Display message
											showMessage("Remote server unreachable, try again!", "error", null, null);
										break;
										
										case "failed-time":
											showMessage("Could not update login time.", "notice", null, null);
											// Could not update login time after login
											// Not really a huge deal but want it reportable.
										break;
										
										case "failed-unknown":
											// Unknown error - Display message
											showMessage("Unknown error, try again!", "error", null, null);
										break;
										
										case "success":
											doLogin();
										break;
									}
								} else if(command == "createUser"){
									switch(result){
										case "username-exists":
											showMessage("Username already exists, please try and login. If you have forgotten your information, click 'Forgot Account'", "error", null, null);
										break;
										
										case "email-exists":
											showMessage("Email address has already been used, please change it and re-apply.", "error", null, null);
										break;
										
										case "success":
											goLogin = true;
											$("#createAccountModal").dialog("close");
										break;
									}
								} 
							break;
							
							case "protocolHandler":
								if(command.indexOf("Save") > 0){
									protocolsComplete(result);
								} else if(command == "loadTempProtocol"){
									var json = JSON.parse(result);
									if(json != null){
										reloadProtocol(result);
									} else {
										showMessage(result, "error", null, null);
									}
								} else {
									showMessage(result, "error", null, null);
									return;
								}
							break;
							
							case "surveyHandler":
								if(command == "getSurveyList"){
									var json = JSON.parse(result);
									if(json != null){
										showSurveys(json);
										return;
									} else {
										showMessage(result, "error", null, null);
										return;
									}
								} else if(command.indexOf("Save") > 0){
									surveyComplete(result);
								} else if(command == "loadTempSurvey"){
									var json = JSON.parse(result);
									if(json != null){
										reloadSurvey(true, json);
									} else {
										showMessage(result, "error", null, null);
									}
								} else if(command == "fetchSurveyDetail"){
									var json = JSON.parse(result);
									if(json != null){
										loadSurveyDetail(-1, true, json);
									} else {
										showMessage(result, "error", null, null);
									}
								}
							break;
							
							case "users":
								if(command == "getUserList"){
									var json = JSON.parse(result);
									if(json != null){
										userListComplete(json);
										return;
									} else {
										showMessage(result, "error", null, null);
										return;
									}
								} else if(command == "getUserGroups"){
									var json = JSON.parse(result);
									if(json != null){
										showUserGroups(json);
										return;
									} else {
										showMessage(result, "error", null, null);
										return;
									}
								}
								
							break;
							
							case "userPanel":
								if(result.length > 0 && result == "done"){
									gotoPanel(true);
								}
							break;
						}
					} 
				break;
			}
		},
		data : senddata,
		type : sendtype,
		error: function(jqXHR, textStatus, errorThrown){
			showMessage(errorThrown, "error", null, null);
		},
		url: "//reactiveresearch.xperimentalcode.com/data/scripts/PHP/" + target + ".php"
	});
}

function showMessage(message, icon, btns, clsFunc, fade) {
	if(typeof(fade) == "undefined"){
		var fade = false;
	}
	$("#messageModal").empty();
	
	if ( typeof (message) != "undefined") {
		if ( typeof (icon) != "undefined") {
			var tmpicon = icon;
			if(icon == "notice2"){
				tmpicon = "notice";
			}
			$("#messageModal").append("<div class='messageIcon'><img src='../../../data/scripts/JS/toast/resources/images/" + tmpicon + ".png' width='24px' height='24px' alt='Question?' /></div>");
			$("#messageModal").append("<div class='messageMsg'><p>" + message + "</p></div>");
		}

		if(icon != "error" && icon != "notice"){		
			$("#messageModal").dialog({
				autoOpen : true,
				buttons : ( typeof (btns) != "undefined") ? btns : null,
				modal : true,
				close : ( typeof (clsFunc) != "undefined") ? clsFunc : function() {
					$("#messageModal").empty();
					$("#messageModal").dialog("destroy");
				},
				height: 200
			});
		} else {
			toasty = 	$().toastmessage('showToast', {
							text: message,
							position: 'middle-center',
							sticky: (fade == true ? false : true),
							stayTime: 500,
							type: icon,
							ineffectDuration: 500,
							close: function(){
								$().toastmessage('removeToast', toasty);
							}
						});
			
			
		}
	}
}

function updateTips( t ) {
	tips
		.text( t )
		.addClass( "ui-state-highlight" );
	setTimeout(function() {
		tips.removeClass( "ui-state-highlight", 1500 );
	}, 500 );
}

function writeLastTabs(tabtype, tabindex){
	if(typeof(tabtype) != "undefined"){
		var params = { };
		
		if(tabtype == "admin"){
			lastAdminTab = tabindex;
			params['lastAdminTab'] = tabindex;
		} else if(tabtype == "user"){
			lastUserTab = tabindex;
			params['lastUserTab'] = tabindex;
		}
				
		fetchData("login", true, "saveExtraInfo", params);
	}
}
