<?php
	$config = include('config.php');

	$url = $config['server_url']."/cvx/rest/auth/v1/access_token?account=".$config['user_id'];

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $url); 

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, 3);
	
	$secure_token = trim(curl_exec($ch));

	curl_close($ch);

	$output = array(
		'server_url' => $config['server_url'],
		'user_id' => $config['user_id'], 
		'secure_token' => $secure_token,
	);

	echo json_encode($output);

?>