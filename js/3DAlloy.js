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
	var camera=[], scene=[], renderer=[], controls=[], model=[], plane=[], params = {}, rotate=[],
	rotation=true,rotateX=[], rotateY=[], speedX=0.01, speedY=0.015,
	def_color=0xff00ff,
	def_opacity=0.8,
	def_scale=100,
	def_z=75,
	def_norotate=false,
	keys = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, RETURN: 13, SPACE: 32, HOME: 36, PLUS: 107, MINUS: 109 },
	model_material = new THREE.MeshLambertMaterial({overdraw: 0.5, transparent:true }),
	CanvasChangedEvent = document.createEvent('Event'), DoubleClickEvent=document.createEvent('Event'),
	page_params=document.getElementsByTagName('body')[0].className,
  dark=(page_params.indexOf("dark") !== -1),
  edit=(page_params.indexOf("action-edit") !== -1 || page_params.indexOf("action-submit") !== -1),
	background_color= dark ? 0x4c4c4c : 0xf0f0f0,
	plane_color= dark ? 0x595959 : 0xe0e0e0;
  if (!edit) document.addEventListener("keydown", onKeyDown, false);
	CanvasChangedEvent.initEvent('canvas_changed', false, false);
	DoubleClickEvent.initEvent('dbl_click', false, false);
	Canvas.forEach(function(item, N) {

    create_scene(N);

		add_light(N);
		add_camera(N);
		add_renderer(N);
		add_controls(N);
		add_plane(N);

		params = get_params(N);
		rotate[N]= !params.norotate;
		rotateX[N]=0;
		rotateY[N]=0;

		load_file(N,params);
		item.addEventListener("canvas_changed", OnCanvasRedraw, false);
		item.addEventListener("dbl_click", UnRotate, false);
		item.setAttribute("id",N);
	});
	animate();
}

function get_params(N) {
	var params={file: "", color: def_color, opacity: def_opacity, norotate: def_norotate, scale: def_scale, z: def_z};
	params.file            = Canvas[N].getAttribute('file');
	params.color           = Canvas[N].getAttribute('color')        !== null ? parseInt(  Canvas[N].getAttribute('color'),16) : def_color;
	params.opacity         = Canvas[N].getAttribute('opacity')      !== null ? parseFloat(Canvas[N].getAttribute('opacity') ) : def_opacity;
	params.scale           = Canvas[N].getAttribute('scale')        !== null ? parseFloat(Canvas[N].getAttribute('scale')   ) : def_scale;
	params.z               = Canvas[N].getAttribute('z')            !== null ? parseFloat(Canvas[N].getAttribute('z')       ) : def_z;
	params.norotate        = Canvas[N].getAttribute('norotate')     !== null ? ((Canvas[N].getAttribute('norotate') === "1" || Canvas[N].getAttribute('norotate') === "true") ? true : false) : def_norotate;
	return params;
}

function create_scene(N) {
	scene[N] = new THREE.Scene();
}

function add_light(N) {
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
		scene[N].add(light[i]);
	}
	scene[N].add( new THREE.AmbientLight( 0x101010 ) );
}

function add_camera(N) {
	camera[N] = new THREE.PerspectiveCamera( 65, Canvas[N].width / Canvas[N].height, 1, 1000 );
	camera[N].position.y = 100;
	camera[N].position.z = 400;
}

function add_renderer(N) {
	renderer[N] = new THREE.CanvasRenderer({canvas: Canvas[N], sortObjects: false, sortElements: false });
	renderer[N].setClearColor( background_color );
	renderer[N].setSize( Canvas[N].width, Canvas[N].height );
}

function add_controls(N) {
	controls[N] = new THREE.OrbitControls(camera[N], Canvas[N]);
}

function add_plane(N) {
	plane[N] = new THREE.GridHelper( 150, 8);
	plane[N].setColors(plane_color, plane_color);
	plane[N].position.y = -75;
	plane[N].updateMatrix();
	scene[N].add( plane[N] );
}

function add_material(parameters) {
  var material=model_material.clone(model_material);
  material.color.setHex(parameters.color);
  material.opacity = parameters.opacity;
  return material;
}

function add_model(N, mesh, params) {
  mesh.scale.x = mesh.scale.y = mesh.scale.z = params.scale;
  mesh.position.y = params.z;
  mesh.updateMatrix();
  scene[N].add(mesh);
  model[N]=mesh;
  render(N);
}

function load_obj(N, mesh, parameters) {
    mesh.traverse( function ( child ) {
        if (child instanceof THREE.Mesh ) {
            child.material = add_material(parameters);
        }
    });
    add_model(N, mesh, params);
}

function load_json(N, geometry, parameters) {
  	geometry.computeBoundingBox();
  	geometry.center();

    var material=add_material(parameters);
    var mesh = new THREE.Mesh(geometry,material);
    add_model(N, mesh, params);
}

function load_file(N,parameters) {
    var loader;

  if ( parameters.file.match(/\.obj$/ig) !== null) {

		loader=new THREE.OBJLoader();
    loader.load(parameters.file, function (mesh) {
		    load_obj(N, mesh, parameters)
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
		load_json(N, geometry, parameters)
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

function render(N) {
    controls[N].update();
    renderer[N].render( scene[N], camera[N] );
}
