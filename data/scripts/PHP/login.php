<?php
	require_once('/home3/xperime1/public_html/reactiveResearch/data/connect/mysqli.connect.php');
	
	if(isset($_GET)){
		extract($_GET);
		if(isset($command)){
			$loginClass = new loginClass();
			$loginClass -> callFunction($command, $params);
			
			if(isset($loginClass -> result)){
				echo $loginClass -> result;
			} else {
				echo 'failed';
			}
		} else {
			echo 'failed-pass';
		}
	} else {
		echo 'failed-user';
	}	
		
	class loginClass {
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

		private function createUser($paramString = ""){
			$this -> conn = new Connector();
			$params = json_decode(stripslashes(urldecode($paramString)));
			
			$dupeCheck = "SELECT * FROM users WHERE username = '" . $params -> uid . "'";
			$dupeRes   = $this -> conn -> get_result_array($dupeCheck);
			if(isset($dupeRes)){
				if(count($dupeRes) > 0 && is_array($dupeRes)){
					$this -> result = "username-exists";
					return false;
				}
			}
			
			$this -> conn = null;
			$this -> conn = new Connector();
			$dupeCheck2 = "SELECT * FROM users WHERE email = '" . $params -> email . "'";
			$dupeRes2   = $this -> conn -> get_result_array($dupeCheck2);
			if(isset($dupeRes2)){
				if(count($dupeRes2) > 0 && is_array($dupeRes2)){
					$this -> result = "email-exists";
					return false;
				}
			}
			
			$this -> conn = null;
			$this -> conn = new Connector();
			$query  = "INSERT INTO users (username, password, email, firstName, lastName, age, joinDate, lastLogin, detailID, active, accessLevel) VALUES (";
			
			// joinDate, lastLogin, active are set by this script
			// detailID -> essentially a 'profile' id for another table called profile_data (not yet in existence so for now 0)
			$joinDate  = time();
			$lastLogin = time(); 
			$pass 	   = md5($params -> pass);		
			
			// Anti-Injection protection
			$params -> uid = stripslashes($params -> uid);
			$params -> pass = $params -> pass;
			$params -> email = stripslashes($params -> email);
			$params -> age = stripslashes($params -> age);
			$params -> firstName = stripslashes($params -> firstName);
			$params -> lastName = stripslashes($params -> lastName);
					
			$values = 	"'" . $params -> uid . "','" . $pass . "','" . $params -> email . "','" . $params -> firstName . 
						"','" . $params -> lastName . "','" . $params -> age . "', " . $joinDate . "," . $lastLogin . ", 0, 0, 0)";
						
			$result = $this -> conn -> insert_data($query . $values);
			if(isset($result)){
				if($result){
					$this -> result = "success";
				}
			} else {
				$this -> result = "failed-insert";
			}
			
			$this -> updateSession($params -> uid, 0, $params -> lastName);
			
			return isset($this -> result);
		}
		
		private function loginUser($paramString = ""){
			$this -> conn = new Connector();
			
			$params = json_decode(stripslashes(urldecode($paramString)));	
			
			//die(var_dump($params));		
			$pass = md5($params -> pass);
			//die(var_dump($pass));					
			// Anti-Injection protection is coming...

			if(isset($params -> uid) && isset($params -> pass)){
				$query = "SELECT * FROM users WHERE username = '" . $params -> uid ."'";
				$result = $this -> conn -> get_result_array($query);
				
				//die("Hit!" . var_dump($result));
				if(isset($result)){
					if($result == false){
						$this -> result = "failed-user";
					} else {
						if($pass == $result[0]['password']){
							$this -> result = "success";
							$this -> updateSession($params -> uid, $result[0]['accessLevel'], $result[0]['lastName']);
							
							$updateTime = "UPDATE users SET lastLogin = " . time() . " WHERE username = '" . $params -> uid . "'";
							$resultTime = $this -> conn -> insert_data($updateTime); 
							
							if(isset($resultTime)){
								if($resultTime == false){
									$this -> result = "failed-time";
								}
							}
						} else {
							$this -> result = "failed-pass";
						}
					}
				} else {
					$this -> result = "failed-user";
				}
			}
		}
		
		private function logoffUser(){
			if(isset($_COOKIE)){
				setcookie("reactiveresearch", "", time()-3600, "/", ".xperimentalcode.com");
				setcookie("user", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("access", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("lname", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("PHPSESSID", "", time() - 3600, "/", ".xperimentalcode.com");
			}
			
			return true;
		}
		
		private function saveExtraInfo($params = ""){
			if($params != ""){
				$p = json_decode($params);
				
				if($p != false && $p != NULL){
					foreach($p as $key => $val){
						switch($key){
							case "user":
								if(isset($_COOKIE['user'])){
									setcookie("user", "", time() - 3600, "/", ".xperimentalcode.com");
								}
								
								setcookie("user", $val , time() - 3600, "/", ".xperimentalcode.com");
							break;
								
							case "access":
								if(isset($_COOKIE['access'])){
									setcookie("access", "", time() - 3600, "/", ".xperimentalcode.com");
								}
								
								setcookie("access", $val , time() - 3600, "/", ".xperimentalcode.com");
							break;
								
							case "lname":
								if(isset($_COOKIE['lname'])){
									setcookie("lname", "", time() - 3600, "/", ".xperimentalcode.com");
								}
								
								setcookie("lname", $val , time() - 3600, "/", ".xperimentalcode.com");
							break;
								
							case "lastAdminTab":
								if(isset($_COOKIE['lastAdminTab'])){
									setcookie("lastAdminTab", "", time() - 3600, "/", ".xperimentalcode.com");
								}
								
								setcookie("lastAdminTab", $val , time() - 3600, "/", ".xperimentalcode.com");
							break;
							
							case "lastUserTab":
								if(isset($_COOKIE['lastUserTab'])){
									setcookie("lastUserTab", "", time() - 3600, "/", ".xperimentalcode.com");
								}
								
								setcookie("lastUserTab", $val , time() - 3600, "/", ".xperimentalcode.com");
							break;
						}
					}
				}
			}
			
			$this -> result = "success";
			return;
		}

		private function updateSession($username, $accesslvl, $lastname){
			
			if(isset($_COOKIE)){
				setcookie("reactiveresearch", "", time()-3600, "/", ".xperimentalcode.com");
				setcookie("user", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("access", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("lname", "", time() - 3600, "/", ".xperimentalcode.com");
				setcookie("sessionid", "", time() - 3600, "/", ".xperimentalcode.com");
			}
			
			setcookie("reactiveresearch", "on", time() + 3600, "/", ".xperimentalcode.com");
			setcookie("user", $username, time() + 3600, "/", ".xperimentalcode.com");
			setcookie("access", $accesslvl, time() + 3600, "/", ".xperimentalcode.com");
			setcookie("lname", $lastname, time() + 3600, "/", ".xperimentalcode.com");
			setcookie("sessionid", uniqid("rr_", true), time() + 3600, "/", ".xperimentalcode.com");
			//die(var_dump(session_get_cookie_params()));
			return true;
		}
	}
?>