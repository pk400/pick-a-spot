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
var cords = JSON.parse($("#lonlat-obj").text());

document.getElementById("share-link-url").value = window.location.href;

if (localStorage['lng'] && localStorage['lat']){
  cords[0] = Number(localStorage['lng']);
  cords[1] = Number(localStorage['lat']);
}

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
    distance = 8000;

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
  var parseobj = {
    price : price,
    distance : distance,
    keywords: keywords,
    cords: cords
  }
  return parseobj;
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lng: cords[0], lat: cords[1]},
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  search.location = map.getCenter();
  centerMarker = new google.maps.Marker({
        position: search.location,
        animation: google.maps.Animation.DROP,
        map: map
  });
}

function pickaspotmap(parseobj, random) {
  clearMarkers();
  $("#table-body-results").empty();
  // rewrite over so that the parseobj is the same for all clients
  if (parseobj != undefined){
    price = parseobj.price;
    distance = parseobj.distance;
    keywords = parseobj.keywords;
    cords[0] = Number(parseobj.cords[0]);
    cords[1] = Number(parseobj.cords[1]);
  }
  var zoom = 11;
  if (distance <= 1500)
    zoom = 12;

  // Creates map
  if (random == false || typeof(random) == "undefined"){
    // Only remakes map if not random
    // random is only for getting the value
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lng: cords[0], lat: cords[1]},
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    search.location = map.getCenter();
    centerMarker = new google.maps.Marker({
          position: search.location,
          animation: google.maps.Animation.DROP,
          map: map
    });
    
    if(typeof(parseobj.singleresult) != 'undefined'){
      // Displays the single result that was randomly chosen
      var result = parseobj.singleresult;
      var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (1) + '.png';
      markers.push(new google.maps.Marker({
        position: result.geometry.location,
        animation: google.maps.Animation.DROP,
        icon : icon
      }));
      google.maps.event.addListener(markers[0], 'click', getDetails(result, 1));
      window.setTimeout(dropMarker(0), 1 * 100);
      addResult(result, 0);
      // don't do anything else
      return;
    }    
  }
  else{
    map.center = {lng: cords[0], lat: cords[1]};
    map.zoom = zoom;
  }
  // Sets center
  search.location = map.getCenter();

  // set up search
  search.minprice = 0
  search.maxprice = price
  search.radius = distance;
  search.type = "food";
  search.rankBy = google.maps.places.RankBy.PROMINENCE;

  places = new google.maps.places.PlacesService(map);

  // keeps track of IDs so the restaurant isn't added twice
  var trackid = [];
  var resultslist = [];
  var i = 0;
  var displaydeffered = $.Deferred();
  var loopkeywords = function(keywords){
    // call itself
    callbacksearch(keywords[i], function(){
      // set i to next item
      i++;
      if (i < keywords.length || markers.length > 19){
        loopkeywords(keywords);
      }
      else{
        // displays the results after everything is chosen
        displaydeffered.resolve();
      }
    })
  }

  displaydeffered.done(function(){
    if (random == true){
      // only one result is needed
      var randomnumber = ~~(Math.random() * (resultslist.length));
      parseobj.singleresult = resultslist[randomnumber];
      // sends the single result to everyone
      socket.send(JSON.stringify(parseobj));
      var csrftoken = getCookie('csrftoken');
      $.ajax({
        url: window.location.href,
        type: "POST",
        data: {
          csrfmiddlewaretoken : csrftoken,
          type : "savelastresult",
          roomname : location.search.split('?room=')[1],
          results : JSON.stringify(parseobj)
        }
      });   
    }else{
      $.each(resultslist, function(i){
        var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (i+1) + '.png';
        markers.push(new google.maps.Marker({
          position: resultslist[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon : icon
        }));
        google.maps.event.addListener(markers[i], 'click', getDetails(resultslist[i], i));
        window.setTimeout(dropMarker(i), i * 100);
        addResult(resultslist[i], i);
      });
    }

  })  
  loopkeywords(keywords);
  var found = markers.length;
  function callbacksearch(keyword, callback){
    // do callback when ready
    var deferred = $.Deferred();
    search.keyword = keyword;
    places.search(search, function(results, status){
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var j = 0; j < results.length; j++) {
          if (found>19){
            break;
          }          
          if( $.inArray(results[j].place_id, trackid) == -1 && results[j].types.indexOf("restaurant") != -1){
            trackid.push(results[j].place_id);
            // used later
            resultslist.push(results[j]);
          }
        }
        deferred.resolve();
      }  
    });
    // callback when finished
    deferred.done(function(){
      callback()
    });
  }

  function parseresults(results, j){
    // Only adds if not already included or if restaurant is in the types
    if( $.inArray(results[j].place_id, trackid) == -1 && results[j].types.indexOf("restaurant") != -1){
      trackid.push(results[j].place_id);
      var icon = 'http://gmaps-samples-v3.googlecode.com/svn/trunk/places/icons/number_'+ (found+1) + '.png';
      markers.push(new google.maps.Marker({
        position: results[j].geometry.location,
        animation: google.maps.Animation.DROP,
        icon: icon
      }));
      google.maps.event.addListener(markers[found], 'click', getDetails(results[j], found));
      window.setTimeout(dropMarker(found), found * 100);
      addResult(results[j], found);
    }    
  }

  function restaurants_only(results){
    var i = results.length -1;
    var tempresultsobj = [];
    while(i > 0){
      if(results[i].types.indexOf("restaurant") != -1){
        tempresultsobj.push(results[i]);
      }      
      i--;  
    }
    return tempresultsobj;
  }

  // Clear results for next search
  keywords = [];    
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
Details for the restaurant markers
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
  content += '<td><b><a target="_blank" href="' + place.url + '">' + place.name + '</a></b></td></tr>';
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
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a target="_blank" href="' + fullUrl + '">' + website + '</a></td></tr>';
  }
  content += '</table>';
  return content;
}

