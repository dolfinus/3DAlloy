Object3D = function () {
  this.canvas   = {};
  this.camera   = {};
  this.scnere   = {};
  this.renderer = {};
  this.controls = {};
  this.model    = false;
  this.plane    = {};
  this.params   = {};
  this.rotation = true;
  this.animation = false;
};

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


Object3D.prototype.resize = function() {
  var value = Math.max(Math.min(((window.innerHeight !== 0) ? window.innerHeight : screen.height) - 200, ((window.innerWidth !== 0) ? window.innerWidth : screen.width) - 300), 300);
  this.canvas.width = value;
  this.canvas.height = value;
//  this.render();
};

Object3D.prototype.render = function() {
  this.resize();
  this.renderer.setSize(this.canvas.width, this.canvas.height);
  this.renderer.clear();
  this.render();
}

Object3D.prototype.rotate = function(x, y) {
  this.model.rotation.set(x, y, 0);
  this.render();
};

Object3D.prototype.rotate_relative = function(x, y) {
  this.model.rotation.set(this.model.rotation.x+x, this.model.rotation.y+y, 0);
  this.render();
};

Object3D.prototype.set_params = function(def){
  this.params.file            = this.canvas.getAttribute('file');
  this.params.color           = this.canvas.getAttribute('color')    !== null ? parseInt(  this.canvas.getAttribute('color'),16)    : def.color;
  this.params.opacity         = this.canvas.getAttribute('opacity')  !== null ? parseFloat(this.canvas.getAttribute('opacity') )    : def.opacity;
  this.params.scale           = this.canvas.getAttribute('scale')    !== null ? parseFloat(this.canvas.getAttribute('scale')   )    : def.scale;
  this.params.z               = this.canvas.getAttribute('z')        !== null ? parseFloat(this.canvas.getAttribute('z')       )    : def.z;
  this.params.norotate        = this.canvas.getAttribute('norotate') !== null ? ((this.canvas.getAttribute('norotate') === "1" ||
                                                                                  this.canvas.getAttribute('norotate') === "true") ? true : false) : def.norotate;
};

Object3D.prototype.create_scene = function() {
  this.scene = new THREE.Scene();
};

Object3D.prototype.add_light = function() {
  var light = [];
  for (var i = 0; i < 5; ++i) {
    light[i] = new THREE.DirectionalLight(0xffffff);
  }
  light[0].position.set(   0, 300,    0);
  light[1].position.set( 100,  50,  100);
  light[2].position.set( 100,  50, -100);
  light[3].position.set(-100,  50,  100);
  light[4].position.set(-100,  50, -100);
  for (i = 0; i < 5; ++i) {
    light[i].intensity = 0.4;
    this.scene.add(light[i]);
  }
  this.scene.add(new THREE.AmbientLight(0x101010));
};

Object3D.prototype.add_camera = function() {
  this.camera = new THREE.PerspectiveCamera(65, this.canvas.width / this.canvas.height, 1, 1000);
  this.camera.position.y = 100;
  this.camera.position.z = 400;
};

Object3D.prototype.add_renderer = function() {
  this.renderer = new THREE.CanvasRenderer({
    canvas: this.canvas,
    sortObjects: false,
    sortElements: false
  });
  this.renderer.setClearColor(background_color);
  this.renderer.setSize(this.canvas.width, this.canvas.height);
};

Object3D.prototype.add_controls = function() {
  this.controls = new THREE.OrbitControls(this.camera, this.canvas);
};

Object3D.prototype.add_plane = function() {
  this.plane = new THREE.GridHelper(150, 8);
  this.plane.setColors(plane_color, plane_color);
  this.plane.position.y = -75;
  this.plane.updateMatrix();
  this.scene.add(this.plane);
};
function create_material(color,opacity) {
  var material = model_material.clone(model_material);
  material.color.setHex(color);
  material.opacity = opacity;
  return material;
}

Object3D.prototype.add_model = function(mesh) {
  mesh.scale.x = mesh.scale.y = mesh.scale.z = this.params.scale;
  mesh.position.y = this.params.z;
  mesh.updateMatrix();
  this.scene.add(mesh);
  this.model = mesh;
  this.rotation = !this.params.norotate;
  this.render();
};

Object3D.prototype.load_obj = function(mesh) {
  mesh.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.material = create_material(this.params.color,this.params);
    }
  });
  this.add_model(mesh);
};

Object3D.prototype.load_json = function(geometry) {
  geometry.computeBoundingBox();
  geometry.center();

  var material = create_material(this.params.color,this.params);
  var mesh = new THREE.Mesh(geometry, material);
  this.add_model(mesh);
};

Object3D.prototype.load_file = function() {
  var loader, self = this;

  if (this.params.file.match(/\.obj$/ig) !== null) {

    loader = new THREE.OBJLoader();
    loader.load(this.params.file, function(geometry){
      self.load_obj(geometry);
    });
    return true;

  } else if (this.params.file.match(/\.(stl|stlb)$/ig) !== null) {

    loader = new THREE.STLLoader();

  } else if (this.params.file.match(/\.(buffjson|buff)$/ig) !== null) {

    loader = new THREE.BufferGeometryLoader();

  } else if (this.params.file.match(/\.(json|3djson|3dj|three)$/ig) !== null) {

    loader = new THREE.JSONLoader();

  } else {
    console.log('Type of ' + this.params.file + ' file is not supported!');
    return false;
  }

  loader.load(this.params.file, function(geometry){
    self.load_json(geometry);
  });
  return true;
};

