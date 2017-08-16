function startApp() {

    //Kinvey info
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_ryGHXTOvb";
    const kinveyAppSecret = "e708ad84ba49439287fbd21d985b4950";
    const kinveyAppAuthHeaders = {
        "Authorization": "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };

    function getKinveyUserAuthHeaders() {
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem("authtoken")
        }
    }

//Clear user auth data
//    sessionStorage.clear();
    showHideMenuLinks();

//Bind the navigation menu links
    $('#linkHome').click(showHomeView);

    $('#linkEvents').click(showEventsView);
    $('.homeRedirect').click(showEventsView);

    $('#linkLogin').click(showLoginView);
    $('#linkCreate').click(showCreateView);
    $('#linkEdit').click(showEditView);

    $('#linkRegister').click(showRegisterView);
    $('#registerRedirect').click(showRegisterView);

    $('#linkAccount').click(showMyAccountView);
    $('#linkCart').click(showCartView);

    $('#linkLogout').click(logoutUser);

//Bind the form submit buttons
    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#buttonCreateEvent').click(createEvent);
    $('#buttonEditEvent').click(editEvent);
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
        if (sessionStorage.getItem("authtoken")) {
            $('#linkHome').hide();
            $('#linkEvents').show().css("font-size", "20px");
            $('#linkAccount').show();
            $('#linkCart').show();
            $('#linkLogout').show();
        } else {
            $('#linkHome').show().css("font-size", "22px");
            $('#linkEvents').show().css("font-size", "22px");
            $('#linkLogin').show().css("font-size", "22px");
            $('#linkRegister').show().css("font-size", "22px");
        }
        if (sessionStorage.getItem("username") === "admin") {
            $('#linkCreate').show();
            $('#linkEdit').show();
        } else {
            $('#linkCreate').hide();
            $('#linkEdit').hide();
        }
    }

//Hides/Shows sections relative to the menu link
    function showView(viewName) {
        $('#main').find('section').hide();
        $('#' + viewName).show();
        $('.footer-top').hide();
        $('#footer-bottom').removeClass('navbar-fixed-bottom');
    }

//Bind the navigation menu links - functions
    function showHomeView() {
        showView("viewHome");
    }

    function showEventsView() {
        showView("viewEvents");
        if (sessionStorage.getItem("authtoken")) {
            $.ajax({
                method: "GET",
                url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store",
                contentType: "application/json",
                headers: getKinveyUserAuthHeaders(),
                success: loadEventsSuccess,
                error: handleAjaxError
            });
        } else {
            const kinveyUsername = "guest";
            const kinveyPassword = "guest";
            const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
            const authHeader = {
                "Authorization": "Basic " + base64auth,
                "Content-type": "application/json"
            };
            $.ajax({
                method: "GET",
                url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store",
                contentType: "application/json",
                headers: authHeader,
                success: loadEventsSuccess,
                error: handleAjaxError
            });
        }

        function loadEventsSuccess(events) {
            $('#events').empty();
            let table = $(`
                <table>
                    <tr>
                        <th>Event Star</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Currency</th>
                        <th>Tickets</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </table>`);
            for (let event of events) {
                let tr = $('<tr>');
                displayTableRow(tr, event);
                tr.appendTo(table);
            }

            $('#events').append(table);

            function displayTableRow(tr, event) {
                let links = [];

                if (sessionStorage.getItem("username") === "admin") {
                    let deleteLink = $('<a href="#">[DELETE]</a>')
                        .click(function () {
                            deleteEventById(event._id)
                        });
                    let editLink = $('<a href="#">[Edit]</a>')
                        .click(function () {
                            loadEventForEdit(event._id);
                        });
                    let hr = $('<hr>');
                    links.push(deleteLink);
                    links.push(hr);
                    links.push(editLink);

                    tr.append(
                        $('<td>').text(event.star),
                        $('<td>').text(event.category),
                        $('<td>').text(event.date),
                        $('<td>').text(event.location),
                        $('<td>').text(event.price),
                        $('<td>').text(event.currency),
                        $('<td>').text(event.tickets),
                        $('<td>').text(event.description),
                        $('<td>').append(links)
                    )
                } else {
                    let buyLink = $('<a href="#">BUY TICKET</a>');
                    links.push(buyLink);

                    tr.append(
                        $('<td>').text(event.star),
                        $('<td>').text(event.category),
                        $('<td>').text(event.date),
                        $('<td>').text(event.location),
                        $('<td>').text(event.price),
                        $('<td>').text(event.currency),
                        $('<td>').text(event.tickets),
                        $('<td>').text(event.description),
                        $('<td>').append(links).css("background", "#FE980F").css("font-style", "italic")
                    )
                }

            }
        }
    }

    function deleteEventById(eventId) {
        $.ajax({
            method: "DELETE",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store/" + eventId,
            headers: getKinveyUserAuthHeaders(),
            success: deleteEventSuccess,
            error: handleAjaxError
        });

        function deleteEventSuccess() {
            showEventsView();
            showInfo("Event deleted.");
        }
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

    function showCreateView() {
        $('#formCreateEvent').trigger("reset");
        showView("viewCreate");
    }

    function showEditView() {
        $('#formEditEvent').trigger("reset");
        showView("viewEdit");
    }

    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text("Welcome, Stranger!");
        showHideMenuLinks();
        showView("viewEvents");
        showInfo("Logout successful.");
    }

