<?php
    //die(var_dump(session_get_cookie_params()));
	//die(var_dump($_COOKIE));

	if(!isset($_COOKIE)){
		header('Location: http://reactiveresearch.xperimentalcode.com');
	} else {
		if(isset($_COOKIE['user']) && isset($_COOKIE['access']) && isset($_COOKIE['lname'])){			 
			echo "done";
		} else {
			header('Location: http://reactiveresearch.xperimentalcode.com');
		}
	}
?>