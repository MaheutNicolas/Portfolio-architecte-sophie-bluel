const tokenName = 'SophieApiToken';

// ------ MAIN FUNCTION ------
function initLogin() {
    let form = document.querySelector('#login form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let response = await callAPI( 
            "users/login", 
            "POST", 
            { 
                "email" : form.querySelector('[name="email"]').value,
                "password" : form.querySelector('[name="password"]').value
            }
            
        );

        if ( response === false ) {
            return;
        }
        
        sessionStorage.setItem(tokenName, response.token);
        window.location.href = "/index.html";
    });
}

function initLogged() {
    if ( !isLogged() ) {
        return;
    }

    let editorMessage = document.getElementById('editor-message');
    if (editorMessage) {
        editorMessage.classList.remove('hidden');
    }

    document.querySelector('#projets .title i').classList.remove('hidden');

    console.log('test');
    
    let openModal = document.getElementById('open-modal');
    openModal.addEventListener('click', switchOpenModal )
    let closeModal = document.getElementById('close-modal');
    closeModal.addEventListener('click', switchOpenModal )

}

async function getProject() {
    let projectsHolder = document.querySelector('#gallery');
    
    if ( projectsHolder == null ) {
        return;
    }

    let response = await callAPI( 
        "works", 
        "GET"
    ); // id / title / imageUrl / categoryId / UserId

    console.log(response);
    
    let length = response.length;
    projectsHolder.innerHTML = "";

    if ( length == 0 ) {
        return;
    }

    for (let i = 0; i < length; i++) {
        let figure = document.createElement('figure');
        let img = document.createElement('img');
        img.setAttribute('src', response[i].imageUrl)
        let figcaption = document.createElement('figcaption');
        figcaption.innerHTML = response[i].title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        projectsHolder.appendChild(figure);
    }
}

// ------ INIT ALL ------

function init () {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('login')) {
            initLogin();
            return;
        }
        getProject();
        initLogged();
    });
}


// ------ HELPERS ------

async function callAPI( url = "", method = "GET", data = [] ) {
    let defaultUrl = "http://localhost:5678/api/";
    return await fetch(
        defaultUrl+url,
        {
            method: method,
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            },
            body: method != "GET" ? JSON.stringify(data) : null
        }
    )
    .then( response => {
        if ( response.status != 200 && response.status != 201 ) {
            return false;
        }
        return response.json();
    })
}

function isLogged() {
    let token = sessionStorage.getItem(tokenName);
    if ( token ) {
        return true;
    }
    return false;
}

function getToken() {
    return sessionStorage.getItem(tokenName);
}

function switchOpenModal() {
    let modal = document.getElementById('modal-background');
    if ( modal.classList.contains('hidden') ) {
        modal.classList.remove('hidden');
        return;
    }
    modal.classList.add('hidden');
}


init();