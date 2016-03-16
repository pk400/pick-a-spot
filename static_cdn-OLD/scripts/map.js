var map, places, centerMarker, infowindow;
var search = {};
var markers = [];
var hostnameRegexp = new RegExp('^https?://.+?/');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.7, lng: -79.4},
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  places = new google.maps.places.PlacesService(map);
  
  // dummy data
  search.keyword = "Pizza";
  search.types = "restaurant";
  search.rankBy = google.maps.places.RankBy.DISTANCE;
  search.location = map.getCenter();
  centerMarker = new google.maps.Marker({
        position: search.location,
        animation: google.maps.Animation.DROP,
        map: map
      });


places.search(search, function(results, status){
	// dummy value
	var i = Math.floor(Math.random() * (20 - 0 + 1)) + 1;
	var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (1) + '.png';
	// Setting marker points
	markers.push(new google.maps.Marker({
		position: results[i].geometry.location,
		animation: google.maps.Animation.DROP,
		icon: icon
	}));
	google.maps.event.addListener(markers[0], 'click',
	getDetails(results[i], i));
	// Adds to screen with animation
	window.setTimeout(markers[0].setMap(map), i * 100);
	console.log(markers);
});	
}
/*
Details for the resturant markers
*/
function getDetails(result, i) {
  return function() {
    places.getDetails({
        reference: result.reference
    }, showInfoWindow(i));
  }
}
/*
Windows that display the info inside the marker
*/
function showInfoWindow(i) {
  return function(place, status) {
    // Closes other windows when one is clicked
    if (infowindow) {
      infowindow.close();
      infowindow = null;
    }

    // Displays window
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      infowindow = new google.maps.InfoWindow({
        content: getIWContent(place)
      });
      infowindow.open(map, markers[0]);        
    }
  }
}

/*
Stolen from internet that displays the bubble
*/
function getIWContent(place) {
  var content = '';
  content += '<table>';
  content += '<tr class="iw_table_row">';
  content += '<td style="text-align: right"><img class="hotelIcon" src="' + place.icon + '"/></td>';
  content += '<td><b><a href="' + place.url + '">' + place.name + '</a></b></td></tr>';
  content += '<tr class="iw_table_row"><td class="iw_attribute_name">Address:</td><td>' + place.vicinity + '</td></tr>';
  if (place.formatted_phone_number) {
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Telephone:</td><td>' + place.formatted_phone_number + '</td></tr>';      
  }
  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    }
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Rating:</td><td><span id="rating">' + ratingHtml + '</span></td></tr>';
  }
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website == null) { 
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a href="' + fullUrl + '">' + website + '</a></td></tr>';
  }
  content += '</table>';
  return content;
}