<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	session_start();
	
	if(isset($_GET)){
		extract($_GET);
		if(isset($command)){
			$protocolClass = new protocolClass($command, $params);
			
			if(isset($protocolClass -> result)){
				echo $protocolClass -> result;
			} else {
				echo 'failed';
			}
		} else {
			echo 'failed-command';
		}
	} else {
		echo 'failed-GET';
	}	
		
	class protocolClass {
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
		
		private function createProtocolDisplay($params = ""){
			if($params != ""){
				
			}
		}
		
		private function createProtocolList($params = ""){
			if($params != ""){
				
			}
		}
		
		private function protocolFullSave($params = ""){
			if($params != ""){
				$p = json_decode($params);
				$name 	= $p -> name;
				$desc 	= $p -> desc;
				$sdate 	= $p -> sdate;
				$edate 	= $p -> edate;
				$pdata 	= json_encode($p -> pdata);
				$user  	= $p -> user;
				
				if($name != ""){
					if($pdata != ""){
						if($user != ""){
							$insert = "	 INSERT INTO protocols (name, description, created_by, created_on, lastedit, startdate, enddate, data) 
														VALUES ('" . $name . "', '" . $desc . "', '" . $user . "', '" . time() . "', '" . time() . "', 
																'" . $sdate . "', '" . $edate . "', '" . $pdata . "')";
																
							$this -> conn = NULL;
							$this -> conn = new Connector();
							$result = $this -> conn -> insert_data($insert);
							if($result){
								$this -> result = "success";
							} else {
								$this -> result = "insert-failed";
							}
						} else {
							$this -> result = "user-notset";
						}
					} else {
						$this -> result = "protocoldata-notset";
					}
				} else {
					$this -> result = "name-notset";
				}
			} else {
				$this -> result = "params-notset";
			}
		}

		private function getProtocolList(){
			$query = "SELECT id, name FROM protocols";
			
			// Add End Date restriction ultimately and start date
			$this -> conn = NULL;
			$this -> conn = new Connector();
			$result = $this -> conn -> get_result_array($query);
			
			if(isset($result)){
				$this -> result = json_encode($result);
			} else {
				$this -> result = "nodata";
			}
		}
		
		private function loadTempProtocol(){
			if(!isset($_SESSION['quickSaveID'])){
				// No need to load, nothing has been saved this session
				$this -> result = "no-data-session";
				return;
			} else {
				$uid = $_SESSION['quickSaveID'];
				$query = "	SELECT * FROM protocols_temp WHERE id = '" . $uid . "'";
				
				$this -> conn = NULL;
				$this -> conn = new Connector();
				$result = $this -> conn -> get_result_array($query);
				if(isset($result)){
					$this -> result = json_encode($result);
				} else {
					$this -> result = "no-data-saved";
				}
			}
		}
		
		private function protocolQuickSave($params = ""){
			if($params != ""){
				$p = json_decode($params);
				$name 	= (isset($p -> name) ? $p -> name : "");
				$desc 	= (isset($p -> desc) ? $p -> desc : "");
				$sdate 	= (isset($p -> sdate) ? $p -> sdate : "");
				$edate 	= (isset($p -> edate) ? $p -> edate : "");
				$pdata 	= (isset($p -> pdata) ? json_encode($p -> pdata) : "");
				$user  	= (isset($p -> user) ? $p -> user : "");
																
				$this -> conn = NULL;
				$this -> conn = new Connector();
				
				if(!isset($_SESSION['quickSaveID'])){
					$_SESSION['quickSaveID'] = -1;
					$uid = uniqid("rr_", true);
					$query = "	INSERT INTO protocols_temp(id, name, description, created_by, created_on, lastedit, startdate, enddate, data)
								VALUES ('" . $name . "', '" . $desc . "', '" . $user . "', '" . time() . "', '" . time() . "', 
							 		 '" . $sdate . "', '" . $edate . "', '" . $pdata . "')";
					
					//throw new Exception(var_dump($query));
					
					$result = $this -> conn -> insert_data($query);
					
					//throw new Exception($result);
					if($result == true){
						$_SESSION['quickSaveID'] = $uid;
						$this -> result = "tmp-saved";
					} else {
						$this -> result = "insert-failed";
					}
				} else {
					$uid = $_SESSION['quickSaveID'];
					$start = "	UPDATE protocols_temp";
					$set   = " 	SET data = '" . $pdata . "', lastedit = " . time();
					$where = "	WHERE id = '" . $uid . "'";
					
					if($sdate != ""){
						$set .= ", startdate = '" . $sdate . "'";
					}
					
					if($edate != ""){
						$set .= ", enddaate = '" . $edate . "'";
					}
					
					if($name != ""){
						$set .= ", name = '" . $name . "'";
					}
					
					if($desc != ""){
						$set .= ", description = '" . $desc . "'";
					}
					
					if($user != ""){
						$set .= ", user ='" . $user . "'";
					}
					
					$query  = $start . $set . $where;
					$result = $this -> conn -> insert_data($query);
					if($result == true){
						$this -> result = "tmp-saved";
					} else {
						$this -> result = "update-failed";
					}
				}
				
				return;
				
			}
		}
	}
	
	
?>