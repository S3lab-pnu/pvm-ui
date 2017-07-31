/*jslint devel: true */
var map;
var iConArray = [];
var contentArray = [];
var markers = [];
var iterator = 0;
var suwon = {lat : 37.274627, lng : 127.00953, zoom : 11};

iConArray[0] = "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png";
iConArray[1] = "https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png";
iConArray[2] = "https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png";
iConArray[3] = "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png";
iConArray[4] = "https://maps.gstatic.com/mapfiles/ms2/micons/ltblue-dot.png";
iConArray[5] = "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png";
iConArray[6] = "https://maps.gstatic.com/mapfiles/ms2/micons/purple-dot.png";

function draw_map(city, property_list, search_method) {
    'use strict';
    var mapOptions, sorted_property_list, i;
    
    mapOptions = {
        zoom: city.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(city.lat, city.lng)
    };
    
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    
    for (i = 0; i < property_list.length; i += 1) {
        addMarker(property_list, search_method);
    }
    iterator = 0;
}

function addMarker(sort_location_list, search_method) {

    
    var iconcolor;
    var center = {lat: sort_location_list[iterator].lat, lng: sort_location_list[iterator].lng};

    
    if (search_method === 'show_value') {
        iconcolor = iConArray[6-(Math.round(sort_location_list[iterator].rank))];
    } else {
        if (sort_location_list[iterator].rank > 0) {
            if (Math.abs(sort_location_list[iterator]['rank']) > 4) {
                iconcolor = iConArray[0];
            } else if (Math.abs(sort_location_list[iterator]['rank']) > 2) {
                iconcolor = iConArray[1];
            } else {
                iconcolor = iConArray[2];
            }
            
        }
        else if (sort_location_list[iterator].rank < 0) {
            if (Math.abs(sort_location_list[iterator]['rank']) > 4) {
                iconcolor = iConArray[6];
            } else if (Math.abs(sort_location_list[iterator]['rank']) > 2) {
                iconcolor = iConArray[5];
            } else {
                iconcolor = iConArray[4];
            }
        }
        else {
            iconcolor = iConArray[3];
        }
    }


    var marker = new google.maps.Marker({
        position: center,
        map: map,
        draggable: false,
        icon: iconcolor
        });

    if (search_method === 'show_value'){
	    var infowindow = new google.maps.InfoWindow({
	       content:"주소 : " + sort_location_list[iterator]['addr'] + "<br />" + "가치: " + sort_location_list[iterator]['rank'].toFixed(1)
	    });

	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.open(map,marker);
	    });
	}
	else{
		var infowindow = new google.maps.InfoWindow({
	       content:"주소 : " + sort_location_list[iterator]['addr'] + "<br />" + "랭크차이: " + sort_location_list[iterator]['rank'].toFixed(1)
	    });

	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.open(map,marker);
	    });


	}

    iterator++;
}
