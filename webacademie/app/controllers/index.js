$.buttonGps.addEventListener("click", function(e) {
	Alloy.Globals.Place.save({type: "gps"});
	var gps = Alloy.createController("gps").getView();
    gps.open();
});
$.buttonHotel.addEventListener("click", function(e) {
	Alloy.Globals.Place.save({type: "lodging"});
	var gps = Alloy.createController("gps").getView();
    gps.open();
});
$.buttonRestaurant.addEventListener("click", function(e) {
	Alloy.Globals.Place.save({type: "restaurant|food"});
	var gps = Alloy.createController("gps").getView();
    gps.open();
});
$.buttonExit.addEventListener("click", function(e) {
    $.index.close();
});

$.index.open();