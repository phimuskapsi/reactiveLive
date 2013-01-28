<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	session_start();
	
	if(isset($_GET)){
		extract($_GET);
		if(isset($command)){
			$loaderClass = new loaderClass($command, $params);
			
			if(isset($loaderClass -> result)){
				echo $loaderClass -> result;
			} else {
				echo 'failed';
			}
		} else {
			echo 'failed-command';
		}
	} else {
		echo 'failed-GET';
	}	
		
	class loaderClass {
		private $conn = null;
		public $result = null;
		
		public function __construct($c, $p){
			//die(var_dump($params));
			$this -> callFunction($c, $p);
		}
		 
		public function callFunction($inst, $params = null){
			if(isset($inst)){
				if($params == null){
					call_user_func(array('self',$inst));
				} else {
					call_user_func(array('self',$inst), $params);
				}
			}
		}
		
		private function loadStroopData($p = ""){
			if($p != ""){
				$params = json_decode($p);
				
			}
		}
		
		
	}
	
	
?>