<?php
/**
 *
 * Handler for stl files.
 *
 *
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */
 global $wg3DAlloy;
 $wg3DAlloy["file"]='';
 if (!isset($wg3DAlloy["width"]   )) $wg3DAlloy["width"]    = 300           ;
 if (!isset($wg3DAlloy["height"]  )) $wg3DAlloy["height"]   = 300           ;
 if (!isset($wg3DAlloy["color"]   )) $wg3DAlloy["color"]    = '0xff00ff'    ;
 if (!isset($wg3DAlloy["opacity"] )) $wg3DAlloy["opacity"]  = 0.8           ;
 if (!isset($wg3DAlloy["norotate"])) $wg3DAlloy["norotate"] = false         ;
 if (!isset($wg3DAlloy["scale"]   )) $wg3DAlloy["scale"]    = 100           ;
 if (!isset($wg3DAlloy["z"]       )) $wg3DAlloy["z"]        = 75            ;
 if (!isset($wg3DAlloy["style"]   )) $wg3DAlloy["style"]    = ''            ;
 $wg3DAlloy["class"] = '3d-container'. (isset($wg3DAlloy["class"]) ? ' '.$wg3DAlloy["class"] : '') ;

 class ThreeDimentionAlloy extends ImageHandler {
	public static function onBeforePageDisplay ( OutputPage $out, $skin){
	    global $wg3DAlloy;

  		if (strpos($out->getHTML(),'class="'.$wg3DAlloy["class"]) !== false){
  			$out->addModules('ext.3DAlloy');
  		}
		}

	static public function onParserFirstCallInit( Parser &$parser ) {
  		$parser->setFunctionHook( "3d", "ThreeDimentionAlloy::parse3DFunc" );
  		$parser->setHook('3d', "ThreeDimentionAlloy::parse3DTag");
  		return true;
	}

	static public function onParserMakeImageParams($title, $file, &$params, Parser $parser ) {
	    global $wg3DAlloy;

	    switch ($file->getMimeType() ) {
			case 'application/json':
      case 'application/obj':
      case 'application/stl':

	            $tmp = [];
	            parse_str(str_replace(array(','), array('&'), $params["frame"]["caption"]), $tmp);
	            foreach($wg3DAlloy as $param => $value) {
	                if (isset($tmp[$param])) $params["handler"][$param] = $tmp[$param];
	            }

	    	      return false;
		  }

		  return true;
	}

	static public function parse3DTag($input, array $args, Parser $parser, PPFrame $frame ) {
	    global $wg3DAlloy;

      $params = array_merge($wg3DAlloy, $args);
      $params["style"] = $wg3DAlloy["style"].' '.$params["style"];
      $params["class"] = $wg3DAlloy["class"].' '.$params["class"];
      $params["file"]   = (!isset($params["file"])) ? $input : 'ERROR';

      $f = wfFindFile( $params["file"] );
  		if ($f) {
  		    $params["file"] = $f->getFullUrl();
  		}

  		$elem = Html::element('canvas', $params, $input);

  		return [ $elem, 'noParse'=> true, 'isHTML'=> 'true' ];
	}

	static public function parse3DFunc( Parser &$parser ) {
	    global $wg3DAlloy;
  		$args = func_get_args();
  		array_shift( $args );

      $f = wfFindFile( $args[0] );
      if ($f) {
          $args[0] = ($f->getFullUrl());
      }

      $i=0;
  		foreach($wg3DAlloy as $param=>$value) {
  		    if (isset($args[$i])) {
  		        $args[$i] = $param."=".$args[$i];
  		    } else {
  		        $args[$i] = $param."=".$value;
  		    }
  		    $i++;
      }

  		$params = [];
  		parse_str( implode( "&", $args ), $params );
  		$params = array_merge($wg3DAlloy, $params );
      $params["style"] = $wg3DAlloy["style"].' '.$params["style"];
      $params["class"] = $wg3DAlloy["class"].' '.$params["class"];

  		$elem = Html::element('canvas', $params, $params["file"]);

  		return [ $elem, 'noParse'=> true, 'isHTML'=> 'true' ];
	}

	public static function onImageOpenShowImageInlineBefore( $imagepage, $out ){
  		global $wg3DAlloy;
  		switch ( $imagepage->getDisplayedFile()->getMimeType() ) {
  			case 'application/json':
        case 'application/obj':
        case 'application/stl':

  			    $params=$wg3DAlloy;
  			    $params["file"] = $imagepage->getDisplayedFile()->getFullURL();

  			    $out->addHtml(Html::element('canvas', $params, $params["file"]));
  			    $out->addModules('ext.3DAlloy');
  			default:
  			    break;
  		}
	}

    public static function onImageBeforeProduceHTML (&$dummy, &$title, &$file, &$frameParams, &$handlerParams, &$time, &$res) {
        global $wg3DAlloy;

        switch ($file->getMimeType() ) {
          case 'application/json':
          case 'application/obj':
          case 'application/stl':

            $params=array_merge($wg3DAlloy, $handlerParams);
            $params["file"] = $file->getFullUrl();
            $res = Html::element('canvas', $params, $params["file"]);
            return false;
		    }

		    return true;
    }

	function doTransform( $image, $dstPath, $dstUrl, $params, $flags = 0){
    //is compulsory for ImageHandler
	}
}
