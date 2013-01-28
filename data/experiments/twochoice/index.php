<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	session_start();
	
	$noGET = false;
	$noPOST = false;
	
	if(isset($_POST)){		
		if(isset($_POST['values'])){
			$type   = NULL;
			$rounds = NULL;
			$values = json_decode(stripslashes(urldecode($_POST['values'])));
			
			if(isset($_COOKIE)){
				unset($_COOKIE);
			}
			
			if(isset($values['rounds'])){
				$rounds = $values['rounds'];
			}
			
			if(isset($values['type'])){
				$type   = $values['type'];
			}
			
			if(isset($values['user'])){
				$user	= $values['user'];
			}
			
			if($rounds != NULL && $type != NULL && $user != NULL){
				setcookie("rounds", $rounds, time() + 3600);
				setcookie("type", $type, time() + 3600);
				setcookie("user", $user, time() + 3600);
				setcookie("time", time(), time() + 3600);
				
				header('Location: http://xperimentalcode.com/twoChoice/index.html');
			} 
		}
	} else {
		$noPOST = true;
	}
	
	if(isset($_GET)){
		extract($_GET);
		if($rounds != NULL && $type != NULL && $user != NULL){
			setcookie("rounds", $rounds, time() + 3600);
			setcookie("type", $type, time() + 3600);
			setcookie("user", $user, time() + 3600);
			setcookie("time", time(), time() + 3600);
			
			header('Location: http://xperimentalcode.com/twoChoice/index.html');
		} 
	} else {
		$noGET = true;
	}
	
	if($noGET && $noPOST){
		header('Location: http://reactiveresearch.xperimentalcode.com/');
	}
?>