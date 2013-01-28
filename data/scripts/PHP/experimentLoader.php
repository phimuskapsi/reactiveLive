<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	if(isset($_GET)){
		extract($_GET);
		if(isset($command)){
			$exploaderClass = new exploaderClass();
			$exploaderClass -> callFunction($command, $params);
			
			if(isset($exploaderClass -> result)){
				echo $exploaderClass -> result;
			} else {
				echo 'failed';
			}
		} else {
			echo 'failed-pass';
		}
	} else {
		echo 'failed-user';
	}	
		
	class exploaderClass {
		private $conn = null;
		public $result = null;
		
		public function __construct(){
			//die(var_dump($params));

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
		
		private function sendTestData($params = null){
			if($params != null){
				$p = json_decode($params);
				
				if(isset($p -> scoreobj)){
					$valObj = json_encode($p -> scoreobj);
				}
				
				if(isset($p -> duration)){
					$duration = $p -> duration;
				}
				
				if(isset($p -> user)){
					$user = $p -> user;
				}
				
				if(isset($p -> testtype)){
					$type = $p -> testtype;
				}
							
				$session = $_COOKIE['sessionid'];
				
				$query = "INSERT INTO testresults (sessionid, user, testtype, testduration, testvalues)
						  VALUES ('" . $session . "', '" . $user . "', '" . $type . "', " . $duration . ", '" . $valObj . "')";
				
				$this -> conn = NULL;
				$this -> conn = new Connector();
				
				if($this -> conn -> insert_data($query)){
					$this -> result = "success";
				} else {
					$this -> result = "failed-insert";
				}
			} else {
				$this -> result = "failed-no-params";
			}
		}
	}
?>