<html>
<head>
<title>PHP File</title>
</head>
<body>
<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<input type="text" name="fname">
<input type="submit" name="submit" value="Submit">
</form>
<?php
if(isset($_POST['submit'])){
$name = $_POST['fname'];
$host = "localhost";
$user = "root";
$pass = "karnamali";
$db = "sys";
$conn = mysqli_connect($host,$user,$pass,$db);
    if(!$conn){
    die("Connection failed: " . mysqli_connect_error());
    }
    $sql = "INSERT INTO `sys`.`students` (`name`) VALUES ('$name')";
    if(mysqli_query($conn,$sql)){
    echo "Records inserted successfully.";
    }
    else{
    echo "ERROR: Could not able to execute $sql. " . mysqli_error($conn);
    }
mysqli_close($conn);
}
?>
</body>
</html>

