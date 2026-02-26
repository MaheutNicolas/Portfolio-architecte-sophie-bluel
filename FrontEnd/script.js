import { callAPI } from "./helper.js";
import { sendFormData } from "./helper.js";
import { isLogged } from "./helper.js";
import { logout } from "./helper.js";
import { switchOpenModal } from "./helper.js";
import { switchModalPage } from "./helper.js";

let projects = []; // id / title / imageUrl / categoryId / UserId
let categories = []; // id, name
let filter = 0;

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

    initSwitchModal();
}

// --- Gestion des projets --- 

async function getProject() {
    let projectsHolder = document.querySelector('#gallery');
    
    if ( projectsHolder == null ) {
        return;
    }

    projects = await callAPI( 
        "works", 
        "GET"
    ); 
    
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

// --- Gestion des catégories --- 

async function getCategory() {
    categories = await callAPI( 
        "categories", 
        "GET"
    );
}

async function initFilter() {
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

// --- Gère l'envoie de nouveau projets --- 

function initPostProject() {

    //post image preview
    let fileSelector = document.getElementById("post-image");
    fileSelector.addEventListener('change', (e) => {
        let selector = e.target;
        let displayer = document.getElementById("post-displayer");
        let frame = document.querySelector("#modal .frame label");

        if (selector.value == "") {
            return;
        }

        const MAX_SIZE = 4 * 1024 * 1024;
        if (selector.files[0].size > MAX_SIZE) {
            alert(`Le fichier : ${file.name} est trop volumineux.`);
            this.value = "";
            return;
        }

        displayer.classList.remove('hidden');
        displayer.src = URL.createObjectURL(selector.files[0]);

        frame.classList.add('hidden');
        document.querySelector('#add-new-project .delete').classList.remove('hidden');
    })

    //category selector
    let selector = document.querySelector('#post-category');

    let blankOption = document.createElement('option');
    blankOption.setAttribute('value', 0);
    blankOption.innerHTML = "";
    selector.appendChild(blankOption);

    for (let i = 0; i < categories.length; i++) {
        let option = document.createElement('option');
        option.setAttribute('value', categories[i].id);
        option.innerHTML = categories[i].name;
        selector.appendChild(option);
    }

    // post function 
    document.getElementById('post-project').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = document.getElementById('post-project');
        
        let formData = new FormData();
        formData.append("image", document.getElementById("post-image").files[0]);
        formData.append("title", document.getElementById("post-title").value);    
        formData.append("category", document.getElementById("post-category").value);
        
        await sendFormData('works', formData);
        getProject();

        switchModalPage(1);
        form.reset();
        resetDisplayer();
    });

    // Remove Image 
    document.querySelector('#add-new-project .delete').addEventListener('click', resetDisplayer);

    // Add input validator
    document.querySelector('#post-image').addEventListener('change', validate);
    document.querySelector('#post-title').addEventListener('input', validate);
    selector.addEventListener('input', validate);
}

// --- Validator ---

export function validate() {
    let image = document.querySelector('#post-image');
    let title = document.querySelector('#post-title');
    let selector = document.querySelector('#post-category');

    if ( image.value == "" || title.value == "" || selector.value == 0 ) {
        document.querySelector('#post-send').disabled = true;
        return;
    }

    document.querySelector('#post-send').disabled = false;

}

function resetDisplayer() {
    let displayer = document.getElementById("post-displayer");
    let frame = document.querySelector("#modal .frame label");
    let fileSelector = document.getElementById("post-image");

    document.querySelector('#add-new-project .delete').classList.add('hidden');
    displayer.classList.add('hidden');
    displayer.src = "";
    displayer.files = [];

    frame.classList.remove('hidden');

    fileSelector.value = "";
    document.querySelector('#post-send').disabled = true;
}

// --- Filtre les projets  --- 

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

// --- Supprime les projets ---  

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
    
    await callAPI( 
        "works/"+index, 
        "DELETE"
    );

    getProject();
}

// --- Gère la modal --- 

function initSwitchModal() {
    document.getElementById('back-modal').addEventListener('click', () => {
        switchModalPage(1);
    });

    document.querySelector('#see-all-project button').addEventListener('click', () => {
        switchModalPage(2);
    });
}

// ------ INIT ALL ------

function init () {
    document.addEventListener('DOMContentLoaded', async () => {
        getProject();
        await getCategory();

        if ( !isLogged()) {
            initFilter();
            return;
        }
        
        initLogged();
        initPostProject();
    });
}

init();