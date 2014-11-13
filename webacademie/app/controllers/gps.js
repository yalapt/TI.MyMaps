var placeType = Alloy.Globals.Place.get("type");
var placeDistance = "1000";
var travelMode = "driving";
var points = [];

var pos = {
    latitude: 48.8566,
    longitude: 2.35222
};

var region = {
    latitude: pos.latitude,
    longitude: pos.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
};

var startAnnotation = Alloy.Globals.Map.createAnnotation({
    pincolor: Alloy.Globals.Map.ANNOTATION_GREEN,
    latitude: pos.latitude,
    longitude: pos.longitude,
    draggable: false,
    title: "Départ",
    subtitle: ""
});

var finishAnnotation = Alloy.Globals.Map.createAnnotation({
    pincolor: Alloy.Globals.Map.ANNOTATION_GREEN,
    latitude: pos.latitude,
    longitude: pos.longitude,
    draggable: true,
    title: "Arrivée",
    subtitle: ""
});

var route = Alloy.Globals.Map.createRoute({
    points: points,
    color: "blue",
    width: 6
});

var places = function() {
    var callback = function(data, token) {
        for(var i in data) {
            var anno = Alloy.Globals.Map.createAnnotation({
                pincolor: Alloy.Globals.Map.ANNOTATION_GREEN,
                latitude: data[i].latitude,
                longitude: data[i].longitude,
                draggable: false,
                title: data[i].name,
                subtitle: data[i].address
            });
            $.mapview.addAnnotation(anno);
        }
        if(token != false) {
            setTimeout(function() {
                Alloy.Globals.Places.refresh(startAnnotation.latitude, startAnnotation.longitude, placeDistance, placeType, "", Alloy.Globals.GoogleApiKey, token, callback);
            }, 1500);
        }
    };
    Alloy.Globals.Places.refresh(startAnnotation.latitude, startAnnotation.longitude, placeDistance, placeType, "", Alloy.Globals.GoogleApiKey, "", callback);
};

var getPosition = function() {
    var callback = function(data) {
        $.labelPosition.text = "Position : " + data.origin;
    };
    Alloy.Globals.Directions.refresh(travelMode, startAnnotation.latitude, startAnnotation.longitude, finishAnnotation.latitude, finishAnnotation.longitude, callback);
};

var itineraire = function() {
    var callback = function(data) {
        if(placeType == "gps") {
            $.mapview.removeAnnotation(finishAnnotation);
            finishAnnotation.title = "Destination";
            finishAnnotation.subtitle = data.destination;
            $.mapview.addAnnotation(finishAnnotation);
        }

        $.mapview.removeRoute(route);
        route.points = data.points;
        $.mapview.addRoute(route);

        $.labelPosition.text = "Position : " + data.origin;
        $.labelDestination.text = "Destination : " + data.destination;
        $.labelTrajet.text = "Trajet : " + data.distance + ", " + data.duration;
        $.labelInstructions.text = "Instructions : " + data.instructions;
    };
    Alloy.Globals.Directions.refresh(travelMode, startAnnotation.latitude, startAnnotation.longitude, finishAnnotation.latitude, finishAnnotation.longitude, callback);
};

var getLocation = function() {
    Ti.Geolocation.getCurrentPosition(function(e) {
        if(e.success == true) {
            var startLat = ( (startAnnotation.latitude < 0) ? startAnnotation.latitude * -1 : startAnnotation.latitude );
            var startLng = ( (startAnnotation.longitude < 0) ? startAnnotation.longitude * -1 : startAnnotation.longitude );
            var newLat = ( (e.coords.latitude < 0) ? e.coords.latitude * -1 : e.coords.latitude );
            var newLng = ( (e.coords.longitude < 0) ? e.coords.longitude * -1 : e.coords.longitude );
            var diffLat = ( ( (startLat - newLat) < 0) ? (startLat - newLat) * -1 : (startLat - newLat) );
            var diffLng = ( ( (startLng - newLng) < 0) ? (startLng - newLng) * -1 : (startLng - newLng) );
            if(diffLat >= 0.0005 || diffLng >= 0.0005) {
                startAnnotation.latitude = e.coords.latitude;
                startAnnotation.longitude = e.coords.longitude;
                region.latitude = e.coords.latitude;
                region.longitude = e.coords.longitude;
                $.mapview.setLocation(region);
                itineraire();
            }
        }
    });
};

if(placeType == "gps") {
    $.mapview.addEventListener("pinchangedragstate", function(e) {
        if(e.newState == Alloy.Globals.Map.ANNOTATION_DRAG_STATE_END) {
            finishAnnotation.latitude = e.annotation.latitude;
            finishAnnotation.longitude = e.annotation.longitude;
            itineraire();
        }
    });
} else {
    $.mapview.addEventListener("click", function(e) {
        if(e.clicksource == "title" || e.clicksource == "subtitle") {
            finishAnnotation.latitude = e.annotation.latitude;
            finishAnnotation.longitude = e.annotation.longitude;
            itineraire();
        }
    });
}

var init = function() {
    Ti.Geolocation.getCurrentPosition(function(e) {
        if(e.success == true) {
            pos.latitude = e.coords.latitude;
            pos.longitude = e.coords.longitude;
            region.latitude = e.coords.latitude;
            region.longitude = e.coords.longitude;
            startAnnotation.latitude = e.coords.latitude;
            startAnnotation.longitude = e.coords.longitude;
            finishAnnotation.latitude = e.coords.latitude;
            finishAnnotation.longitude = e.coords.longitude;
            initmapview();
        }
    });
}

var initmapview = function() {
    $.mapview.setLocation(region);
    $.mapview.addRoute(route);
    getPosition();
    if(placeType == "gps") {
        $.mapview.addAnnotation(finishAnnotation);
        itineraire();
    } else {
        places();
    }

    setInterval(function() {
        getLocation();
    }, 1000);

    $.gps.open();
}

$.mapview.addEventListener('complete', function(e) {
    init();
});