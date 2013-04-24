<?php
	$filename = "permission.txt";
    $handle = fopen($filename, "r");//读取二进制文件时，需要将第二个参数设置成'rb'
    
    //通过filesize获得文件大小，将整个文件一下子读到一个字符串中
    $contents = fread($handle, filesize ($filename));
    fclose($handle);

    preg_match("/<permission android:name=.*?\n/", $content, $permissionName);
    var_dump($permissionName);
?>