exports.refresh = function(travelMode, originLat, originLng, destinationLat, destinationLng, callback) {
    
    var origin = String(originLat + "," + originLng);
    var destination = String(destinationLat + "," + destinationLng);
    var url = "https://maps.google.fr/maps/api/directions/json?mode=" + travelMode + "&origin=" + origin + "&destination=" + destination + "&sensor=false";
    var data = {};

    var decode = function(encoded) {
        var len = encoded.length;
        var lat = 0;
        var lng = 0;
        var index = 0;
        var decoded = [];
     
        while(index < len) {
            var b;
            var shift = 0;
            var result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while(b >= 0x20);
     
            var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;
     
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while(b >= 0x20);
     
            var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;
     
            decoded.push([(lat * 1e-5), (lng * 1e-5)]);
        }
        return decoded;
    };

    var xhr = Ti.Network.createHTTPClient();
    xhr.onload = function() {
        var json = JSON.parse(this.responseText);
        var origin = json.routes[0].legs[0].start_address;
        var destination = json.routes[0].legs[0].end_address;
        var distance = json.routes[0].legs[0].distance.text;
        var duration = json.routes[0].legs[0].duration.text;
        var steps = json.routes[0].legs[0].steps;
        var instructions = steps[0].html_instructions.replace(/(<([^>]+)>)/ig, "");
        var totalSteps = steps.length;
        var points = [];

        for(var i in steps) {
            var location = steps[i].start_location;
            var locationLatitude = location.lat;
            var locationLongitude = location.lng;
            points.push({latitude: locationLatitude, longitude: locationLongitude});
            if(steps[i].polyline.points != undefined) {
                var polyPoints = decode(steps[i].polyline.points);
                for(var c in polyPoints) {
                    points.push({latitude: polyPoints[c][0], longitude: polyPoints[c][1]});
                }
            }
        }

        data = {
            origin: origin,
            destination: destination,
            distance: distance,
            duration: duration,
            instructions: instructions,
            points: points
        };

        callback(data);
    };
    xhr.open("GET", url);
    xhr.send();
};