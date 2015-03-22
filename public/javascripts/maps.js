// Gestiona los mapas de Google

// global variables
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var bounds = new google.maps.LatLngBounds();
var map;

// Funcion de inizalizacion del mapa:
function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer(
	{
		map             : map,
		preserveViewport: true,
		  polylineOptions : {strokeColor: 'red'} // Por defecto en rojo
		}
		)

	var mapCanvas = document.getElementById('map-canvas');
	var mapOptions = {
		center: new google.maps.LatLng(41.6516913, -0.8949809),
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			mapCanvas.setCenter(initialLocation);
		});
	}
	map = new google.maps.Map(mapCanvas, mapOptions);

	// Establecemos el mapa para las rutas:
	directionsDisplay.setMap(map);
}

function calcRoute(ruta) {
	var grafo = [];
	var nodo;
	if (ruta.length > 0){
		console.log('Long ruta: ' + ruta.length);
		// Iterar para cada tramo:
		dibujarMarcador(ruta[0].tramoConfig.origin.replace(" ","").split(",")[0],
			ruta[0].tramoConfig.origin.replace(" ","").split(",")[1],
			ruta[0].infoOrigen, ruta[0].tituloOrigen);

		$.each( ruta, function( indice, tramo ){
			console.log('** Dibujando tramo : ' + tramo.tituloOrigen + ' - ' + tramo.tituloDestino);
			dibujarMarcador(tramo.tramoConfig.destination.replace(' ','').split(',')[0],
				tramo.tramoConfig.destination.replace(' ','').split(',')[1],
				tramo.infoDestino, tramo.tituloDestino);

			// Llamamos a la API de Google para que nos devuelva el tramo de la ruta:
			directionsService.route(tramo.tramoConfig, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {

			  	// Dibujamos la ruta en el mapa:
			  	tramo.directionsDisplay.setDirections(result);
			  	map.fitBounds(bounds.union(result.routes[0].bounds));

				if (ruta.length - 1 == indice){ // Ultimo nodo
					setTimeout(function() {
				    // Vamos creando el array para el grafo:
				    nodo = 	{ 	titulo : tramo.tituloOrigen,
				    	urlImagen: tramo.urlImagenOrigen,
				    	distanciaNext: result.routes[0].legs[0].distance.text + ' (' + result.routes[0].legs[0].duration.text +')'
				    };

				    console.log('Añadimos nodo : ' + nodo.titulo + ' ' + nodo.distanciaNext);

				    grafo.push(nodo);

				    // Vamos creando el array para el grafo:
				    nodo = 	{ 	titulo : tramo.tituloDestino, 
				    	urlImagen: tramo.urlImagenDestino,
				    	distanciaNext: ''
				    };

				    console.log('Añadimos nodo final: ' + nodo.titulo + ' ' + nodo.distanciaNext);

				    grafo.push(nodo);

				    console.log('Long grafo a enviar: ' + grafo.length);
				    generaGrafo(grafo);
				}, 1000);
				}else{
				    // Vamos creando el array para el grafo:
				    nodo = 	{ 	titulo : tramo.tituloOrigen, 
				    	urlImagen: tramo.urlImagenOrigen,
				    	distanciaNext: result.routes[0].legs[0].distance.text + ' (' + result.routes[0].legs[0].duration.text +')'
				    };

				    console.log('Añadimos nodo : ' + nodo.titulo + ' ' + nodo.distanciaNext);

				    grafo.push(nodo);
				}

			}
		});
});
}
}

function dibujarMarcador(x, y, htmlInfo, tituloMarcador){
	var infowindow = new google.maps.InfoWindow({
		content: htmlInfo
	});

	var myLatlng = new google.maps.LatLng(x, y);

	// To add the marker to the map, use the 'map' property
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title: tituloMarcador
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	});
}

function generaGrafo (dtDatos){
	var txtNodo = "<td><div class='circleBase2' title='@titulo' style='background: url(@url) no-repeat center;'></div></td>";
	var txtArista="<td style='vertical-align: top;'><div class='linea'>@DISTANCIA</div></td>";
	var txtAristaRetorno="</tr><tr><td style='vertical-align: top;'><div class='linea2' /></td><td style='vertical-align: top;'><div class='linea' /></td><td style='vertical-align: top;'><div class='linea3'>@DISTANCIA</div></td><td style='vertical-align: top;'><div class='linea' /></td><td style='vertical-align: top;'><div class='linea4' /></td></tr><tr><td style='vertical-align: top;'><div class='linea5' /></td><td colspan='4'></td></tr><tr>";
	var code = "<table cellspacing=0 cellpadding=0 border=0><tr>";
	
	$(dtDatos).each( function (index){
		code+=txtNodo.replace("@url", dtDatos[index].urlImagen).replace("@titulo", dtDatos[index].titulo);
		if (index!=(dtDatos.length-1))
		{
			if ((index)%3==2 )
			{
				//console.log("intro");
				code+=txtAristaRetorno.replace("@DISTANCIA", dtDatos[index].distanciaNext);
			}else{
				//console.log("no intro");
				console.log(dtDatos[index].distanciaNext);
				code+=txtArista.replace("@DISTANCIA", dtDatos[index].distanciaNext);
			}
		}
	});
	
	code+="</table>";
	$("#dvSalida").html(code);
}