var selectedcnt = -1;
var selectedusers = null;
var loadeduserarray = null;

function fillUserList(){
	toasty 		= $().toastmessage('showToast', {
					text: 'Loading Users...',
					position: 'middle-center',
					sticky: true,
					type: 'notice',
					closeText: ''
				});
				
	var command = "getUserList"
	var params  = { };
	params['type'] = "ALL";
	fetchData("users", true, command, params);	
}

function initUserManagement(){
	$("button").button();
	
	$(".toolButton").button();
	$(".toolButton").livequery(function() {
		var eleID = $(this).attr("id");

		$(this).click(function() {
			switch(eleID) {
				case "createGroup":
					
				break;
				
				case "showActive":
				
				break;
				
				case "showAdmin":
				
				break;
				
				case "showUsers":
				
				break;
			}

		});
	});
	
	fillUserList();
}

function userListComplete(userarray){
	$().toastmessage('removeToast', toasty);
	
	var ud = $("#userManagementDetail");
	
	if(typeof(userarray) != "undefined"){
		loadeduserarray = userarray;
		
		var row = null;
		var rb  = null;
		var rh  = null;
		
		for(var i=0;i<userarray.length;i++){
			ud.append("<div id='row" + i.toString() + "' class='userRow'></div>");
			row = $("#row" + i.toString());
			row.append("<div class='urowHead ui-widget-header'>" +
							"<div class='urowNum'>" + (i+1).toString() + "</div>" + 
							"<div class='urowUserName'>" + userarray[i]['firstName'] + " " + userarray[i]['lastName'] + 
								"<input type='hidden' id='userid" + i.toString() + "' value='" + userarray[i]['uid'] + "' />" + 
							"</div>" + 
					   "</div>" + 
					   "<div class='urowBody'>" + 
					   		"<div class='urowAccessLevel'>" +
					   			"<label for='user" + i.toString() + "AccessLevel' class='ualLabel'>Access Level: </label>" + 
					   			"<br />" +
					   			"<select id='user" + i.toString() + "AccessLevel' class='ualSelect ui-widget-content'>" + 
					   				"<option>1 - Normal User Level</option>" + 
					   				"<option>2 - Moderator</option>" + 
					   				"<option>3 - Administrator</option>" +
					   			"</select>" +
					   		"</div>" + 
					   		"<div class='urowUserDetailC1'>" + 
					   			"<div class='udetailRow1'>Username: " + userarray[i]['username'] + "</div>" + 
					   			"<div class='udetailRow2'>Last Login: " + userarray[i]['lastLogin'] + "</div>" + 
					   		"</div>" + 
					   		"<div class='urowUserDetailC2'>" + 
					   			"<div class='udetailRow1'>Join Date: " + userarray[i]['joinDate'] + "</div>" + 
					   			"<div class='udetailRow2'>E-mail: " + userarray[i]['email'] + "</div>" + 
					   		"</div>" + 
					   "</div>");
			
			row.click(function(){
				var uid = $("#userid" + $(this).attr("id").substring(3)).val();
				var rid = "#" + $(this).attr("id");	
				if(!$(this).hasClass('dummy-selected')){
					$(this).addClass('dummy-selected');
					$(rid + " .urowHead").removeClass('ui-accordion-header');
					$(rid + " .urowHead").addClass('ui-state-active');
					$(rid + " .urowHead").addClass('ui-accordion-header-active');
					if(selectedusers == null){
						selectedusers = Array();
					}
					
					selectedcnt++;
					selectedusers[selectedcnt] = uid;
				} else {
					$(this).removeClass('dummy-selected');
					$(rid + " .urowHead").removeClass('ui-accordion-header-active');
					$(rid + " .urowHead").removeClass('ui-state-active');
					$(rid + " .urowHead").addClass('ui-widget-header');
					selectedcnt--;
					if($.isArray(selectedusers)){
						var inarr = selectedusers.indexOf(uid);
						if(inarr != -1){
							if(selectedusers.length == 1){
								selectedusers = null;
							} else {
								selectedcnt--;
								selectedusers.splice(inarr,1);
							}
						}
					}
				}
			});
		}
	}
}


