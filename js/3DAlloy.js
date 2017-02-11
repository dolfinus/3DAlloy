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

var Canvas=document.getElementsByClassName('3d-container');
if ( Canvas ) {
  var camera = [],
      scene = [],
      renderer = [],
      controls = [],
      model = [],
      plane = [],
      params = {},
      rotate = [],
      rotation = true,
      rotateX = [],
      rotateY = [],
      speedX = 0.01,
      speedY = 0.015,
      def_color = 0xff00ff,
      def_opacity = 0.8,
      def_scale = 100,
      def_z = 75,
      def_norotate = false,
      keys = {
          LEFT: 37,
          RIGHT: 39,
          UP: 38,
          DOWN: 40,
          RETURN: 13,
          SPACE: 32,
          HOME: 36,
          PLUS: 107,
          MINUS: 109
      },
      CanvasChangedEvent = document.createEvent('Event'),
      DoubleClickEvent   = document.createEvent('Event'),
      page_params = document.getElementsByTagName('body')[0].className,
      dark        = (page_params.indexOf("dark") !== -1),
      edit        = (page_params.indexOf("action-edit") !== -1 || page_params.indexOf("action-submit") !== -1),
      background_color = dark ? 0x4c4c4c : 0xf0f0f0,
      plane_color      = dark ? 0x595959 : 0xe0e0e0,
      model_material   = new THREE.MeshLambertMaterial({
          overdraw: 0.5,
          transparent: true
      });
      
  if (!edit) document.addEventListener("keydown", onKeyDown, false);
  CanvasChangedEvent.initEvent('canvas_changed', false, false);
  DoubleClickEvent.initEvent('dbl_click', false, false);
  Canvas.forEach(function(item, id) {

    create_scene(id);

		add_light(id);
		add_camera(id);
		add_renderer(id);
		add_controls(id);
		add_plane(id);

		params = get_params(id);
		rotate[id]= !params.norotate;
		rotateX[id]=0;
		rotateY[id]=0;

		load_file(id,params);
		item.addEventListener("canvas_changed", OnCanvasRedraw, false);
		item.addEventListener("dbl_click", UnRotate, false);
		item.setAttribute("id",id);
	});
	animate();
}

function get_params(id) {
	var params={file: "", color: def_color, opacity: def_opacity, norotate: def_norotate, scale: def_scale, z: def_z};
	params.file            = Canvas[id].getAttribute('file');
	params.color           = Canvas[id].getAttribute('color')        !== null ? parseInt(  Canvas[id].getAttribute('color'),16) : def_color;
	params.opacity         = Canvas[id].getAttribute('opacity')      !== null ? parseFloat(Canvas[id].getAttribute('opacity') ) : def_opacity;
	params.scale           = Canvas[id].getAttribute('scale')        !== null ? parseFloat(Canvas[id].getAttribute('scale')   ) : def_scale;
	params.z               = Canvas[id].getAttribute('z')            !== null ? parseFloat(Canvas[id].getAttribute('z')       ) : def_z;
	params.norotate        = Canvas[id].getAttribute('norotate')     !== null ? ((Canvas[id].getAttribute('norotate') === "1" || Canvas[id].getAttribute('norotate') === "true") ? true : false) : def_norotate;
	return params;
}

function create_scene(id) {
	scene[id] = new THREE.Scene();
}

function add_light(id) {
	var light =[];
	for( var i=0; i<5; ++i) {
		light[i]= new THREE.DirectionalLight(0xffffff);
	}
	light[0].position.set(	 0,	 300,	 0 );
	light[1].position.set(	 100,	 50,	 100 );
	light[2].position.set(	 100,	 50,	-100 );
	light[3].position.set(	-100,	 50,	 100 );
	light[4].position.set(	-100,	 50,	-100 );
	for(i=0; i<5; ++i) {
		light[i].intensity=0.4;
		scene[id].add(light[i]);
	}
	scene[id].add( new THREE.AmbientLight( 0x101010 ) );
}

function add_camera(id) {
	camera[id] = new THREE.PerspectiveCamera( 65, Canvas[id].width / Canvas[id].height, 1, 1000 );
	camera[id].position.y = 100;
	camera[id].position.z = 400;
}

function add_renderer(id) {
	renderer[id] = new THREE.CanvasRenderer({canvas: Canvas[id], sortObjects: false, sortElements: false });
	renderer[id].setClearColor( background_color );
	renderer[id].setSize( Canvas[id].width, Canvas[id].height );
}

