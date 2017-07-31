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

function sort_data(location_list, search_method) {
    'use strict';
    var sortingField;
    
    sortingField = "";
    
    if (search_method) {
        sortingField = "price";
    } else {
        sortingField = "value";
    }
    
    location_list.sort(function (a, b) {
        return b[sortingField] -  a[sortingField];
    });

    return location_list;

}

function draw_map(city, property_list, search_method, display_method) {
    'use strict';
    var mapOptions, sorted_property_list, i;
    
    mapOptions = {
        zoom: city.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(city.lat, city.lng)
    };
    
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    sorted_property_list = sort_data(property_list, search_method);
    
    for (i = 0; i < sorted_property_list.length; i += 1) {
        addMarker(sorted_property_list, search_method, display_method);
    }
    iterator = 0;
}

function addMarker(sort_location_list, search_method, display_method) {

    
    var iconcolor;
    var center = {lat: sort_location_list[iterator].lat, lng: sort_location_list[iterator].lng};

    
    if (search_method) {
        if (sort_location_list[iterator].price < sort_location_list[0].price / 7) iconcolor = iConArray[6];
            else if(sort_location_list[iterator].price<(sort_location_list[0].price*2)/7) iconcolor = iConArray[5];
            else if(sort_location_list[iterator].price<(sort_location_list[0].price*3)/7) iconcolor = iConArray[4];
            else if(sort_location_list[iterator].price<(sort_location_list[0].price*4)/7) iconcolor = iConArray[3];
            else if(sort_location_list[iterator].price<(sort_location_list[0].price*5)/7) iconcolor = iConArray[2];
            else if(sort_location_list[iterator].price<(sort_location_list[0].price*6)/7) iconcolor = iConArray[1];
            else  iconcolor = iConArray[0];
    } else {
        if (sort_location_list[iterator].value < sort_location_list[0].value / 7) iconcolor = iConArray[6];
            else if(sort_location_list[iterator].value<(sort_location_list[0].value*2)/7) iconcolor = iConArray[5];
            else if(sort_location_list[iterator].value<(sort_location_list[0].value*3)/7) iconcolor = iConArray[4];
            else if(sort_location_list[iterator].value<(sort_location_list[0].value*4)/7) iconcolor = iConArray[3];
            else if(sort_location_list[iterator].value<(sort_location_list[0].value*5)/7) iconcolor = iConArray[2];
            else if(sort_location_list[iterator].value<(sort_location_list[0].value*6)/7) iconcolor = iConArray[1];
            else  iconcolor = iConArray[0];
    }


    var marker = new google.maps.Marker({
        position: center,
        map: map,
        draggable: false,
        icon: iconcolor
        });

    if (search_method){
        contents = "주소 : " + sort_location_list[iterator]['addr'] + "<br />"
        
        contents += "㎡ 당 가격 평균: " + (sort_location_list[iterator]['price']).toFixed(2);
        
	    var infowindow = new google.maps.InfoWindow({
	       content: contents
	    });

	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.open(map,marker);
	    });
	}
	else{
		var infowindow = new google.maps.InfoWindow({
	       content:"주소 : " + sort_location_list[iterator]['addr'] + "<br />" + "상대가치 점수 : " + Math.round(((sort_location_list[iterator]['value'])*100))
	       //content: contentArray[iterator]
	    });

	    google.maps.event.addListener(marker, 'click', function() {
	        infowindow.open(map,marker);
	    });


	}

    iterator++;
}
