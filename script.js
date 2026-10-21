document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. AUTHENTICATION CHECK ---
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    if (!loggedInEmail) {
        window.location.href = "login.html";
        return; 
    }
    
    // --- 1. NAVBAR SCROLL LOGIC ---
    const topMenu = document.getElementById('top-menu');
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 10) {
            topMenu.classList.add('scrolled');
        } else {
            topMenu.classList.remove('scrolled');
        }
    });

    // --- 1.5 MOBILE DRAWER LOGIC ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');

    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            mobileDrawer.classList.add('open');
            drawerOverlay.style.display = 'block';
        });

        closeDrawerBtn.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
            drawerOverlay.style.display = 'none';
        });

        drawerOverlay.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
            drawerOverlay.style.display = 'none';
        });
    }

    // --- 2. NAVIGATION LOGIC (Tabs) ---
    const menuProfile = document.getElementById('menu-profile');
    const menuAchievement = document.getElementById('menu-achievement');
    const menuPoints = document.getElementById('menu-points');
    const menuStatus = document.getElementById('menu-status');
    
    const secProfile = document.getElementById('section-profile');
    const secAchievement = document.getElementById('section-achievement');
    const secPoints = document.getElementById('section-points');
    const secStatus = document.getElementById('section-status');

    function switchTab(tabName) {
        secProfile.style.display = 'none';
        secAchievement.style.display = 'none';
        secPoints.style.display = 'none';
        secStatus.style.display = 'none';
        
        menuProfile.classList.remove('active');
        menuAchievement.classList.remove('active');
        menuPoints.classList.remove('active');
        menuStatus.classList.remove('active');

        if (tabName === 'profile') {
            secProfile.style.display = 'block';
            menuProfile.classList.add('active');
        } else if (tabName === 'achievement') {
            secAchievement.style.display = 'block';
            menuAchievement.classList.add('active');
        } else if (tabName === 'points') {
            secPoints.style.display = 'block';
            menuPoints.classList.add('active');
        } else if (tabName === 'status') {
            secStatus.style.display = 'block';
            menuStatus.classList.add('active');
        }
    }

    menuProfile.addEventListener('click', (e) => { e.preventDefault(); switchTab('profile'); });
    menuAchievement.addEventListener('click', (e) => { e.preventDefault(); switchTab('achievement'); });
    menuPoints.addEventListener('click', (e) => { e.preventDefault(); switchTab('points'); });
    menuStatus.addEventListener('click', (e) => { e.preventDefault(); switchTab('status'); });
    
    document.getElementById('link-member-status').addEventListener('click', (e) => { 
        e.preventDefault(); 
        switchTab('status'); 
    });

    // --- 2.5 LOGOUT LOGIC ---
    document.getElementById('menu-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInEmail'); 
        window.location.href = "login.html"; 
    });

    // --- 3. HELPER FUNCTIONS ---
    function populateRoles(roleString, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; 
        if (!roleString || roleString.trim() === '-') return;

        const roles = roleString.split(',');
        roles.forEach(role => {
            if (role.trim()) {
                const li = document.createElement('li');
                li.textContent = role.trim();
                container.appendChild(li);
            }
        });
    }

    function getFirstRole(roleString) {
        if (!roleString || roleString.trim() === '-') return '';
        const firstRole = roleString.split(',')[0].trim();
        return firstRole ? `- ${firstRole}` : '';
    }
    
    function formatEmails(emailString) {
        if (!emailString) return 'No email provided';
        return emailString.split(',').map(e => e.trim()).join(', ');
    }

    function parsePlanFeatures(rawText) {
        const lines = rawText.split('\n');
        const listEl = document.getElementById('plan-includes');
        listEl.innerHTML = '';
        
        let currentMainItem = null;
        let subList = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('-')) {
                if (!subList) {
                    subList = document.createElement('ul');
                    if(currentMainItem) currentMainItem.appendChild(subList);
                }
                const subLi = document.createElement('li');
                subLi.textContent = trimmed.substring(1).trim();
                subList.appendChild(subLi);
            } else {
                currentMainItem = document.createElement('li');
                currentMainItem.innerHTML = `✓ ${trimmed}`;
                listEl.appendChild(currentMainItem);
                subList = null; 
            }
        });
    }

    // --- FETCH ACHIEVEMENTS ---
    function loadAchievements(userName) {
        const achieveSheetId = '1Tq1U6BukXft5XQJ4ARP0lK9nGdt9pk6P';
        const achieveCsvUrl = `https://docs.google.com/spreadsheets/d/${achieveSheetId}/export?format=csv`;
        
        Papa.parse(achieveCsvUrl, {
            download: true,
            header: false,
            complete: function(results) {
                try {
                    const data = results.data;
                    const container = document.getElementById('achievement-container');
                    container.innerHTML = ''; 
                    
                    const userAchievements = data.filter(row => {
                        return row[0] && row[0].trim().toLowerCase() === userName.toLowerCase();
                    });

                    if (userAchievements.length === 0) {
                        container.innerHTML = '<p class="no-record">No Record Found!</p>';
                    } else {
                        userAchievements.forEach(row => {
                            const achieveName = row[1] ? row[1].trim() : 'Achievement';
                            const achieveFileId = row[2] ? row[2].trim() : '';

                            if (achieveFileId) {
                                const card = document.createElement('div');
                                card.className = 'achievement-card';
                                
                                const iframe = document.createElement('iframe');
                                iframe.className = 'achievement-iframe';
                                iframe.src = `https://drive.google.com/file/d/${achieveFileId}/preview`;
                                
                                const dlLink = document.createElement('a');
                                dlLink.className = 'achievement-download';
                                dlLink.href = `https://drive.google.com/uc?export=download&id=${achieveFileId}`;
                                dlLink.target = "_blank";
                                dlLink.textContent = "Click to download";
                                
                                const nameTag = document.createElement('p');
                                nameTag.className = 'achievement-name';
                                nameTag.textContent = achieveName;

                                card.appendChild(iframe);
                                card.appendChild(dlLink);
                                card.appendChild(nameTag);
                                container.appendChild(card);
                            }
                        });
                        if (container.innerHTML === '') {
                             container.innerHTML = '<p class="no-record">No Record Found!</p>';
                        }
                    }
                } catch(err) {
                    document.getElementById('achievement-container').innerHTML = '<p class="no-record">Error loading achievements</p>';
                }
            }
        });
    }

    // --- FETCH POINTS SYSTEM ---
    function loadPoints(userName) {
        const pointsSheetId = '15J8DGFOXtyv9V1dTQgweMNJDyrHku8Fj';
        const pointsGid = '2093043020';
        const pointsCsvUrl = `https://docs.google.com/spreadsheets/d/${pointsSheetId}/export?format=csv&gid=${pointsGid}`;

        Papa.parse(pointsCsvUrl, {
            download: true,
            header: false,
            complete: function(results) {
                try {
                    const data = results.data;
                    const container = document.getElementById('points-history-container');
                    const totalDisplay = document.getElementById('total-points-display');
                    const noMsg = document.getElementById('no-points-msg');
                    
                    container.innerHTML = ''; 
                    
                    const headerRowIndex = data.findIndex(row => row.some(cell => cell && cell.toString().toLowerCase().includes('name')));
                    if (headerRowIndex === -1) {
                        totalDisplay.textContent = "Error: Database headers missing.";
                        return;
                    }
                    
                    const headers = data[headerRowIndex].map(h => h ? h.trim().toLowerCase() : '');
                    
                    const nameIdx = headers.findIndex(h => h.includes('name'));
                    const pointsIdx = headers.findIndex(h => h.includes('points_system') || h.includes('point'));
                    const dateIdx = headers.findIndex(h => h === 'date');
                    const itemIdx = headers.findIndex(h => h.includes('item') || h.includes('action') || h.includes('description') || h.includes('title'));
                    const paymentIdx = headers.findIndex(h => h.includes('payment'));
                    const receiptIdx = headers.findIndex(h => h.includes('receipt'));

                    const userRecords = data.slice(headerRowIndex + 1).filter(row => {
                        return row[nameIdx] && row[nameIdx].trim().toLowerCase() === userName.toLowerCase();
                    });

                    if (userRecords.length === 0) {
                        totalDisplay.textContent = "Total points accumulated: 0 pts";
                        totalDisplay.classList.remove('negative');
                        noMsg.style.display = 'block';
                    } else {
                        noMsg.style.display = 'none';
                        let totalPoints = 0;
                        
                        const sortedRecords = userRecords.reverse();

                        sortedRecords.forEach(row => {
                            const rawPoints = row[pointsIdx] ? row[pointsIdx].trim() : '0';
                            const parsedPoints = parseFloat(rawPoints.replace(/[^0-9.-]+/g,"")) || 0;
                            
                            totalPoints += parsedPoints;

                            const itemText = row[itemIdx] ? row[itemIdx].trim() : 'Record';
                            const dateText = row[dateIdx] ? row[dateIdx].trim() : '';
                            const paymentText = (paymentIdx !== -1 && row[paymentIdx]) ? row[paymentIdx].trim() : '';
                            const receiptLink = (receiptIdx !== -1 && row[receiptIdx]) ? row[receiptIdx].trim() : '';

                            let typeClass = 'point-neutral'; 
                            let displayPts = `${parsedPoints} pts`;
                            
                            if (parsedPoints > 0) {
                                typeClass = 'point-earn'; 
                                displayPts = `+${parsedPoints} pts`;
                            } else if (parsedPoints < 0) {
                                typeClass = 'point-deduct'; 
                                displayPts = `${parsedPoints} pts`; 
                            }

                            let card;
                            if (receiptLink && receiptLink !== '-' && receiptLink !== '') {
                                card = document.createElement('a');
                                
                                if (receiptLink.startsWith('http')) {
                                    card.href = receiptLink;
                                } else {
                                    card.href = `https://drive.google.com/file/d/${receiptLink}/view`;
                                }
                                
                                card.target = "_blank";
                                card.className = 'point-card clickable';
                                card.title = "Click to view receipt";
                            } else {
                                card = document.createElement('div');
                                card.className = 'point-card';
                            }

                            const row1 = document.createElement('div');
                            row1.className = `point-row-1 ${typeClass}`;
                            
                            const titleSpan = document.createElement('span');
                            titleSpan.textContent = itemText;
                            const ptsSpan = document.createElement('span');
                            ptsSpan.textContent = displayPts;
                            
                            row1.appendChild(titleSpan);
                            row1.appendChild(ptsSpan);
                            card.appendChild(row1);

                            if (dateText) {
                                const dateDiv = document.createElement('div');
                                dateDiv.className = 'point-date';
                                dateDiv.textContent = `Date: ${dateText}`;
                                card.appendChild(dateDiv);
                            }

                            if (paymentText) {
                                const payDiv = document.createElement('div');
                                payDiv.className = 'point-payment';
                                payDiv.textContent = `Payment method: ${paymentText}`;
                                card.appendChild(payDiv);
                            }

                            container.appendChild(card);
                        });

                        totalDisplay.textContent = `Total points accumulated: ${totalPoints} pts`;
                        if (totalPoints < 0) {
                            totalDisplay.classList.add('negative');
                        } else {
                            totalDisplay.classList.remove('negative');
                        }
                    }
                } catch (err) {
                    console.error("Error processing points:", err);
                    document.getElementById('total-points-display').textContent = "Error loading points data.";
                }
            }
        });
    }

    // --- MAIN DATA FETCHING ---
    async function loadDashboardData() {
        const sheetId = '11fZl1_k9Txz6zXZqZnZuKcH5PtF6QQuY';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        Papa.parse(csvUrl, {
            download: true,
            header: false,
            complete: async function(results) {
                try {
                    const data = results.data;
                    
                    const headerRowIndex = data.findIndex(row => 
                        row[0] && row[0].toString().trim().toLowerCase() === 'name'
                    );
                    
                    if (headerRowIndex !== -1 && data.length > headerRowIndex + 1) {
                        
                        const targetUserRow = data.slice(headerRowIndex + 1).find(row => {
                            if (!row[1]) return false;
                            const emailList = row[1].split(',').map(e => e.trim().toLowerCase());
                            return emailList.includes(loggedInEmail.toLowerCase());
                        });
                        
                        if (!targetUserRow) {
                            localStorage.removeItem('loggedInEmail'); 
                            window.location.href = "login.html"; 
                            return;
                        }
                        
                        const userName = targetUserRow[0] ? targetUserRow[0].trim() : 'User';
                        const allUserEmails = targetUserRow[1] ? targetUserRow[1] : ''; 
                        const userGender = targetUserRow[2] ? targetUserRow[2].trim() : 'L';
                        const userPhone = targetUserRow[3] ? targetUserRow[3].trim() : 'N/A';
                        const actiRoleRaw = targetUserRow[4] ? targetUserRow[4].trim() : '';
                        const astiRoleRaw = targetUserRow[5] ? targetUserRow[5].trim() : '';
                        const userPlan = targetUserRow[6] ? targetUserRow[6].trim() : 'Premium (Legacy)';
                        const profilePicId = targetUserRow[7] ? targetUserRow[7].trim() : '';
                        
                        document.getElementById('user-name').textContent = userName;
                        document.getElementById('top-acti-role').textContent = getFirstRole(actiRoleRaw);
                        document.getElementById('top-asti-role').textContent = getFirstRole(astiRoleRaw);
                        
                        document.getElementById('link-member-status').textContent = userPlan;
                        document.getElementById('user-email').textContent = formatEmails(allUserEmails);
                        document.getElementById('user-phone').textContent = userPhone;
                        document.getElementById('plan-name').textContent = userPlan;
                        
                        populateRoles(actiRoleRaw, 'acti-roles');
                        populateRoles(astiRoleRaw, 'asti-roles');

                        const profileImg = document.getElementById('user-profile-pic');
                        const baseUrl = "https://lh3.googleusercontent.com/d/";
                        const defaultMaleId = '1rpQ4Zy42TvwZLiy3oplSDvtVeGgDgzKM';
                        const defaultFemaleId = '1YAXVj4nkU75hiV5U0ewPmoU3qErDMB4-';

                        if (profilePicId && profilePicId !== '-') {
                            profileImg.src = baseUrl + profilePicId;
                        } else {
                            if (userGender.toUpperCase() === 'P' || userGender.toLowerCase() === 'female') {
                                profileImg.src = baseUrl + defaultFemaleId;
                            } else {
                                profileImg.src = baseUrl + defaultMaleId;
                            }
                        }

                        profileImg.onerror = function() {
                            if (userGender.toUpperCase() === 'P' || userGender.toLowerCase() === 'female') {
                                profileImg.src = baseUrl + defaultFemaleId;
                            } else {
                                profileImg.src = baseUrl + defaultMaleId;
                            }
                            profileImg.onerror = null; 
                        };

                        loadAchievements(userName);
                        loadPoints(userName);

                        try {
                            const priceRes = await fetch('./membership/Plan_Price.txt');
                            if (priceRes.ok) {
                                const priceText = await priceRes.text();
                                const lines = priceText.split('\n');
                                let matchedPrice = "Price not found";

                                for (let line of lines) {
                                    if (!line.trim()) continue;
                                    const parts = line.split('|');
                                    if (parts.length === 2 && parts[0].trim() === userPlan) {
                                        matchedPrice = parts[1].trim();
                                        break;
                                    }
                                }
                                document.getElementById('plan-price').textContent = matchedPrice;
                            } else {
                                document.getElementById('plan-price').textContent = "RM 10 / month"; 
                            }
                        } catch (error) {
                            document.getElementById('plan-price').textContent = "RM 10 / month";
                        }

                        try {
                            const planDetailsRes = await fetch(`./membership/${userPlan}.txt`);
                            if (planDetailsRes.ok) {
                                const planData = await planDetailsRes.text();
                                parsePlanFeatures(planData);
                            } else {
                                document.getElementById('plan-includes').innerHTML = '<li>Error: Plan details not found.</li>';
                            }
                        } catch (error) {
                            document.getElementById('plan-includes').innerHTML = '<li>Error loading plan details.</li>';
                        }
                    } else {
                        console.error("Could not find the 'Name' header row in the Google Sheet.");
                    }
                } catch (err) {
                    console.error("Error processing sheet data:", err);
                }
            },
            error: function(err) {
                console.error("PapaParse failed to fetch CSV:", err);
            }
        });
    }

    loadDashboardData();
});
