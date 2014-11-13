exports.refresh = function(locationLat, locationLng, locationRadius, placeTypes, placeSearch, googleApiKey, pageToken, callback) {
    
    var location = String(locationLat + "," + locationLng);
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + location + "&radius=" + locationRadius + "&types=" + placeTypes + "&name=" + placeSearch + "&key=" + googleApiKey + "&pagetoken=" + pageToken;
    var data = [];

    var xhr = Ti.Network.createHTTPClient();
    xhr.onload = function() {
        var json = JSON.parse(this.responseText);
        var results = json.results;
        var token = false;
        if(json.next_page_token != undefined) {
            token = json.next_page_token;
        }
        for(var i in results) {
            var elem = {
                latitude: results[i].geometry.location.lat,
                longitude: results[i].geometry.location.lng,
                name: results[i].name,
                address: results[i].vicinity
            }
            data.push(elem);
        }
        callback(data, token);
    };
    xhr.open("GET", url);
    xhr.send();
};