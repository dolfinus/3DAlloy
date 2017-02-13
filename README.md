# [3DAlloy](https://www.mediawiki.org/wiki/Extension:3DAlloy)
## Description
MediaWiki extension which allows to add 3D models viewer to site pages. Based on [THREE.js](https://github.com/mrdoob/three.js/), renders image with CanvasRenderer.
There you can see [example 3D model page](https://en.crystalls.info/Template:Icosahedron).

## Example
![example of 3D model view](https://upload.wikimedia.org/wikipedia/mediawiki/f/f7/3DAlloy.png "3D model example")

## Supported file extensions
THREE.js model format:
* .json
* .3djson
* .3dj
* .three

THREE.js model buffer geometry format:
* .buff
* .buffjson

OBJ file format:
* .obj

STL (binary) file format:
* .stl
* .stlb

## Install
Download the latest snapshot and extract it to your extensions directory. Then include it in your [LocalSettings.php](https://www.mediawiki.org/wiki/Manual:LocalSettings.php) file as in the following example:
```php
wfLoadExtension( '3DAlloy' );

$wgFileExtensions = array_merge(
  $wgFileExtensions, array(
      'json', '3dj', '3djson', 'three',
      'buff', 'buffjson',
      'obj',
      'stl', 'stlb'
  )
);

```

Then add these lines to the end of your Mediawiki _includes/mime.types_ file:
```
application/json json 3djson 3dj three buff buffjson
application/obj obj
application/stl stl stlb
```

And then to _includes/mime.info_ file:
```
application/json	[TEXT]
application/obj [TEXT]
application/stl [TEXT]
```

## Usage
### As Image Handler
```wiki
[[File:Model.json|300x300px|color=,opacity=,...]]
```

### As Parser function
```wiki
{{#3d:Model.json}}
{{#3d:Model.json|width}}
{{#3d:Model.json|width|height}}
...
{{#3d:Model.json|width|height|color|opacity|norotate|scale|z|style|class}}
```
Instead of uploaded filename you can use an url for file located in external site.

### As Parser tag
```html
<3d file="Model.json" width="" height="" ... ></3d>
or
<3d width="" height="" ... >Model.json</3d>
```
You also can use url instead of short filename.

## Parameters
|Name     |Description                            |Default value|
|:--------|:--------------------------------------|------------:|
|width    |Canvas width in pixels                 |300          |
|height   |Canvas height in pixels                |300          |
|color    |Model RGB color as hex                 |0xff00ff     |
|opacity  |Model opacity as decimal between 0...1 |0.8          |
|norotate |If true or 1, model does not rotate    |false        |
|scale    |Model scale, in percent                |100          |
|z        |Model z coordinate                     |75           |
|style    |Additional canvas CSS style            |             |
|class    |Additional canvas HTML class           |             |

Width and height can be set to _0_ value, so size of viewer will be set according to user screen dimensions.

### Configure
All default values can be changed in your [LocalSettings.php](https://www.mediawiki.org/wiki/Manual:LocalSettings.php) file:
```php
$wg3DAlloy["width"]  = 500;
$wg3DAlloy["height"] = 400;
...
$wg3DAlloy["class"]  = 'someclass';
```

## Controls and hotkeys
|Action                                       |Controls                               |
|:--------------------------------------------|:--------------------------------------|
|Camera rotate                                |Swipe, left mouse key hold and move    |
|Camera pan                                   |Right key hold and move                |
|Camera zoom                                  |Mouse wheel, hold wheel and move, pinch|
|Model rotate                                 |←↑→↓ keys                              |
|Model rotation reset                         |Home key                               |
|Model rotation play/pause                    |Double click, double tap               |
|Model rotation play/pause all models at page |Enter, Space keys                      |
|Model rotation speed                         |- and + keys                           |
Hotkeys automatically disables while you edit or submit wiki page.
