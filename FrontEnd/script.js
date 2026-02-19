const tokenName = 'SophieApiToken';
let projects = [];
let filter = 0;

// ------ MAINS FUNCTION ------
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
            //run dev

            return;
        }
        
        sessionStorage.setItem(tokenName, response.token);
        window.location.href = "/index.html";
    });
}

function initLogged() {
    let components = document.querySelectorAll('.is-connected');
    for (let i = 0; i < components.length; i++) {
        components[i].classList.remove('hidden'); 
    }

    components = document.querySelectorAll('.is-deconnected');
    for (let i = 0; i < components.length; i++) {
        components[i].classList.add('hidden'); 
    }

    let openModalBtn = document.getElementById('open-modal');
    openModalBtn.classList.add('cursor-pointer');
    
    document.getElementById('logout-button').addEventListener('click', logout);
    openModalBtn.addEventListener('click', switchOpenModal);
    document.getElementById('close-modal').addEventListener('click', switchOpenModal );
}

async function getProject() {
    let projectsHolder = document.querySelector('#gallery');
    
    if ( projectsHolder == null ) {
        return;
    }

    projects = await callAPI( 
        "works", 
        "GET"
    ); // id / title / imageUrl / categoryId / UserId
    
    renderProject();
    renderModalProject();
}

function renderProject() {
    let projectsHolder = document.querySelector('#gallery');

    projectsHolder.innerHTML = "";

    for (let i = 0; i < projects.length; i++) {
        if ( projects[i].categoryId != filter && filter != 0 ) {
            continue;
        }

        let figure = document.createElement('figure');
        let img = document.createElement('img');
        img.setAttribute('src', projects[i].imageUrl)
        let figcaption = document.createElement('figcaption');
        figcaption.innerHTML = projects[i].title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        projectsHolder.appendChild(figure);
    }
}

function renderModalProject() {
    let modalGallery = document.querySelector('#modal-gallery');

    modalGallery.innerHTML = "";

    for (let i = 0; i < projects.length; i++) {
        let figure = document.createElement('figure');
        let img = document.createElement('img');
        img.setAttribute('src', projects[i].imageUrl);

        let span = document.createElement('span');
        span.classList.add('delete');
        span.addEventListener('click', deleteProject);
        span.dataset['index'] = projects[i].id
        
        let trashcan = document.createElement('i');
        trashcan.classList.add('fa-solid', 'fa-trash-can');
        span.appendChild(trashcan);

        figure.appendChild(img);
        figure.appendChild(span);
        modalGallery.appendChild(figure);
    }
}

async function initFilter() {
    let categories = await callAPI( 
        "categories", 
        "GET"
    );

    let filter = document.getElementById('filter');

    for (let i = 0; i < categories.length; i++) {
        let button = document.createElement('button');
        button.dataset['index'] = categories[i].id;
        button.classList.add('btn');
        button.innerHTML = categories[i].name;
        button.addEventListener('click', filterProject);
        filter.appendChild(button);
    }

    document.querySelector('#filter .all').addEventListener('click', filterProject);

}

function filterProject(e) {
    let target = e.target
    let buttons = document.querySelectorAll('#filter button');

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('selected');
    }
    target.classList.add('selected');

    filter = target.dataset.index;
    renderProject();
}

async function deleteProject(e) {
    let confirmation = await confirm('Voulez vous supprimer le projet ?');
    if ( !confirmation) {
        return;
    }

    let target = e.target;
    while (! target.classList.contains('delete') ) {
        target = target.parentNode;
    }

    let index = target.dataset.index;
    
    let response = await callAPI( 
        "works/"+index, 
        "DELETE"
    );

    getProject();
}

// ------ INIT ALL ------

function init () {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('login')) {
            initLogin();
            return;
        }

        getProject();

        if ( isLogged() ) {
            initLogged();
        }
        else {
            initFilter();
        }
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

function logout() {
    sessionStorage.removeItem(tokenName);
    location.reload();
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