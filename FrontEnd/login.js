import { setToken } from "./helper.js";
import { callAPI } from "./helper.js";

// ------ MAINS FUNCTION ------
function initLogin() {
    let form = document.querySelector('#login form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log();
        
        document.querySelector('.error').classList.add('hidden');
        let response = await callAPI( 
            "users/login", 
            "POST", 
            { 
                "email" : form.querySelector('[name="email"]').value,
                "password" : form.querySelector('[name="password"]').value
            }
        );

        if ( response === false ) {
            document.querySelector('.error').classList.remove('hidden');
            return;
        }
        setToken(response.token);
        
        window.location.href = "/index.html";
    });
}

// ------ INIT ALL ------
function init () {
    document.addEventListener('DOMContentLoaded', async () => {
        initLogin();
    });
}

init();