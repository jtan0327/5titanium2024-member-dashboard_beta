const API_URL = "https://script.google.com/macros/s/AKfycbzw2o9EId0F0SgBNJtTQCP9qQ_x956ZLc9KT326F6WBPq2-rHGgeMKCH1SOEz0KlHwv/exec";

document.addEventListener('DOMContentLoaded', () => {
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    if (!loggedInEmail) {
        window.location.href = "login.html";
        return; 
    }
    
    // Navbar & Drawer Logic
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

    // Tabs Logic
    const tabs = ['profile', 'achievement', 'points', 'status'];
    function switchTab(tabName) {
        tabs.forEach(t => {
            document.getElementById(`section-${t}`).style.display = (t === tabName) ? 'block' : 'none';
            document.getElementById(`menu-${t}`).classList.toggle('active', t === tabName);
        });
    }
    tabs.forEach(t => {
        document.getElementById(`menu-${t}`).addEventListener('click', (e) => { e.preventDefault(); switchTab(t); });
    });
    document.getElementById('link-member-status').addEventListener('click', (e) => { e.preventDefault(); switchTab('status'); });

    document.getElementById('menu-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInEmail'); 
        window.location.href = "login.html"; 
    });

    // Helpers
    function populateRoles(roleString, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; 
        if (!roleString || roleString.trim() === '-') return;
        roleString.split(',').forEach(role => {
            if (role.trim()) {
                const li = document.createElement('li');
                li.textContent = role.trim();
                container.appendChild(li);
            }
        });
    }

    function parsePlanFeatures(rawText) {
        const lines = rawText.split('\n');
        const listEl = document.getElementById('plan-includes');
        listEl.innerHTML = '';
        if (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
        
        let currentMainItem = null;
        let subList = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed === '') {
                const spacer = document.createElement('li');
                spacer.style.height = '15px'; spacer.style.listStyle = 'none';
                listEl.appendChild(spacer);
                currentMainItem = null; subList = null; 
                return;
            }
            let formattedText = trimmed.replace(/\\n/g, '<br><span style="display:inline-block; width: 18px;"></span>');
            if (formattedText.startsWith('-')) {
                if (!subList) {
                    subList = document.createElement('ul');
                    if(currentMainItem) currentMainItem.appendChild(subList);
                    else listEl.appendChild(subList);
                }
                const subLi = document.createElement('li');
                subLi.innerHTML = formattedText.substring(1).trim();
                subList.appendChild(subLi);
            } else {
                currentMainItem = document.createElement('li');
                currentMainItem.innerHTML = `✓ ${formattedText}`;
                listEl.appendChild(currentMainItem);
                subList = null; 
            }
        });
    }

    // MAIN FETCH LOGIC (Secure API Call)
    async function loadDashboardData() {
        try {
            const response = await fetch(`${API_URL}?action=getUserData&email=${encodeURIComponent(loggedInEmail)}`);
            const data = await response.json();
            
            if (!data.success) {
                console.error("Auth failed:", data.error);
                localStorage.removeItem('loggedInEmail');
                window.location.href = "login.html";
                return;
            }

            // 1. POPULATE PROFILE
            const profile = data.profile;
            document.getElementById('user-name').textContent = profile.name;
            document.getElementById('top-acti-role').textContent = profile.actiRole.split(',')[0].trim() ? `- ${profile.actiRole.split(',')[0].trim()}` : '';
            document.getElementById('top-asti-role').textContent = profile.astiRole.split(',')[0].trim() ? `- ${profile.astiRole.split(',')[0].trim()}` : '';
            document.getElementById('link-member-status').textContent = profile.plan;
            document.getElementById('user-email').textContent = profile.emails ? profile.emails.split(',').map(e => e.trim()).join(', ') : 'No email';
            document.getElementById('user-phone').textContent = profile.phone || 'N/A';
            document.getElementById('plan-name').textContent = profile.plan;
            populateRoles(profile.actiRole, 'acti-roles');
            populateRoles(profile.astiRole, 'asti-roles');

            const profileImg = document.getElementById('user-profile-pic');
            const baseUrl = "https://lh3.googleusercontent.com/d/";
            const defPic = (profile.gender.toUpperCase() === 'P' || profile.gender.toLowerCase() === 'female') ? '1YAXVj4nkU75hiV5U0ewPmoU3qErDMB4-' : '1rpQ4Zy42TvwZLiy3oplSDvtVeGgDgzKM';
            profileImg.src = profile.profilePicId && profile.profilePicId !== '-' ? baseUrl + profile.profilePicId : baseUrl + defPic;
            profileImg.onerror = () => { profileImg.src = baseUrl + defPic; profileImg.onerror = null; };

            // 2. POPULATE ACHIEVEMENTS
            const achContainer = document.getElementById('achievement-container');
            achContainer.innerHTML = '';
            if (data.achievements.length === 0) {
                achContainer.innerHTML = '<p class="no-record">No Record Found!</p>';
            } else {
                data.achievements.forEach(ach => {
                    if(ach.fileId) {
                        achContainer.innerHTML += `
                            <div class="achievement-card">
                                <iframe class="achievement-iframe" src="https://drive.google.com/file/d/${ach.fileId}/preview"></iframe>
                                <a class="achievement-download" href="https://drive.google.com/uc?export=download&id=${ach.fileId}" target="_blank">Click to download</a>
                                <p class="achievement-name">${ach.name}</p>
                            </div>`;
                    }
                });
            }

            // 3. POPULATE POINTS
            const ptsContainer = document.getElementById('points-history-container');
            const totalDisplay = document.getElementById('total-points-display');
            const noMsg = document.getElementById('no-points-msg');
            
            ptsContainer.innerHTML = '';
            if (data.points.length === 0) {
                totalDisplay.textContent = "Total points accumulated: 0 pts";
                totalDisplay.classList.remove('negative');
                noMsg.style.display = 'block';
            } else {
                noMsg.style.display = 'none';
                let totalPts = 0;
                
                data.points.reverse().forEach(pt => {
                    const parsed = parseFloat(pt.points.replace(/[^0-9.-]+/g,"")) || 0;
                    totalPts += parsed;
                    
                    let typeClass = parsed > 0 ? 'point-earn' : (parsed < 0 ? 'point-deduct' : 'point-neutral');
                    let displayPts = parsed > 0 ? `+${parsed} pts` : `${parsed} pts`;
                    
                    let linkHtml = (pt.receipt && pt.receipt !== '-') 
                        ? (pt.receipt.startsWith('http') ? pt.receipt : `https://drive.google.com/file/d/${pt.receipt}/view`)
                        : null;

                    let cardStr = `<${linkHtml ? `a href="${linkHtml}" target="_blank"` : 'div'} class="point-card ${linkHtml ? 'clickable' : ''}">
                                    <div class="point-row-1 ${typeClass}"><span>${pt.item}</span><span>${displayPts}</span></div>
                                    ${pt.date ? `<div class="point-date">Date: ${pt.date}</div>` : ''}
                                    ${pt.payment ? `<div class="point-payment">Payment method: ${pt.payment}</div>` : ''}
                                  </${linkHtml ? 'a' : 'div'}>`;
                    ptsContainer.innerHTML += cardStr;
                });
                
                totalDisplay.textContent = `Total points accumulated: ${totalPts} pts`;
                if (totalPts < 0) totalDisplay.classList.add('negative');
                else totalDisplay.classList.remove('negative');
            }

            // 4. FETCH PLAN FILES
            try {
                const priceRes = await fetch('./membership/Plan_Price.txt');
                if (priceRes.ok) {
                    const priceText = await priceRes.text();
                    let matchedPrice = "Price not found";
                    priceText.split('\n').forEach(line => {
                        const parts = line.split('|');
                        if (parts.length === 2 && parts[0].trim() === profile.plan) matchedPrice = parts[1].trim();
                    });
                    document.getElementById('plan-price').textContent = matchedPrice;
                } else document.getElementById('plan-price').textContent = "RM 10 / month";
            } catch(e) { document.getElementById('plan-price').textContent = "RM 10 / month"; }

            try {
                const planDetailsRes = await fetch(`./membership/${profile.plan}.txt`);
                if (planDetailsRes.ok) {
                    const planData = await planDetailsRes.text();
                    parsePlanFeatures(planData);
                } else document.getElementById('plan-includes').innerHTML = '<li>Error: Plan details not found.</li>';
            } catch(e) { document.getElementById('plan-includes').innerHTML = '<li>Error loading plan details.</li>'; }

        } catch (error) {
            console.error("Dashboard error:", error);
        }
    }

    loadDashboardData();
});