//Bind the form submit buttons - functions
    function loginUser() {
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            data: JSON.stringify(userData),
            contentType: "application/json",
            headers: kinveyAppAuthHeaders,
            success: loginUserSuccess,
            error: handleAjaxError
        });

        function loginUserSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showEventsView();
            showInfo("Login successful.");
        }
    }

    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            data: JSON.stringify(userData),
            contentType: "application/json",
            headers: kinveyAppAuthHeaders,
            success: registerUserSuccess,
            error: handleAjaxError
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
        sessionStorage.setItem("authtoken", userInfo._kmd.authtoken);
        $('#loggedInUser').empty();
        $('#loggedInUser').text("Hello, " + userInfo.username + "!");
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 5000);
    }


    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errorMsg = "Cannot connect due to network error.";
        }
        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }
        showError(errorMsg);
    }

    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

    function createEvent() {
        let eventData = {
            star: $('#formCreateEvent input[name=star]').val(),
            category: $('#formCreateEvent select[name=category]').val(),
            date: $('#formCreateEvent input[name=date]').val(),
            location: $('#formCreateEvent input[name=location]').val(),
            price: $('#formCreateEvent input[name=price]').val(),
            currency: $('#formCreateEvent select[name=currency]').val(),
            tickets: $('#formCreateEvent input[name=tickets]').val(),
            description: $('#formCreateEvent textarea[name=description]').val()
        };
        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store",
            headers: getKinveyUserAuthHeaders(),
            data: eventData,
            success: createEventSuccess,
            error: handleAjaxError
        });

        function createEventSuccess() {
            showEventsView();
            showInfo("Event created.");
        }
    }

    function editEvent() {
        let eventData = {
            star: $('#formEditEvent input[name=star]').val(),
            category: $('#formEditEvent select[name=category]').val(),
            date: $('#formEditEvent input[name=date]').val(),
            location: $('#formEditEvent input[name=location]').val(),
            price: $('#formEditEvent input[name=price]').val(),
            currency: $('#formEditEvent select[name=currency]').val(),
            tickets: $('#formEditEvent input[name=tickets]').val(),
            description: $('#formEditEvent textarea[name=description]').val()
        };
        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store/" +
            $('#formEditEvent input[name=id]').val(),
            headers: getKinveyUserAuthHeaders(),
            data: eventData,
            success: editEventSuccess,
            error: handleAjaxError
        });

        function editEventSuccess() {
            showEventsView();
            showInfo("Event edited.");
        }
    }

    function loadEventForEdit(eventId) {
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ticket-store/" + eventId,
            headers: getKinveyUserAuthHeaders(),
            success: loadEventForEditSuccess,
            error: handleAjaxError
        });

        function loadEventForEditSuccess(event) {
            $('#formEditEvent input[name=id]').val(event._id);
            $('#formEditEvent input[name=star]').val(event.star);
            $('#formEditEvent select[name=category]').val(event.category);
            $('#formEditEvent input[name=date]').val(event.date);
            $('#formEditEvent input[name=location]').val(event.location);
            $('#formEditEvent input[name=price]').val(event.price);
            $('#formEditEvent select[name=currency]').val(event.currency);
            $('#formEditEvent input[name=tickets]').val(event.tickets);
            $('#formEditEvent textarea[name=description]').val(event.description);
            showView("viewEdit");
        }
    }
}