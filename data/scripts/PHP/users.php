<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	if(isset($_GET)){
		extract($_GET);
		if(isset($command)){
			$userClass = new userClass();
			$userClass -> callFunction($command, $params);
			
			if(isset($userClass -> result)){
				echo $userClass -> result;
			} else {
				echo 'failed';
			}
		} else {
			echo 'failed-pass';
		}
	} else {
		echo 'failed-user';
	}	
		
	class userClass {
		/*
		 * User Table Structure:
		 * 
		 * xperime1_rr -> users
		 * uid (int 11), username (vc50), password (text - md5), email(vc255)
		 * firstName (vc50), lastName (vc50), age (int 3), joinDate (vc15 unix time),
		 * lastLogin (vc15 - unix time), detailID (int 11), active (int 1), accessLevel (int11)
		 * securityquestion (text)
		 */
		
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
		
		private function createUserGroup($params = null){
			if($params != NULL){
				$p = json_decode(urldecode($params));
				
				$name = $p -> name;
				$users = json_encode($p -> users);
				
				if(isset($name)){
					if(isset($users)){
						$insert = "INSERT INTO usergroups (name, users) VALUES ('" . $name . "', '" . $users ."')";
						$this -> conn = NULL;
						$this -> conn = new Connector();
						$result = $this -> conn -> insert_data($insert);
						if($result){
							$this -> result = "success";
						} else {
							$this -> result = "insert-failed";
						}
					} else {
						$this -> result = "users-notset";
					}
				} else {
					$this -> result = "name-notset";
				}
			} else {
				$this -> result = "params-notset";
			}
			
			return;
		}
		
		private function getUserGroups(){
			$this -> conn = NULL;
			$this -> conn = new Connector();	
			
			$query = "SELECT id, name FROM usergroups";
			$result = $this -> conn -> get_result_array($query);
			if(isset($result)){
				$this -> result = json_encode($result);
			} else {
				$this -> result = "select-failed";
			}
			
			return;
		}

		private function getUserList($params = ""){
			if($params != ""){
				$p = json_decode(stripslashes(urldecode($params)));
				$type = $p -> type;
				
				if(isset($type)){
					$select = "";
					$conn   = new Connector();
					switch($type){
						case "ADMINS":
							// Access Level of 3 or greater
							$select = "SELECT usr.* FROM users AS usr WHERE usr.accessLevel >= 3";
						break;
						
						case "ALL":
							$select = "SELECT usr.* FROM users as usr";
						break;
						
						case "USERS":
							$select = "SELECT usr.* FROM users as usr WHERE usr.accessLevel < 3";
						break;
					}
					
					$result = $conn -> get_result_array($select);
					if(isset($result)){
						$this -> result = json_encode($result);
					} else {
						$this -> result = "SQL for users failed. Query:" . $select;
					}
				} else {
					$this -> result = "Type not set.";
				}
			} else {
				$this -> result = "Parameters not set.";
			}
			
			return;
		}

	}
?>