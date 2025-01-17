app.sso = function () {

    function updateUser() {
        if (keycloak.authenticated) {
            keycloak.updateToken().success(function () {
                saveTokens();

                $('li.login').show();
                $('li.login a').attr("href", keycloak.createAccountUrl())
            }).error(clearTokens);
        } else {
            $('li.login').show();
            $('li.login a').on('click',function(e){
                e.preventDefault();
                keycloak.login();
            });
        }
    }

    function saveTokens() {
        if (keycloak.authenticated) {
            var tokens = {token: keycloak.token, refreshToken: keycloak.refreshToken};
            if (localStorage) {
                localStorage.token = JSON.stringify(tokens);
            } else {
                document.cookie = 'token=' + btoa(JSON.stringify(tokens));
            }
        } else {
            if (localStorage) {
                delete localStorage.token;
            } else {
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            }
        }
    }

    function loadTokens() {
        if (localStorage) {
            if (localStorage.token) {
                return JSON.parse(localStorage.token);
            }
        } else {
            var name = 'token=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];

                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }

                if (c.indexOf(name) == 0) {
                    return JSON.parse(atob(c.substring(name.length, c.length)));
                }
            }
        }
    }
    
    function clearTokens() {
        keycloak.clearToken();
        if (localStorage) {
            localStorage.token = "";
        } else {
            document.cookie = 'token=' + btoa("");
        }
    }

    var keycloak = Keycloak({
        url: app.ssoConfig.auth_url,
        realm: 'rhd',
        clientId: 'web'
    });
    var tokens = loadTokens();
    var init = {onLoad: 'check-sso', checkLoginIframeInterval: 10};
    if (tokens) {
        init.token = tokens.token;
        init.refreshToken = tokens.refreshToken;
    }

    keycloak.onAuthLogout = updateUser;

    keycloak.init(init).success(function (authenticated) {
        updateUser(authenticated);
        saveTokens();
    }).error(function () {
        updateUser();
    });
};


// Call app.sso() straight away, the call is slow, and enough of the DOM is loaded by this point anyway
app.sso();

