document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. REDIRECT IF ALREADY LOGGED IN ---
    const existingLogin = localStorage.getItem('loggedInEmail');
    if (existingLogin) {
        window.location.href = "https://sites.google.com/view/5titanium2024/member-dashboard";
        return; 
    }

    let currentUser = null;
    let loggedInEmailString = ""; 

    // Navbar Scroll Logic for Login Page
    const topMenu = document.getElementById('top-menu');
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 10) {
            topMenu.classList.add('scrolled');
        } else {
            topMenu.classList.remove('scrolled');
        }
    });

    const sheetId = '11fZl1_k9Txz6zXZqZnZuKcH5PtF6QQuY';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    // --- ENTER KEY LOGIC ---
    document.getElementById('email-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('next-btn').click();
        }
    });

    document.getElementById('password-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('signin-btn').click();
        }
    });

    // --- CLEAR ERROR ON RETYPE ---
    document.getElementById('password-input').addEventListener('input', function() {
        document.getElementById('password-error').textContent = "";
    });

    // --- STEP 1: Verify Email ---
    document.getElementById('next-btn').addEventListener('click', () => {
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

        Papa.parse(csvUrl, {
            download: true,
            header: false,
            complete: function(results) {
                nextBtn.disabled = false;
                errorMsg.style.color = "#d93025"; 
                
                try {
                    const data = results.data;
                    
                    const headerRowIndex = data.findIndex(row => 
                        row[0] && row[0].toString().trim().toLowerCase() === 'name'
                    );
                    
                    if (headerRowIndex === -1) {
                        errorMsg.textContent = "Database error: Cannot find sheet headers.";
                        return;
                    }

                    const headers = data[headerRowIndex].map(h => h ? h.trim() : '');
                    
                    const usersData = data.slice(headerRowIndex + 1).map(row => {
                        let userObj = {};
                        headers.forEach((headerName, index) => {
                            userObj[headerName] = row[index] ? row[index].trim() : '';
                        });
                        return userObj;
                    });

                    currentUser = usersData.find(u => {
                        const emailKey = Object.keys(u).find(k => k.toLowerCase() === 'email');
                        if (!emailKey || !u[emailKey]) return false;
                        
                        const emailList = u[emailKey].split(',').map(e => e.trim().toLowerCase());
                        return emailList.includes(emailInput.toLowerCase());
                    });

                    if (!currentUser) {
                        errorMsg.textContent = "Email not found in our records.";
                        return;
                    }

                    loggedInEmailString = emailInput; 
                    errorMsg.textContent = "";
                    
                    // Fetch Name from Sheet
                    const nameKey = Object.keys(currentUser).find(k => k.toLowerCase() === 'name');
                    const displayUserName = nameKey && currentUser[nameKey] ? currentUser[nameKey] : loggedInEmailString;

                    document.getElementById('step-email').style.display = 'none';
                    document.getElementById('step-password').style.display = 'block';
                    document.getElementById('display-name').textContent = displayUserName;
                    
                } catch (err) {
                    console.error(err);
                    errorMsg.textContent = "Error processing data.";
                }
            },
            error: function() {
                nextBtn.disabled = false;
                errorMsg.style.color = "#d93025";
                errorMsg.textContent = "Network error. Please check your internet connection.";
            }
        });
    });

    // --- GO BACK: Change Email ---
    document.getElementById('change-email').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('step-password').style.display = 'none';
        document.getElementById('step-email').style.display = 'block';
        document.getElementById('password-input').value = ""; 
        document.getElementById('password-error').textContent = "";
    });

    // --- PASSWORD VISIBILITY TOGGLE ---
    document.getElementById('toggle-password').addEventListener('click', function() {
        const pwdInput = document.getElementById('password-input');
        if (pwdInput.type === 'password') {
            pwdInput.type = 'text';
            this.textContent = 'hide';
        } else {
            pwdInput.type = 'password';
            this.textContent = 'show';
        }
    });

    // --- STEP 2: Verify Password and Login ---
    document.getElementById('signin-btn').addEventListener('click', () => {
        const pwdInput = document.getElementById('password-input').value;
        const errorMsg = document.getElementById('password-error');
        const signinBtn = document.getElementById('signin-btn');
        
        // Disable button and show "Verifying..." status
        errorMsg.style.color = "#333";
        errorMsg.textContent = "Verifying password, please wait...";
        signinBtn.disabled = true;

        // Artificial 1-second delay
        setTimeout(() => {
            signinBtn.disabled = false;
            
            const pwdKey = Object.keys(currentUser).find(k => k.toLowerCase() === 'password');
            const actualPassword = pwdKey ? currentUser[pwdKey] : '';

            if (pwdInput !== actualPassword) {
                errorMsg.style.color = "#d93025"; // Back to red for error
                errorMsg.textContent = "Password incorrect";
                return;
            }

            // Success: clear message and redirect
            errorMsg.textContent = "";
            localStorage.setItem('loggedInEmail', loggedInEmailString);
            window.location.href = "https://sites.google.com/view/5titanium2024/member-dashboard";
            
        }, 1000); // 1000 milliseconds = 1 second
    });
});
