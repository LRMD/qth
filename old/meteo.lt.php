<?php
if (!get_magic_quotes_gpc()){ $_GET[png] = addslashes($_GET[png]); }
$_GET[png] = str_replace(" ", "+", $_GET[png]);
$ch = curl_init("http://www.meteo.lt/dokumentai/operatyvi_inf/radaras/".$_GET[png].".png");	
curl_setopt($ch, CURLOPT_REFERER, "http://www.meteo.lt");      
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);      
header("Content-type: image/png");     
echo curl_exec($ch);
?>