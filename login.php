<?php
$n=$_POST['username'];
$p=$_POST['password'];

$con=mysqli_connect("localhost","root","","nagaarjun"); 
$sql="INSERT INTO login (username,password) VALUES ('$n','$p')";

$r=mysqli_query($con,$sql);
if($r)
{
    echo "USER DETAILS ADDED SUCCESSFULLY";
    header("Location: index.html");}
else
{
    echo "USER DETAILS NOT ADDED";
}
?>
