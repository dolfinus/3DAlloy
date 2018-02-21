<?php
 global $wg3DAlloy;
 $wg3DAlloy_ = $wg3DAlloy;
 unset ($wg3DAlloy);

 global $wg3DAlloy;
 $wg3DAlloy        =[];
 $wg3DAlloy["file"]='';
 $wg3DAlloy["width"]    = isset($wg3DAlloy_["width"]   ) ? $wg3DAlloy_["width"]   : 300;
 $wg3DAlloy["height"]   = isset($wg3DAlloy_["height"]  ) ? $wg3DAlloy_["height"]  : 300;
 $wg3DAlloy["color"]    = isset($wg3DAlloy_["color"]   ) ? $wg3DAlloy_["color"]   : '';
 $wg3DAlloy["opacity"]  = isset($wg3DAlloy_["opacity"] ) ? $wg3DAlloy_["opacity"] : '';
 $wg3DAlloy["norotate"] = isset($wg3DAlloy_["norotate"]) ? $wg3DAlloy_["norotate"]: '';
 $wg3DAlloy["scale"]    = isset($wg3DAlloy_["scale"]   ) ? $wg3DAlloy_["scale"]   : '';
 $wg3DAlloy["z"]        = isset($wg3DAlloy_["z"]       ) ? $wg3DAlloy_["z"]       : '';
 $wg3DAlloy["style"]    = isset($wg3DAlloy_["style"]   ) ? $wg3DAlloy_["style"]   : '';
 $wg3DAlloy["class"]    = 'threed-container'.
                         (isset($wg3DAlloy_["class"]) ? ' '.$wg3DAlloy_["class"]  : '');

 class ThreeDimentionAlloy extends ImageHandler {
  public static function onBeforePageDisplay ( OutputPage $out){
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

      if ($file) {
        if (self::check_file($file)) {
                $tmp = [];
                parse_str(str_replace(array(','), array('&'), $params["frame"]["caption"]), $tmp);
                foreach($wg3DAlloy as $param => $value) {
                    if (isset($tmp[$param])) $params["handler"][$param] = $tmp[$param];
                }

                return false;
        }
      }
      
      return true;
  }

  static public function parse3DTag($input, array $args, Parser $parser, PPFrame $frame ) {
      global $wg3DAlloy;

      $params = array_merge($wg3DAlloy, $args);
      $params["style"] = $wg3DAlloy["style"].' '.$params["style"];
      $params["class"] = $wg3DAlloy["class"].' '.$params["class"];
      $params["file"]  = (isset($args["file"]) ? $params["file"] : trim($input));

      $f = Title::newFromText( $params["file"], NS_FILE );
      if ($f) {
        $f = wfFindFile( $f->getBaseText() );
      }
      if ($f) {
          $params["file"] = $f->getCanonicalUrl();
      }

      $par = [];
      foreach($params as $key=>$value){
        if ($value !== '') {
          $par[$key]=$value;
        }
      }

      if (isset($par['color']) && (strpos($par['color'],'0x') === false)) {
        if (is_numeric($par['color'])){
          $par['color'] = '0x'.dechex($par['color']);
        } else {
          $par['color'] = '0x'.$par['color'];
        }
      }

      $elem = Html::element('canvas', $par, $input);

      return [ $elem, 'noParse'=> true, 'isHTML'=> 'true' ];
  }

  static public function parse3DFunc( Parser &$parser ) {
      global $wg3DAlloy;
      $args = func_get_args();
      array_shift( $args );

      $f = Title::newFromText( trim($args[0]), NS_FILE );
      if ($f) {
        $f = wfFindFile( $f->getBaseText() );
      }
      if ($f) {
          $args[0] = ($f->getCanonicalUrl());
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

      $par = [];
      foreach($params as $key=>$value){
        if ($value !== '') {
          $par[$key]=$value;
        }
      }

      if (isset($par['color']) && (strpos($par['color'],'0x') === false)) {
        if (is_numeric($par['color'])){
          $par['color'] = '0x'.dechex($par['color']);
        } else {
          $par['color'] = '0x'.$par['color'];
        }
      }

      $elem = Html::element('canvas', $par, $params["file"]);

      return [ $elem, 'noParse'=> true, 'isHTML'=> 'true' ];
  }

  public static function onImageOpenShowImageInlineBefore( $imagepage, $out ){
      global $wg3DAlloy;
      if ($imagepage->getDisplayedFile()) {
        if (self::check_file($imagepage->getDisplayedFile())) {

              $params=$wg3DAlloy;
              $params["file"] = $imagepage->getDisplayedFile()->getCanonicalUrl();

              $par = [];
              foreach($params as $key=>$value){
                if ($value !== '') {
                  $par[$key]=$value;
                }
              }

              if (isset($par['color']) && (strpos($par['color'],'0x') === false)) {
                if (is_numeric($par['color'])){
                  $par['color'] = '0x'.dechex($par['color']);
                } else {
                  $par['color'] = '0x'.$par['color'];
                }
              }

              $out->addHtml(Html::element('canvas', $par, $params["file"]));
              $out->addModules('ext.3DAlloy');
        }
      }
  }

    public static function onImageBeforeProduceHTML (&$dummy, &$title, &$file, &$frameParams, &$handlerParams, &$time, &$res) {
        global $wg3DAlloy;
        if ($file) {
          if (self::check_file($file)) {

              $params=array_merge($wg3DAlloy, $handlerParams);
              $params["file"] = $file->getCanonicalUrl();

              $par = [];
              foreach($params as $key=>$value){
                if ($value !== '') {
                  $par[$key]=$value;
                }
              }

              if (isset($par['color']) && (strpos($par['color'],'0x') === false)) {
                if (is_numeric($par['color'])){
                  $par['color'] = '0x'.dechex($par['color']);
                } else {
                  $par['color'] = '0x'.$par['color'];
                }
              }

              $res = Html::element('canvas', $par, $params["file"]);
              return false;
          }
        }

        return true;
    }

  function doTransform( $image, $dstPath, $dstUrl, $params, $flags = 0){
    //is compulsory for ImageHandler
  }

  public static function check_file($file){

    return ($file->getMimeType() === "application/json" || $file->getMimeType() === "application/obj" || $file->getMimeType() === "application/stl" );
  }
}
