$(function(){
	$("#centerTabs").tabs({
		load: function(event, ui){
			//alert($("#centerTabs").tabs('option', 'selected'));
			writeLastTabs("user", ui.index);
		}
	});
	
	if(currentAccess < 3){
		// Load all the user detail for a survey and so on
		
	}
});