function add_controls(id) {
	controls[id] = new THREE.OrbitControls(camera[id], Canvas[id]);
}

function add_plane(id) {
	plane[id] = new THREE.GridHelper( 150, 8);
	plane[id].setColors(plane_color, plane_color);
	plane[id].position.y = -75;
	plane[id].updateMatrix();
	scene[id].add( plane[id] );
}

function add_material(parameters) {
  var material=model_material.clone(model_material);
  material.color.setHex(parameters.color);
  material.opacity = parameters.opacity;
  return material;
}

function add_model(id, mesh, params) {
  mesh.scale.x = mesh.scale.y = mesh.scale.z = params.scale;
  mesh.position.y = params.z;
  mesh.updateMatrix();
  scene[id].add(mesh);
  model[id]=mesh;
  render(id);
}

function load_obj(id, mesh, parameters) {
    mesh.traverse( function ( child ) {
        if (child instanceof THREE.Mesh ) {
            child.material = add_material(parameters);
        }
    });
    add_model(id, mesh, params);
}

function load_json(id, geometry, parameters) {
  	geometry.computeBoundingBox();
  	geometry.center();

    var material=add_material(parameters);
    var mesh = new THREE.Mesh(geometry,material);
    add_model(id, mesh, params);
}

function load_file(id,parameters) {
    var loader;

  if ( parameters.file.match(/\.obj$/ig) !== null) {

		loader=new THREE.OBJLoader();
    loader.load(parameters.file, function (mesh) {
		    load_obj(id, mesh, parameters)
	  });
	  return true;

	} else if ( parameters.file.match(/\.(stl|stlb)$/ig) !== null) {

		loader=new THREE.STLLoader();

	} else if ( parameters.file.match(/\.(buffjson|buff)$/ig) !== null) {

		loader=new THREE.BufferGeometryLoader();

	} else if ( parameters.file.match(/\.(json|3djson|3dj|three)$/ig) !== null) {

		loader=new THREE.JSONLoader();

	} else {
	    console.log('Type of '+parameters.file+' file is not supported!');
	    return false;
	}

	loader.load(parameters.file, function (geometry) {
		load_json(id, geometry, parameters)
	});
	return true;
}

function onKeyDown(event) {
	var rotationChanged = true;
	switch (event.keyCode) {
		case keys.LEFT: 	rotate.forEach(function(item,i){ rotateY[i] -= 0.05;});		     break;
		case keys.RIGHT: 	rotate.forEach(function(item,i){ rotateY[i] += 0.05;});		     break;
		case keys.UP: 		rotate.forEach(function(item,i){ rotateX[i] -= 0.05;});		     break;
		case keys.DOWN: 	rotate.forEach(function(item,i){ rotateX[i] += 0.05;});		     break;
		case keys.RETURN:
		case keys.SPACE:	rotation = !rotation; rotate.forEach(function(item,i){ rotate[i] = rotation;});    break;
		case keys.HOME: 	rotate.forEach(function(item,i){ rotateY[i]=0;rotateX[i]=0;}); break;
		case keys.PLUS: 	speedX += 0.01; speedY += 0.01;										             break;
		case keys.MINUS: 	speedX -= 0.01; speedY -= 0.01;										             break;
		default:			    rotationChanged = false;
	}
	if (rotationChanged) {
    event.preventDefault();
    Canvas.forEach(function(item, i){
      model[i].rotation.set(rotateX[i],rotateY[i],0);
      render(i);
   });
  }
}

function OnCanvasRedraw(event) {
	var target = event.target || event.srcElement,
	    i = parseInt(target.getAttribute("id"));
	render(i);
}

function UnRotate(event) {
	var target = event.target || event.srcElement;
	    i = parseInt(target.getAttribute("id"));
	rotate[i] = !rotate[i];
}

function animate() {
	//setTimeout( function() {requestAnimationFrame( animate );}, 1000 / 30 );
	requestAnimationFrame(animate);
  Canvas.forEach(function(item, i) {
    if (model[i] && rotate[i]) {
        model[i].rotation.set(rotateX[i] += speedX,rotateY[i] += speedY,0);
	    render(i);
    }
  });
}

function render(id) {
    controls[id].update();
    renderer[id].render( scene[id], camera[id] );
}
