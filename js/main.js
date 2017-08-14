function startApp() {

    //Kinvey info
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_ryGHXTOvb";
    const kinveyAppSecret = "e708ad84ba49439287fbd21d985b4950";
    const kinveyAppAuthHeaders = {
        "Authorization": "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };

    //Clear user auth data
    sessionStorage.clear();

    showHideMenuLinks();

    //Bind the navigation menu links
    $('#linkHome').click(showHomeView);

    $('#linkEvents').click(showEventsView);
    $('.homeRedirect').click(showEventsView);

    $('#linkLogin').click(showLoginView);
    $('#loginRedirect').click(showLoginView);

    $('#linkRegister').click(showRegisterView);
    $('#registerRedirect').click(showRegisterView);

    $('#linkAccount').click(showMyAccountView);
    $('#linkCart').click(showCartView);
    $('#linkAdmin').click(showAdminView);
    $('#linkLogout').click(logoutUser);

    //Bind the form submit buttons
    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#buttonCreateEvent').click(createEvent);
    //TO DO...

    //Click to hide #infoBox and #errorBox
    $('#infoBox').click(function () {
        $('#infoBox').fadeOut();
    });

    $('#errorBox').click(function () {
        $('#errorBox').fadeOut();
    });

    //Attach AJAX "loading" event listener
    $(document).on({
            ajaxStart: function () {
                $('#loadingBox').show()
            },
            ajaxStop: function () {
                $('#loadingBox').hide()
            }
        }
    );

    function showHideMenuLinks() {
        $('#menu').find('a').hide();
        //Logged in user
        if (sessionStorage.getItem("authToken")) {
            $('#linkHome').hide();
            $('#linkEvents').show().css("font-size", "20px");
            $('#linkAccount').show();
            $('#linkCart').show();
            $('#linkAdmin').show();
            $('#linkLogout').show();
        } else {
            $('#linkHome').show().css("font-size", "22px");
            $('#linkEvents').show().css("font-size", "22px");
            $('#linkLogin').show().css("font-size", "22px");
            $('#linkRegister').show().css("font-size", "22px");
            /*            $('#linkHome').show();
             $('#linkEvents').show();
             $('#linkLogin').show();
             $('#linkRegister').show();
             $('#linkAccount').show();
             $('#linkCart').show();
             $('#linkAdmin').show();
             $('#linkLogout').show();*/
        }
    }

    //Hides/Shows sections relative to the menu link
    function showView(viewName) {
        $('#main').find('section').hide();
        $('#' + viewName).show();
        $('.footer-top').hide();
    }

    //Bind the navigation menu links - functions
    function showHomeView() {
        showView("viewHome");
    }

    function showEventsView() {
        showView("viewEvents");
    }

    function showLoginView() {
        showView("viewLogin");
        $('#formLogin').trigger("reset");
    }

    function showRegisterView() {
        showView("viewRegister");
        $('#formRegister').trigger("reset");
    }

    function showMyAccountView() {
        showView("viewMyAccount");
    }

    function showCartView() {
        showView("viewCart");
    }

    function showAdminView() {
        $('#formEditEvent').trigger("reset");
        $('#formCreateEvent').trigger("reset");
        showView("viewAdmin");
    }

    function logoutUser() {

    }

    //Bind the form submit buttons - functions
    function loginUser() {

    }

    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passw]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            data: JSON.stringify(userData),
            contentType: "application/json",
            headers: kinveyAppAuthHeaders,
            success: registerUserSuccess,
            error: ajaxError
        });

        function registerUserSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showEventsView();
            showInfo("User registration successful.")
        }
    }

    function saveAuthInSession(userInfo) {
        sessionStorage.setItem("username", userInfo.username);
        sessionStorage.setItem("authToken", userInfo._kmd.authToken);
        $('#loggedInUser').empty();
        $('#loggedInUser').text("Hello, " + userInfo.username + "!");
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000);
    }


    function ajaxError() {
        alert("Ajax Error!")
    }

    function createEvent() {

    }
}