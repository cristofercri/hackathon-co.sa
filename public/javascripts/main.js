angular.module("main",["lumx", "ngSanitize", "perfect_scrollbar"])
.controller("indexController",["$location", "$scope", "LxDialogService", "LxNotificationService", function($location, $scope, LxDialogService, LxNotificationService){
	$scope.elecciones = [
	    
	];

	$scope.seleccionados = [

	];

	$scope.busqueda = "";

	$scope.$watch("busqueda", function() {
		if ($scope.busqueda.length > 3){
			$scope.elecciones = utils.buscaResultadosIni($scope.busqueda)
		} else {
			$scope.elecciones = [];	
		}
	});

	$scope.$watch("seleccionados", function() {
		console.log($scope.seleccionados)
	});

	$scope.info = {}

	$scope.enviar = function() {
		sessionStorage.seleccionados = angular.toJson($scope.seleccionados);
		console.log("por aqui")
		//$location.path("/ruta")
		document.location.href = "/ruta"
	};

	$scope.cerrarDialogo = function() {
	    LxDialogService.close("info");
	    $scope.info = {}
	};

	$scope.mostrarInfo = function(elemento) {
	    LxDialogService.open("info");
	    $scope.info.titulo = elemento.titulo
	    $scope.info.cuerpo = utils.muestraDetalle(elemento.id)
	};

	$scope.anadir = function(elemento) {
		if ($scope.seleccionados.indexOf(elemento) == -1){
			$scope.seleccionados.push(elemento)
			console.log(elemento)
			console.log("paso")
		} else {
			LxNotificationService.warning('Monumento ya está en lista');
		}
	};

	$scope.eliminar = function(elemento) {
		var idx = $scope.seleccionados.indexOf(elemento);
		$scope.seleccionados.splice(idx,1)
	};

}])
.controller("rutaController", ["$scope", function($scope) {

	$scope.inicializar = function () {
		initialize()
		$scope.getSeleccionados();
		$scope.crearRuta();
	}

	$scope.getSeleccionados = function (){
		$scope.seleccionados = angular.fromJson(sessionStorage.seleccionados)
	}

	$scope.crearRuta = function (){
		$scope.procesados = [];
		sel = $scope.seleccionados;

		var ruta = [];
		selOrigen = sel[0];

		console.log(sel)
		var selSliced = sel.slice(1, sel.length)

		$.each(selSliced, function(idx, obj){

			selDestino = obj;

			var tramoConfig = {
				origin: selOrigen.coordenadas[0] + "," + selOrigen.coordenadas[1],
				destination: selDestino.coordenadas[0] + "," + selDestino.coordenadas[1],
				travelMode  :  google.maps.TravelMode.WALKING,
				unitSystem : google.maps.UnitSystem.METRIC
			};

			var directionsDisplay = new google.maps.DirectionsRenderer({
							map             : map,
						  	preserveViewport: true,
						  	polylineOptions : {strokeColor: 'blue'},
							routeIndex: parseInt(idx) + 1,
							suppressMarkers:true
						});

			directionsDisplay.setMap(map);

			var tramo = {
				tramoConfig : tramoConfig, directionsDisplay: directionsDisplay,
				infoOrigen: selOrigen.descripcion, infoDestino: selDestino.descripcion,
				tituloOrigen: selOrigen.titulo, tituloDestino: selDestino.titulo,
				urlImagenOrigen: selOrigen.urlImagen, urlImagenDestino: selDestino.urlImagen
			};

			ruta.push(tramo);

			selOrigen = selDestino;

		}) 
		calcRoute(ruta);
	}
}])