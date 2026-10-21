const API_URL = "https://script.google.com/macros/s/AKfycbzw2o9EId0F0SgBNJtTQCP9qQ_x956ZLc9KT326F6WBPq2-rHGgeMKCH1SOEz0KlHwv/exec";

document.addEventListener('DOMContentLoaded', () => {
    const existingLogin = localStorage.getItem('loggedInEmail');
    if (existingLogin) {
        window.location.href = "https://sites.google.com/view/5titanium2024/member-dashboard";
        return; 
    }

    let loggedInEmailString = ""; 

    // Navbar & Mobile Logic
    const topMenu = document.getElementById('top-menu');
    window.addEventListener('scroll', () => {
        if ((window.pageYOffset || document.documentElement.scrollTop) > 10) topMenu.classList.add('scrolled');
        else topMenu.classList.remove('scrolled');
    });

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');

    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => { mobileDrawer.classList.add('open'); drawerOverlay.style.display = 'block'; });
        closeDrawerBtn.addEventListener('click', () => { mobileDrawer.classList.remove('open'); drawerOverlay.style.display = 'none'; });
        drawerOverlay.addEventListener('click', () => { mobileDrawer.classList.remove('open'); drawerOverlay.style.display = 'none'; });
    }

    // Enter Key Logic
    document.getElementById('email-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('next-btn').click(); }
    });
    document.getElementById('password-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('signin-btn').click(); }
    });
    document.getElementById('password-input').addEventListener('input', function() {
        document.getElementById('password-error').textContent = "";
    });

    // STEP 1: VERIFY EMAIL SECURELY
    document.getElementById('next-btn').addEventListener('click', async () => {
        const emailInput = document.getElementById('email-input').value.trim();
        const errorMsg = document.getElementById('email-error');
        const nextBtn = document.getElementById('next-btn');
        
        if (!emailInput || !emailInput.includes('@')) {
            errorMsg.textContent = "Please enter a valid email address.";
            return;
        }

        errorMsg.style.color = "#333";
        errorMsg.textContent = "Checking records, please wait...";
        nextBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}?action=checkEmail&email=${encodeURIComponent(emailInput)}`);
            const data = await response.json();
            
            nextBtn.disabled = false;
            if (!data.success) {
                errorMsg.style.color = "#d93025"; 
                errorMsg.textContent = data.error || "Email not found in our records.";
                return;
            }

            loggedInEmailString = emailInput; 
            errorMsg.textContent = "";
            document.getElementById('step-email').style.display = 'none';
            document.getElementById('step-password').style.display = 'block';
            document.getElementById('display-name').textContent = data.name;

        } catch (err) {
            nextBtn.disabled = false;
            errorMsg.style.color = "#d93025";
            errorMsg.textContent = "Network error. Please try again.";
        }
    });

    document.getElementById('change-email').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('step-password').style.display = 'none';
        document.getElementById('step-email').style.display = 'block';
        document.getElementById('password-input').value = ""; 
        document.getElementById('password-error').textContent = "";
    });

    document.getElementById('toggle-password').addEventListener('click', function() {
        const pwdInput = document.getElementById('password-input');
        if (pwdInput.type === 'password') { pwdInput.type = 'text'; this.textContent = 'hide'; } 
        else { pwdInput.type = 'password'; this.textContent = 'show'; }
    });

    // STEP 2: VERIFY PASSWORD SECURELY
    document.getElementById('signin-btn').addEventListener('click', async () => {
        const pwdInput = document.getElementById('password-input').value;
        const errorMsg = document.getElementById('password-error');
        const signinBtn = document.getElementById('signin-btn');
        
        errorMsg.style.color = "#333";
        errorMsg.textContent = "Verifying password, please wait...";
        signinBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}?action=login&email=${encodeURIComponent(loggedInEmailString)}&password=${encodeURIComponent(pwdInput)}`);
            const data = await response.json();

            setTimeout(() => {
                signinBtn.disabled = false;
                if (!data.success) {
                    errorMsg.style.color = "#d93025"; 
                    errorMsg.textContent = data.error || "Password incorrect";
                    return;
                }
                errorMsg.textContent = "";
                localStorage.setItem('loggedInEmail', loggedInEmailString);
                window.location.href = "https://sites.google.com/view/5titanium2024/member-dashboard";
            }, 1000); 

        } catch (err) {
            signinBtn.disabled = false;
            errorMsg.style.color = "#d93025";
            errorMsg.textContent = "Network error. Please try again.";
        }
    });
});