Object3D.prototype.render = function() {
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
};

Object3D.prototype.animate = function() {
  if (this.model === undefined) return;
  //setTimeout( function() {requestAnimationFrame( animate );}, 1000 / 30 );
  var frame = requestAnimationFrame(this.animate.bind(this));
  this.animation = true;
  if (this.model && this.rotation) {
      this.rotate_relative(speedX, speedY);
  }
};

if (HTMLCollection.prototype.forEach === undefined) {
    HTMLCollection.prototype.forEach = function(callback, thisObj) {
    Array.prototype.forEach.call(this, callback, thisObj);
  };
}

if (NodeList.prototype.forEach === undefined) {
    NodeList.prototype.forEach = function(callback, thisObj) {
    Array.prototype.forEach.call(this, callback, thisObj);
  };
}

var CanvasChangedEvent = document.createEvent('Event'),
  DoubleClickEvent     = document.createEvent('Event'),
  page_params = document.getElementsByTagName('body')[0].className,
  dark = (page_params.indexOf("dark") !== -1),
  edit = (page_params.indexOf("action-edit") !== -1 || page_params.indexOf("action-submit") !== -1);
if (!edit) document.addEventListener("keydown", onKeyDown, false);
CanvasChangedEvent.initEvent('canvas_changed', false, false);
DoubleClickEvent.initEvent(  'dbl_click',      false, false);

window.rotation = true;
window.speedX = 0.01;
window.speedY = 0.015;
window.default_params = {
    color: 0xff00ff,
    opacity: 0.8,
    scale: 100,
    z: 75,
    norotate: false
};
window.keys = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    RETURN: 13,
    SPACE: 32,
    HOME: 36,
    PLUS: 107,
    MINUS: 109
};
window.background_color = dark ? 0x4c4c4c : 0xf0f0f0;
window.plane_color      = dark ? 0x595959 : 0xe0e0e0;
window.model_material   = new THREE.MeshLambertMaterial({
    overdraw: 0.5,
    transparent: true
});

window.recreate_3d = recreate_objects;
recreate_objects();


function onKeyDown(event) {
  canvas = [];
  objects = document.getElementsByClassName('threed-container');
  objects.forEach(function(item, id) {
    if (item.className.indexOf('locked') === -1) canvas.push(item);
  });
  switch (event.keyCode) {
    case keys.LEFT:   canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotate_relative(    0, -0.05);} else {recreate_objects();}}); event.preventDefault(); break;
    case keys.RIGHT:  canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotate_relative(    0, +0.05);} else {recreate_objects();}}); event.preventDefault(); break;
    case keys.UP:     canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotate_relative(-0.05,     0);} else {recreate_objects();}}); event.preventDefault();  break;
    case keys.DOWN:   canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotate_relative(+0.05,     0);} else {recreate_objects();}}); event.preventDefault();  break;
    case keys.SPACE:  window.rotation = !window.rotation; canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotation = window.rotation;} else {recreate_objects();}}); event.preventDefault(); break;
    case keys.HOME:   canvas.forEach(function(item,i){ if (item.object !== undefined) {item.object.rotate(0,0);} else {recreate_objects();}}); event.preventDefault(); break;
    case keys.PLUS:   speedX += 0.01; speedY += 0.01;  event.preventDefault(); break;
    case keys.MINUS:  speedX -= 0.01; speedY -= 0.01;  event.preventDefault(); break;
  }
}

function OnCanvasRedraw(event) {
  var target = event.target || event.srcElement;
  if (target.object !== undefined) target.object.render();
}

function UnRotate(event) {
  var target = event.target || event.srcElement;
  if (target.object !== undefined) target.object.rotation = !target.object.rotation;
}

function recreate_objects() {
  var objects = document.getElementsByClassName('threed-container');
  objects.forEach(function(item, id) {
    if (item.object === undefined) {
      item.object = new Object3D();
      item.object.canvas = item;
      if (item.width === 0 || item.height === 0) {
        window.addEventListener("resize", item.object.redraw);
        item.object.resize();
      }

      item.object.create_scene();
      item.object.add_light();
      item.object.add_camera();
      item.object.add_renderer();
      item.object.add_controls();
      item.object.add_plane();
      item.object.set_params(window.default_params);

      item.object.load_file();
    }
      item.addEventListener("canvas_changed", OnCanvasRedraw, false);
      item.addEventListener("dbl_click", UnRotate, false);
    if(item.className.indexOf('locked') === -1){
      item.object.controls.setRotate(   true);
      item.object.controls.setDblClick( true);
    } else {
      item.object.controls.setRotate(  false);
      item.object.controls.setDblClick(false);
    }
    if (item.object.animation === false) item.object.animate();
  });
}
