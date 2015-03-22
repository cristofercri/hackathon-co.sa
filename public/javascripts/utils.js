var utils = function(){

	var API_BASE = 'https://iescities.com:443/IESCities/api';

	var datasetId = 236;

	function muestraDetalle (id){
	//Recoge toda la información
		var cadena = "";
		$.ajax({
			url: "http://www.zaragoza.es/api/recurso/turismo/monumento/"+id+".json",
			success: function(data) {
				if (data.estilo!=null){
					cadena+="<p class='fs-title'><strong>Estilo:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.estilo)+"</p></div>";
				}
				if (data.description!=null){
					cadena+="<p class='fs-title'><strong>Descripción:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.description)+"</p></div>";
				}
				if (data.horario!=null){
					cadena+="<p class='fs-title'><strong>Horario:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.horario)+"</p></div>";
				}
				if (data.price!=null){
					cadena+="<p class='fs-title'><strong>Precio:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.price)+"</p></div>";
				}
				if (data.address!=null){
					cadena+="<p class='fs-title'><strong>Dirección:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.address)+"</p></div>";
				}
				if (data.visita!=null){
					cadena+="<p class='fs-title'><strong>Datos de interés:</strong></p><div style='padding-left: 30px;'><p class='fs-subhead'>"+preparaDatos(data.visita)+"</p></div>";
				}
			},
			async: false
		});
		return cadena;	
	}

function primeraMayuscula (cadena){
	return cadena.substr(0, 1).toUpperCase() + cadena.substr(1)
}

function preparaDatos (cadena){
	cadena=cadena.substr(0, 1).toUpperCase() + cadena.substr(1);
	cadena=cadena.replace("src=\"", "src=\"http://www.zaragoza.es/");
	cadena=cadena.replace("href=\"", "target=\"_blank\" href=\"http://www.zaragoza.es/");
	return cadena;
}

function buscaResultadosIni (valor){
	if (valor.length>3){
		var resultado = [];
		buscaResultados(valor, resultado);
		ObtenerInfoExtra(resultado);
		return resultado;
	}
}

function buscaResultados (valor, resultado){

	var query = "SELECT TCAR.title, TCAR.link FROM features_properties TCAR  ";
	query += "INNER JOIN features_geometry_coordinates TCOR ON (TCOR._id=TCAR._id)";
	query += "WHERE "+trataTildesColumna("TCAR.title")+" LIKE '%"+trataTildesConstante(valor)+"%'";

	if (valor.length>3){
		
		$.ajax ({
			url: API_BASE + '/data/query/' + datasetId + '/sql',
			type: "POST",
			data: query,
			async: false,
			success: function(json){	
				
				var datos = json.rows;
				
				for(i = 0; i < datos.length; i++) {
					
					resultado.push({
						id: datos[i].link.split("=")[1],
						titulo: datos[i].title,
						urlImagen: null,
						descripcion: null,
						coordenadas: null
					});
				}

				
				
			},
			
			
			error: function(xhr, ajaxoptions, thrownerror){alert("Se ha producido el siguiente error al obtener datos de IESCITIES: "+xhr.status+"-"+thrownerror);},
			contentType: 'text/plain'
		}
		);
		
	}
}
function UrlExists(url)
{
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	return http.status!=404;
}

function trataTildesColumna (valor){
	return "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER("+valor+"), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')"
}

function trataTildesConstante (valor){
	return valor.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
}

function ObtenerInfoExtra(datos){
	for(i = 0; i <= datos.length-1; i++){	
		$.ajax({
			type: "GET",
			async: false,
			url: "http://www.zaragoza.es/api/recurso/turismo/monumento/"+datos[i].id+".json?srsname=wgs84",
			success: asignaDatos(i, datos)
		});
	}
}



function asignaDatos(i, datos){
	return function(result){
		datos[i].urlImagen = result.image;
		datos[i].descripcion=result.description;
		datos[i].coordenadas=[result.geometry.coordinates[1], result.geometry.coordinates[0]];
	}	
}


return {
	buscaResultadosIni: buscaResultadosIni,
	muestraDetalle: muestraDetalle
}

}();