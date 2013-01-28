<?php
if ($_GET['randomId'] != "_YZvdRoHx6RWyw7gbUFsTZTkPYDhz8Xc3qSpMcI2QqHuElmI7oBSagY7HZvx9gUr") {
    echo "Access Denied";
    exit();
}

// display the HTML code:
echo stripslashes($_POST['wproPreviewHTML']);

?>  
