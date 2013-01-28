var tips 		= $(".validateTips");
var errorCount 	= 0;
var throwError 	= false;
var goLogin		= false;




function checkInputFields(){
	$(".errorIcon").remove();
	$("#fields > .labelInputBox").children().each(function(){
		if($(this).is(":input")){
			if($(this).val() == ""){
				errorCount++;
				flagError(this);
				throwError = true;
			}
		}
	});
	
	if(!throwError){
		loginUser(false);
	}
}

function createAccount(){
	// Create the new account login modal
	// All accounts must be approved, or active = 1
	if($("#createAccountModal").length > 0){
		$("#createAccountModal").remove();
	}
	
	$("#mainContainer").after("<div id='createAccountModal'></div>");
	$("#createAccountModal").load('../../../data/pieces/createAccountModal.html');
	
	$("#createAccountModal").dialog({
		autoOpen: true,
		height: 650,
		width: 600,
		modal: true,
		buttons: {
			"Create an Account" : function(){
				var bValid = true;
				$("#createAccountModal > :input").each(function(){
					$(this).removeClass("ui-state-error");
					
					switch($(this).attr("id")){
						case "unameModal":
							bValid = bValid && checkLength($(this), 6, 16);
							bValid = bValid && checkRegexp($(this), /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter.");
						break;
						
						case "passModal":
							bValid = bValid && checkLength($(this), 4, 20);
							bValid = bValid && checkRegexp($(this), /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9");
						break;
						
						case "passModal2":
							bValid = bValid && checkLength($(this), 4, 20);
							bValid = bValid && ($(this).val() == $("#passModal").val()); 
						break;
						
						case "emailModal":
							bValid = bValid && checkLength($(this), 8, -1);
							bValid = bValid && checkRegexp($(this), /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. username@reactiveresearch.com");
						break;
						
						case "lnameModal":
							bValid = bValid && checkLength($(this), 2, -1);
							bValid = bValid && checkRegexp($(this), /^([a-zA-Z])+$/, "Password field only allow : a-z (A-Z)");
						break;
					}
				});	
				
				if(bValid){
					// Validated, send to server
					var params = { };
					var paramString = "";
				
					// Then authenticate user information
					var result = null;
					
					params['age'] = $.trim($("#ageModal").val()).length > 0 ? $("#ageModal").val() : "0";
					params['uid'] = $("#unameModal").val();
					params['pass'] = $("#passModal").val();
					params['email'] = $("#emailModal").val();
					params['lastName'] = $("#lnameModal").val();
					params['firstName'] = $.trim($("#fnameModal").val()).length > 0 ? $("#fnameModal").val() : "n/a";
					
					fetchData("login", true, "createUser", params);
				}
			},
			Cancel : function(){
				$(this).dialog("close");
			}
		},
		close: function(){
			$("#createAccountModal > :input").each(function(){
				$(this).removeClass("ui-state-error");
			});
			
			if(goLogin){
				loginUser(true);
			}
		}
	});
}

function doLogin(){
	inLogin = false;
	cookieRefresh();
	//showMessage("Loading Stroop Task...", "notice", null, null, true);
	var params = { };
	
	loadExperimentSet();
	//showMessage("Loading User Panel...", "notice", null, null);
	//fetchData("userPanel", true, null, null);
}

function flagError(ele){
	$(ele).parent().after("<div class='errorIcon' name='error" + errorCount.toString() + "'></div>");
	return true;
}

function gotoPanel(go){
	if(go){
		if(currentAccess >= 3){
			$.get('../../../data/pieces/userPanelBodyAdmin.html', function(data){
				$("#centerContainer").empty().append(data);
			});
		} else {
			$.get('../../../data/pieces/userPanelBody.html', function(data){
				$("#centerContainer").empty().append(data);
			});
		}
		$().toastmessage('removeToast', toasty);
	} else {
		showMessage("Cannot load resource, try again.", "error", null, null);
	}
}

function loadLogin(){	
	$.get('../../../data/pieces/indexContent.html', function(data){
		$("#centerContainer").empty().append(data);
		
		if(!are_cookies_enabled()){
			alert("Cookies must be enabled in order to continue.");
			$(":button").attr("disabled","disabled");
		}
		
		$(":button").button();
		
		$(":input").keydown(function(){
			if($(this).val().length >= 0){
				if($(this).attr('id') == 'username'){
					if($("div[name='error1']").length >= 0){
						$("div[name='error1']").remove();
					}
				} else {
					if($("div[name='error2']").length >= 0){
						$("div[name='error2']").remove();
					}
				}
			}
		});
		
		$("#createAccount").livequery("click", function(){
			createAccount();
		});
		
		// Handle when the button is clicked.
		$("#createAccount").livequery("click", function(){
			checkInputFields();
		});
		
		$("#loginSubmit").livequery("click", function(){
			loginUser(false);
		});
	});
}

function loginUser(createdAcct){
	var params = { };
	var paramString = "";

	// Then authenticate user information
	var result = null;
	if(!createdAcct){
		params['uid'] = $("#username").val();
		params['pass'] = $("#password").val();
		params['actionlogin'] = 1;
		fetchData("login", true, "loginUser", params);
	} else {
		doLogin();
	}
}

function logoffUser(){
	fetchData("login", true, "logoffUser", null);
}