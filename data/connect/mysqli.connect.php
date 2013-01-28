<?php	
	class Connector{
		function get_connection() 
		{
			$db     = 'xperime1_rr';
			$user 	= 'xperime1_rr';
			$pass 	= 'Niloc1723!';
			
			try
			{
				$mysqli = new mysqli('localhost', $user, $pass, $db);
			}
			catch(Exception $e)
			{
				$error = 'Exception caught: ' . $e -> getMessage() . "\n";
			}
			return $mysqli; 
		}
		
		function get_result_array($query){
			$conn = $this -> get_connection();
			try{
				//$query = mysqli_real_escape_string($conn, $query);
				$stmnt = $conn -> prepare($query);
			} catch(Exception $e){
				$error = 'Exception caught: '. $e -> getMessage() . "\n";
				$result = $error;
			}
			if(!isset($error)){
				$stmnt -> execute();
				$meta = $stmnt -> result_metadata();
				while($field = $meta -> fetch_field()){
					$params[] =&$row[$field->name];
				}
				
				call_user_func_array(array($stmnt, 'bind_result'), $params);
				
				while($stmnt -> fetch()){
					foreach($row as $key => $val){
						$col[$key] = $val;
					}
					$result[] = $col;
				}
			
				$stmnt -> close();
			}
			$conn -> close();
			return $result;
		}
		
		function insert_data($query){
			$conn = $this -> get_connection();		
			$stmnt = $conn -> prepare($query);
			$ret = $stmnt -> execute();
				
			if(isset($ret)){
				return $ret;
			} else {
				return false;
			}
		}
	}
?>