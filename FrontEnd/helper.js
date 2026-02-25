const tokenName = 'SophieApiToken';

// --- Api ---

export async function callAPI( url = "", method = "GET", data = [] ) {
    let defaultUrl = "http://localhost:5678/api/";
    return await fetch(
        defaultUrl+url,
        {
            method: method,
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization" : "Bearer "+getToken()
            },
            body: method != "GET" ? JSON.stringify(data) : null
        }
    )
    .then( response => {
        if ( response.status != 200 && response.status != 201 ) {
            return false;
        }
        return response.json();
    });
}

export async function sendFormData( url = "", data ) {
    let defaultUrl = "http://localhost:5678/api/";
    return await fetch(
        defaultUrl+url,
        {
            method: "POST",
            headers: {
                "accept" : "application/json",
                "Authorization" : "Bearer "+getToken()
            },
            body: data
        }
    )
    .then( response => {
        console.log(response);
        
        if ( response.status != 200 && response.status != 201 ) {
            return false;
        }
        return response.json();
    });
}

// --- Token and loggin ---

export function isLogged() {
    let token = sessionStorage.getItem(tokenName);
    if ( token ) {
        return true;
    }
    return false;
}

export function getToken() {
    return sessionStorage.getItem(tokenName);
}

export function setToken(token) {
    sessionStorage.setItem(tokenName, token);
}

export function logout() {
    sessionStorage.removeItem(tokenName);
    location.reload();
    //window.location.href = "/login.html";
}

// --- Modal ---

export function switchOpenModal() {
    let modal = document.getElementById('modal-background');
    if ( modal.classList.contains('hidden') ) {
        modal.classList.remove('hidden');
        return;
    }
    modal.classList.add('hidden');
}

export function switchModalPage( index ) {

    let maxPage = 2;

    for (let i = 1; i <= maxPage; i++) {
        if (i == index) {
            continue;
        }

        let components = document.querySelectorAll('.step'+i);
        for (let y = 0; y < components.length; y++) {
            components[y].classList.add('hidden');
        }
    }

    let components = document.querySelectorAll('.step'+index);
    for (let i = 0; i < components.length; i++) {
        components[i].classList.remove('hidden');
    }
}