$("#set-location").one("click", function(){
  var addressinput = document.getElementById('locate-address-input');
  autocomplete = new google.maps.places.Autocomplete(addressinput);  
});

$("#share-location-btn").on("click", function(){
  navigator.geolocation.getCurrentPosition(setgeolocation);
});

$("#reset-location-btn").on("click",function(){
  $("#locate-address-input").val("");
  localStorage.removeItem("lng");
  localStorage.removeItem("lat");
  cords = JSON.parse($("#lonlat-obj").text());
  clearMarkers();
  initMap();
});

$("#locate-address-btn").on("click", function(){
  var csrftoken = getCookie('csrftoken');
  $.ajax({
    url: window.location.href,
    type: "POST",
    data: {
      csrfmiddlewaretoken : csrftoken,
      type : "getlocation",
      address: $("#locate-address-input").val()
    },
    success : function(data){
      var parseval = data;
      // Occurs when user doesn't enter a correct address
      if (data != "Error"){
        parseval = JSON.parse(data);
        localStorage['lng'] = cords[0] = parseval[0];
        localStorage['lat'] = cords[1] = parseval[1];
        $("#table-body-results").empty();
        clearMarkers();
        initMap();        
      }
      else{
        alert("Please enter a correct address.");
      }
    }
  })
})

function setgeolocation(position){
  localStorage['lng'] = cords[0] = position.coords.longitude;
  localStorage['lat'] = cords[1] = position.coords.latitude;
  $("#table-body-results").empty();
  clearMarkers();
  initMap();
}

$("#email-link-auth").on("click", function(){
  $("#friend-list-share").css("display", "block");
  $("#send-email-btn").css("display", "block");

});

$("#send-email-btn").on("click", function(){
  var csrftoken = getCookie('csrftoken');
  var friendschecked = [];
  $(".checkbox-friends:checked").each(function(){
    friendschecked.push($(this).val());
  })

  $.ajax({
    url: window.location.href,
    type: "POST",
    data: {
      csrfmiddlewaretoken : csrftoken,
      type : "sendemails",
      roomlink : window.location.href,
      friends : JSON.stringify(friendschecked)
    },
    success : function(data){
        $("#friend-list-share").css("display", "none");
        $("#send-email-btn").css("display", "none");
        alert("Emails Sent");
    },
  });  

})