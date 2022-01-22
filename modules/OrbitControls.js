/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.center = new THREE.Vector3();

	this.userDblClick = true;

	this.userZoom = false;
	this.userZoomSpeed = 2.0;

	this.userRotate = true;
	this.userRotateSpeed = 2.0;

	this.userPan = false;
	this.userPanSpeed = 2.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var time=0, last_time=0;

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' },CanvasChangedEvent = document.createEvent('Event'), DoubleClickEvent=document.createEvent('Event');
	CanvasChangedEvent.initEvent('canvas_changed', false, false);
	DoubleClickEvent.initEvent('dbl_click', false, false);


	this.setRotate = function(value){
		scope.userRotate = value;
	};

	this.setZoom = function(value){
		scope.userZoom = value;
	};

	this.setPan = function(value){
		scope.userPan = value;
	};

	this.setDblClick = function(value){
		scope.userDblClick = value;
	};

	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.zoom = function ( zoomScale ) {

		scale *= zoomScale;

	};

	this.pan = function ( distance ) {

		distance.transformDirection( this.object.matrix );
		distance.multiplyScalar( scope.userPanSpeed );

		this.object.position.add( distance );
		this.center.add( distance );

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).add( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {
		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		event.preventDefault();

		if (scope.userZoom === true && event.button === 1) {
				state = STATE.ZOOM;
				zoomStart.set( event.clientX, event.clientY );
		} else if (scope.userPan === true && event.button === 2) {

       state = STATE.PAN;

		} else {

			var date= new Date();
			time=date.getTime();
			if ((time-last_time)<=250) {if ( scope.userDblClick === true ) this.dispatchEvent( DoubleClickEvent ); }
			last_time=date.getTime();

			state = STATE.ROTATE;
			rotateStart.set( event.clientX, event.clientY );
		}
		var target = event.target || event.srcElement;
		target.classList.add('grabbing');
	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch (state) {
			case STATE.ROTATE:

				rotateEnd.set( event.clientX, event.clientY );
				rotateDelta.subVectors( rotateEnd, rotateStart );
				if (rotateDelta.x !==0 || rotateDelta.y !==0) this.dispatchEvent( CanvasChangedEvent );

				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

				rotateStart.copy( rotateEnd );
				break;

			case STATE.ZOOM:

				zoomEnd.set( event.clientX, event.clientY );
				zoomDelta.subVectors( zoomEnd, zoomStart );

				if ( zoomDelta.y > 0 ) {
					scope.zoomIn();
					this.dispatchEvent( CanvasChangedEvent );

				} else if ( zoomDelta.y < 0 ) {
					scope.zoomOut();
					this.dispatchEvent( CanvasChangedEvent );
				}

				zoomStart.copy( zoomEnd );
				break;

			case STATE.PAN:

				var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
				if (movementX !==0 || movementY !==0) this.dispatchEvent( CanvasChangedEvent );
				scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );
				break;
			default:
				state = STATE.NONE;
		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		state = STATE.NONE;
		
		var target = event.target || event.srcElement;
		target.classList.remove('grabbing');

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userZoom === false ) return;
event.preventDefault();
		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {
			scope.zoomOut();
			this.dispatchEvent( CanvasChangedEvent );
		} else if (delta < 0) {
			scope.zoomIn();
			this.dispatchEvent( CanvasChangedEvent );
		}

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		event.preventDefault();

		if (scope.userZoom === true && event.touches.length === 1) {
			state  = STATE.TOUCH_ZOOM;
			var x = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var y = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			zoomStart.set( x, y );

		} else if (event.touches.length === 2) {

       state = STATE.NONE;

		} else {

			var date= new Date();
			time=date.getTime();
			if ((time-last_time)<=250) {if ( scope.userDblClick === true ) this.dispatchEvent( DoubleClickEvent ); }
			last_time=date.getTime();

			state = STATE.TOUCH_ROTATE;
			rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		}
		
		var target = event.target || event.srcElement;
		target.classList.add('grabbing');
	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.TOUCH_ROTATE:
				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );
				if (rotateDelta.x !==0 || rotateDelta.y !==0) this.dispatchEvent( CanvasChangedEvent );

				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

				rotateStart.copy( rotateEnd );
				break;

			case STATE.TOUCH_ZOOM:
				var x =  event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var y =  event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				zoomEnd.set( x, y );
				zoomDelta.subVectors( zoomEnd, zoomStart );

				if ( zoomDelta.y !== 0 ) {

					scope.zoom(zoomStart.y/zoomEnd.y);
					this.dispatchEvent( CanvasChangedEvent );
				}

				zoomStart.copy( zoomEnd );
				break;

			default:
				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;
		if ( scope.userRotate === false ) return;

		state = STATE.NONE;
		
		var target = event.target || event.srcElement;
		target.classList.remove('grabbing');

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', onTouchStart, false );
	this.domElement.addEventListener( 'touchend', onTouchEnd, false );
	this.domElement.addEventListener( 'touchmove', onTouchMove, false );

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
