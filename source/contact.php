<?php

// =============== Settings ===============

// Your e-mail address
$to = 'example@example.com';


// ============== E-mail test =============

// Go to your-site.com/contact.php?test to send a testing email
if ( isset($_GET['test']) ) {
	mail($to, 'Message from contact form', 'It\'s working!', 'From: ' . $to . "\r\n");
	die('Testing e-mail has been sent.');
}


// ============= Contact form =============

// Validate e-mail
function isValidEmail( $email ) {
	return preg_match( "/^
		[\d\w\/+!=#|$?%{^&}*`'~-]
		[\d\w\/\.+!=#|$?%{^&}*`'~-]*@
		[A-Z0-9]
		[A-Z0-9.-]{0,61}
		[A-Z0-9]\.
		[A-Z]{2,6}$/ix", $email
	);
}

// Validate input
if ( !empty($_POST['name']) && !empty($_POST['text']) && isValidEmail($_POST['email']) ) {

	// Set e-mail headers
	$headers = 'From: ' . $_POST['name'] . ' <' . $_POST['email'] . '>';
	$headers .= "\r\n" . 'Reply-To: ' . $_POST['email'];

	// Send e-mail
	if ( mail($to, 'Message from contact form', $_POST['text'], $headers) ) {
		die('sent');
	} else {
		die('not_sent');
	}

} else {

	// Invalid input
	die('invalid');

}
