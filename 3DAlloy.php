<?php
if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( '3DAlloy' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	wfWarn(
		'Deprecated PHP entry point used for 3DAlloy extension. Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the 3DAlloy extension requires MediaWiki 1.25+' );
}
