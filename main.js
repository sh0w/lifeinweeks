$(function() {
    life = $("#life");
    formContainer = $("#formContainer");
    errorMsg = $("#errorMsg");
    result = $("#result");
    resultLived = result.find(".lived");
    resultRemaining = result.find(".remaining");
    about = $("#about");
    about.hide();
    
    getCountries();
    
    $("#form").submit(function(event) {
        event.preventDefault();
        $("input[type='submit']").attr("disabled", true);
        hideErrorMsg();
        
        var sex = $("input[name='sex']:checked").val();
        var country = $("select[name='country'] option:selected").val();
        var month = $("select[name='month'] option:selected").val();
        var day = $("input[name='day']").val();
        var year = $("input[name='year']").val();
        var timeLived = calcYearsLived(year, month, day);
        var yearsLived = Math.floor(timeLived);
        var monthsLived = Math.floor((timeLived % 1) * 12);
        var daysLived = Math.floor((((timeLived % 1) * 12) % 1) * 30);
        
        var ageFormatted = yearsLived + "y" + monthsLived + "m" + daysLived + "d";
        
        var today = new Date();
        var todayFormatted = today.getFullYear() + "-" + (1+today.getMonth()) + "-" + today.getDate();
        
        if( sex && country && month && day && day > 0 && day <= 31 && year && month != "Month" && country != "Country") {
            // request to population.io API:
            $.getJSON("http://api.population.io:80/1.0/life-expectancy/remaining/"+
                      sex+"/"+country+"/"+todayFormatted+"/"+ageFormatted+"/", function(data) {
                        
                var weeksRemaining = Math.floor(yearsToWeeks(data.remaining_life_expectancy));
                var weeksLived = Math.floor(yearsToWeeks(timeLived));
                life.html("");
                  
                formContainer.fadeOut("slow", function() {
                    result.show();
                    resultLived.html("You have been alive for "+ weeksLived +" weeks now.");
                    
                    resultLived.fadeIn("slow", function() {
                        drawWeeksLived(weeksLived);
                        setTimeout(function() {
                            resultRemaining.append(" Your remaining life expectancy is " + weeksRemaining +" weeks.<br>");
                            drawWeeksRemaining(weeksRemaining);
                            resultRemaining.fadeIn("slow");
                        }, 3000);
                    });
                    
                });
            })
            .success(function() {  })
            .error(function(data) {
                showErrorMsg("<b>Sorry, something went wrong:</b> " + data.responseJSON.detail);
                $("input[type='submit']").removeAttr("disabled"); // enable submit button again
            });
        } else {
            showErrorMsg("Please enter your data.");
            $("input[type='submit']").removeAttr("disabled"); // enable submit button again
        }
        
    });
    
    $("#openAbout").click(function(e) {
        e.preventDefault();
        about.fadeIn();
    });
    $("#closeAbout").click(function(e) {
        e.preventDefault();
        about.fadeOut();
    });
});


var getCountries = function() {
    $.getJSON("http://api.population.io:80/1.0/countries", function(data) {
        var items = [];
        $.each( data.countries, function( key, val ) {
          items.push( "<option id='" + key + "'>" + val + "</option>" );
        });
       
        $(items.join( "" )).appendTo( "#countries" );
    });
}

var drawWeeksLived = function(weeks) {
    for (i = 0; i < weeks; i++) {
        var w = $('<div class="week past" style="display: none;"></div>');
        life.append(w);
    }
    life.find(".week.past").each(function(index) {
        setTimeout(function(param1) {
            $(param1).show();
        }, index, this);
    });
}

var drawWeeksRemaining = function(weeks) {
    for (i = 0; i < weeks; i++) {
        var w = $('<div class="week remaining" style="display: none;"></div>');
        life.append(w);
    }
    life.find(".week.remaining").each(function(index) {
        setTimeout(function(param1) {
            param1.show();
        }, index, $(this));
    });
}

var calcYearsLived = function(year, month, day) {
    var oneYear = 365.25*24*60*60*1000.0;
    var today = new Date();
    // month - 1 because it starts counting at 0:
    var born = new Date(year, month-1, day);

    return Math.abs((today.getTime() - born.getTime())/(oneYear));
}

var yearsToWeeks = function(years) {
    return years * 52;
}

var showErrorMsg = function(msg) {
    errorMsg.html(msg);
    errorMsg.fadeIn();
}
var hideErrorMsg = function() {
    errorMsg.hide();
}