<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	session_start();
	
	if(isset($_GET)){
		extract($_GET);
	} else {
		echo 'GET-Empty';
	}
	
	if(isset($_POST)){
		extract($_POST);	
	} else {
		echo 'POST-Empty';
	}
	
	if(isset($command)){
		$surveyClass = new surveyClass($command, $params);
		
		if(isset($surveyClass -> result)){
			echo $surveyClass -> result;
		} else {
			echo 'failed';
		}
	} else {
		echo 'failed-command';
	}

		
	class surveyClass {
		private $conn = NULL;
		public $result = NULL;
		
		public function __construct($c, $p){
			//die(var_dump($params));
			$this -> callFunction($c, $p);
		}
		 
		public function callFunction($inst, $params = NULL){
			if(isset($inst)){
				if($params == NULL){
					call_user_func(array('self',$inst));
				} else {
					call_user_func(array('self',$inst), $params);
				}
			}
		}
		
		private function loadSurveyDetail($params = NULL){
			if($params != NULL){
				$p = json_decode(urldecode($params));
				$id = $p -> sid;
				$query = "	SELECT s.*, u.firstName, u.lastName 
								FROM surveys AS s
								JOIN users AS u ON u.uid = s.creator
						 	WHERE s.id='" . $id . "'";
				
				$this -> conn = NULL;
				$this -> conn = new Connector();
				$result = $this -> conn -> get_result_array($query);
				if(isset($result)){
					// Fields: name, questions, description, startDate, endDate, firstName, lastName
					$qcnt = 0;
					$qobj = json_decode($result[0]['questions']);
					
					if($qobj != NULL){
						$qcnt = count($qobj);
					}
					
					$retArr = array();
					$retArr['qcnt'] = $qcnt;
					$retArr['name'] = $result[0]['name'];
					$retArr['creator'] = ucfirst(strtolower($result[0]['firstName'])) . " " . ucfirst(strtolower($result[0]['lastName']));
					$retArr['startdate'] = ($result[0]['startDate'] == -1) ? "N/A" : $result[0]['startDate'];
					$retArr['enddate'] = ($result[0]['endDate'] == -1) ? "N/A" : $result[0]['endDate'];
					$retArr['description'] = $result[0]['description'];
					$retArr['createdon'] = date("l, F jS", intval($result[0]['createdOn']));
					
					$this -> result = json_encode($retArr);
				} else { 
					$this -> result = "nodata";
				}
			} else {
				$this -> result = "params-notset";
			}
			
			return;
		}
		
		private function surveyFullSave($params = NULL){
			if($params != NULL){
				$p = json_decode($params);
				//$p = $this -> fixObj($p);
				//throw new Exception(var_dump($p));
				$qdata = json_encode($p -> qdata);
				$query = "";
				$name  = $p -> name;
				$desc  = $p -> desc;
				$user  = $p -> user;
				$userid= -1;
				
				//throw new Exception(var_dump($name));
				
				$this -> conn = NULL;
				$this -> conn = new Connector();
				
				$uq	   = "  SELECT uid FROM users WHERE username = '" . $user . "' LIMIT 1";
				
				//throw new Exception(var_dump($uq));
				
				$res   = $this -> conn -> get_result_array($uq);
				
				//throw new Exception(var_dump($res));
				
				if(isset($res)){
					$userid = $res[0]['uid'];
					
					//throw new Exception(var_dump($userid > 0));
					
					if($userid > 0){
						// TO-DO Sort out start/end date logic
						$end = -1;
						$start = -1;
						
						if($p -> startdate != ""){
							$start = strtotime($p -> sdate);
						} 

						if($p -> enddate != ""){
							$end = strtotime($p -> edate);
						}

						$query = "  INSERT INTO surveys (name, description, questions, creator, createdOn, startDate, endDate)
									VALUES ('" . $name . "', '" . $desc . "', '" . $qData . "', '" . $userid . "', " . time() . ", " . $start . ", " . $end . ")";
						
						//throw new Exception(var_dump($query));
								
						$res2  = $this -> conn -> insert_data($query);
						
						//throw new Exception(var_dump($res2));
						
						if(isset($res2)){
							if($res2){
								$this -> result = "final-save";
							} else {
								$this -> result = "insert-failed";
							}
						} else {
							$this -> result = "insert-failed";
						}
					} else {
						$this -> result = "user-failed";
					}
				} else {
					$this -> result = "user-failed";
				}
			} else {
				$this -> result = "no-params";
			}
		}

		private function getSurveyList($params = NULL){
			$this -> conn = NULL;
			$this -> conn = new Connector();
			
			$query = "SELECT id, name FROM surveys";
			$result = $this -> conn -> get_result_array($query);
			if(isset($result)){
				$this -> result = json_encode($result);
			} else {
				$this -> result = "select-failed";
			}
			
			return;
		}
		
		private function loadTempSurvey($params = NULL){
			if(!isset($_SESSION['quickSaveID'])){
				// No need to load, nothing has been saved this session
				$this -> result = "no-data-session";
				return;
			} else {
				$uid = $_SESSION['quickSaveID'];
				$query = "	SELECT * FROM surveys_temp WHERE id = '" . $uid . "'";
				
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
		
		private function surveyQuickSave($params = NULL){
			if($params != NULL){
				$p = json_decode($params);
				//$p = $this -> fixObj($p);
				if($p != false){
					//$qdata = json_encode($p -> qdata);
					$query = "";
					$name 	= (isset($p -> name) ? $p -> name : "");
					$desc 	= (isset($p -> desc) ? $p -> desc : "");
					$sdate 	= (isset($p -> sdate) ? ($p -> sdate != NULL ? $p -> sdate : "") : "");
					$edate 	= (isset($p -> edate) ? ($p -> edate != NULL ? $p -> edate : "") : "");
					$qdata 	= (isset($p -> qdata) ? json_encode($p -> qdata) : "");
					$user  	= (isset($p -> user) ? $p -> user : "");
					
					$this -> conn = NULL;
					$this -> conn = new Connector();
					
					//throw new Exception(var_dump($p));
					//throw new Exception("name: " . $name . PHP_EOL . "desc: " . $desc . PHP_EOL . "sdate :" . $sdate . PHP_EOL . "edate: " . $edate . PHP_EOL . "qdata: " . $qdata . PHP_EOL . " user : " . $user);
					
					if(!isset($_SESSION['quickSaveID'])){
						$uid = uniqid("rr_", true);
						$_SESSION['quickSaveID'] = $uid;
						$query = "	INSERT INTO survey_temp (id, questions, user, lastupdated, name, description, startdate, enddate)
									VALUES ('" . $uid . "', '" . $qdata . "', '" . $user . "'," . time() .
										", '" . $name . "', '" . $desc . "', " . $sdate . ", " . $edate . ")";
						
						//throw new Exception(var_dump($query));
						
						$result = $this -> conn -> insert_data($query);
						
						//throw new Exception($result);
						if($result == true){
							$this -> result = "tmp-saved";
						} else {
							$this -> result = "insert-failed";
						}
					} else {
						
						$uid    = $_SESSION['quickSaveID'];
						$select = "SELECT * FROM survey_temp WHERE id = '" . $uid . "'";
						$sres   = $this -> conn -> get_result_array($select);
						
						if(is_array($sres)){
							$start = "	UPDATE survey_temp";
							$set   = " 	SET questions = '" . $qdata . "', lastupdated = " . time();
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
							
							$query  = $start . $set . $where;
							
							$result = $this -> conn -> insert_data($query);
							if($result == true){
								$this -> result = "tmp-saved";
							} else {
								$this -> result = "update-failed";
							}
						} else {
							unset($_SESSION['quickSaveID']);
							$this -> surveyQuickSave($params);
						}
					}
					return true;
				}
			}

			$this -> result = "no-data";
			return false;
		}
	}

?>