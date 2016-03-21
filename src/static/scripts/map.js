var map, places, centerMarker, infowindow;
var search = {};
var markers = [];
var hostnameRegexp = new RegExp('^https?://.+?/');
var priceList = [];
var distanceList = [];
var keywordList = [];
var price;
var distance;
var keywords = [];
var cords = {};
var cordspromise = $.Deferred();
$.getJSON("http://jsonip.com?callback=?", function (data) {
  $.getJSON("http://freegeoip.net/json/" + data.ip, function (data) {
      cords.latitude = data.latitude;
      cords.longitude = data.longitude;
      cordspromise.resolve();
  });  
});  

$("#btn-ready-pick").on("click", function(){
    var csrftoken = getCookie('csrftoken');
    var prefgrabpromise = $.ajax({
      url: window.location.href,
      type: "POST",
      data: {
        csrfmiddlewaretoken : csrftoken,
        roomname : location.search.split('?room=')[1],
        type : "grabpref"
      }
    });
    prefgrabpromise.then(function(data){
      preferences = JSON.parse(data);
      for (var i in preferences){
        var pref = preferences[i].preferences;

        // Add values into holders
        priceList.push(pref.price);
        distanceList.push(pref.distance);
        for (var j in pref.userchoices){
          keywordList.push(pref.userchoices[j]);
        }
        for (var k in pref.preferencesdefault){
          keywordList.push(pref.preferencesdefault[k]);
        }        
      }
      parsePreferences();
      pickaspotmap();
    });
})
function parsePreferences(){
  var priceRnd = priceList[Math.floor(Math.random() * priceList.length)];
  var distanceRnd = distanceList[Math.floor(Math.random() * distanceList.length)];

  // Valid values are in the range from 0 (most affordable) 
  // to 4 (most expensive), inclusive.
  if (priceRnd == "low")
    price = 1;
  else
    price = 4;

  // Decides how far the search should be
  if (distanceRnd == "walking")
    // Based on average person's walking being 1km/10 mins
    distance = 1500;
  else
    distance = 10000;

  var length = 5;
  // Just in case not enough entries
  if (keywordList.length < 5)
    length = keywordList.length;

  for (var i = 0; i < length; i++){
    var foundword = keywordList[Math.floor(Math.random() * keywordList.length)];
    var parsedword = foundword.split("food")[0];
    if( $.inArray(parsedword, keywords) == -1){
      keywords.push(parsedword);
    }
  };
  console.log(keywords)
}

function initMap() {
  cordspromise.then(function(){
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: cords.latitude, lng: cords.longitude},
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    search.location = map.getCenter();
    centerMarker = new google.maps.Marker({
          position: search.location,
          animation: google.maps.Animation.DROP,
          map: map
    });
  });
}

function pickaspotmap() {
  cordspromise.then(function(){
    $("#table-body-results").empty();
    clearMarkers();
    var zoom = 12;
    if (distance < 1500)
      zoom = 10;
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: cords.latitude, lng: cords.longitude},
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    places = new google.maps.places.PlacesService(map);
    var length = keywords.length;
    // keeps track of how many entries have been added
    var current = 0;
    // keeps track of IDs so the resturant isn't added twice
    var trackid = [];
    for (var i = 0; i < length; i++){
      // Loop won't go pass 20 markers
      if (current > 20)
        break;
      // set up search
      search.minprice = 0
      search.maxprice = price
      // do a search once of each keyword
      search.keyword = keywords[i];
      search.radius = distance;
      search.type = "restaurant";
      search.rankBy = google.maps.places.RankBy.PROMINENCE;

      search.location = map.getCenter();
      centerMarker = new google.maps.Marker({
            position: search.location,
            animation: google.maps.Animation.DROP,
            map: map
          });

      // go through data
      // Since doing multiple searches, an outside number is needed to keep track
      places.search(search, function(results, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var j = 0; j < results.length; j++) {
            if( $.inArray(results[j].place_id, trackid) == -1){
              trackid.push(results[j].place_id);
              var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (current+1) + '.png';
              markers.push(new google.maps.Marker({
                position: results[j].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: icon
              }));
              google.maps.event.addListener(markers[current], 'click', getDetails(results[j], current));
              window.setTimeout(dropMarker(current), current * 100);
              addResult(results[j], current);
              current++;
              // stops add results after 20
              if (current>20){
                break;
              }
            }
          }
        }  
      });
    }
    // Clear results for next search
    keywords = [];    
  })
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  if (centerMarker) {
    centerMarker.setMap(null);
  }
}

function dropMarker(i) {
  return function() {
    if (markers[i]) {
      markers[i].setMap(map);
    }
  }
}

function addResult(result, i) {
  var resulttab = $("#table-body-results");
  /* FORMAT
    TABLE
      TR
        TD-IMG
        TD-Text
  */
  var tr = $("<tr>");
  var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (i+1) + '.png';
  var image = $("<img>",{
    src : icon,
  })
  var tdicon = $("<td>").append(image);
  var tdtext = $("<td>",{
    text: result.name
  })
  tr.on("click", function(){
    google.maps.event.trigger(markers[i], 'click');
  });
  tr.append(tdicon);
  tr.append(tdtext);
  resulttab.append(tr);
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
      infowindow.open(map, markers[i]);        
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

