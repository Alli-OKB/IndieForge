const API_URL = 'http://localhost:3000/api/workspaces';

const workspacesSection = document.getElementById('workspaces-section');
const dashboardSection = document.getElementById('dashboard-section');
const workspacesContainer = document.getElementById('workspaces-container');
const dashboardContent = document.getElementById('dashboard-content');
const dashboardTitle = document.getElementById('dashboard-title');
const btnBack = document.getElementById('btn-back');
const btnFav = document.getElementById('btn-fav');

let pinnedWorkspaces = JSON.parse(localStorage.getItem('pinnedWorkspaces')) || [];
let currentWorkspaceId = null;
let currentWorkspaceName = '';
let currentDashboardData = { backlog: [], bugs: [], assets: [] };

btnBack.addEventListener('click', showWorkspacesList);

btnFav.addEventListener('click', () => {
    if (!currentWorkspaceId) return;
    const idStr = currentWorkspaceId.toString();
    const index = pinnedWorkspaces.indexOf(idStr);
    if (index === -1) {
        pinnedWorkspaces.push(idStr);
    } else {
        pinnedWorkspaces.splice(index, 1);
    }
    localStorage.setItem('pinnedWorkspaces', JSON.stringify(pinnedWorkspaces));
    updateFavButtonState();
});

function getStatusClass(status) {
    const s = status ? status.toLowerCase() : '';
    if (['terminé', 'résolu', 'intégré'].includes(s)) return 'status-green';
    if (['en cours', 'en création'].includes(s)) return 'status-orange';
    if (['à faire', 'critique', 'en attente'].includes(s)) return 'status-red';
    return '';
}

function updateFavButtonState() {
    if (pinnedWorkspaces.includes(currentWorkspaceId.toString())) {
        btnFav.textContent = '★ Épinglé';
    } else {
        btnFav.textContent = '☆ Épingler';
    }
}

function showWorkspacesList() {
    dashboardSection.classList.add('hidden');
    workspacesSection.classList.remove('hidden');
    loadWorkspaces();
}

async function loadWorkspaces() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur de récupération');
        const workspaces = await response.json();
        workspacesContainer.innerHTML = '';
        
        workspaces.sort((a, b) => {
            const aPinned = pinnedWorkspaces.includes(a.id.toString()) ? 1 : 0;
            const bPinned = pinnedWorkspaces.includes(b.id.toString()) ? 1 : 0;
            return bPinned - aPinned;
        });

        workspaces.forEach(ws => {
            const card = document.createElement('div');
            const isPinned = pinnedWorkspaces.includes(ws.id.toString());
            card.className = `card-padding space-y workspace-card ${isPinned ? 'fav-card' : ''}`;
            
            card.innerHTML = `
                <div class="flex-between">
                    <h3 class="workspace-title">${ws.name}</h3>
                    <span>${isPinned ? '★' : ''}</span>
                </div>
                <p class="workspace-desc">${ws.description || 'Pas de description'}</p>
            `;
            
            card.addEventListener('click', () => loadDashboard(ws.id, ws.name));
            workspacesContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadDashboard(workspaceId, workspaceName) {
    workspacesSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    currentWorkspaceId = workspaceId;
    currentWorkspaceName = workspaceName;
    dashboardTitle.textContent = `Studio Dashboard : ${workspaceName}`;
    updateFavButtonState();

    try {
        const response = await fetch(`${API_URL}/${workspaceId}/dashboard`);
        currentDashboardData = await response.json();
        applyFiltersAndRender();
    } catch (error) {
        console.error(error);
    }
}

function applyFiltersAndRender() {
    dashboardContent.innerHTML = '';
    const renderSection = (sectionTitle, items) => {
        let html = `<h3 class="space-y">${sectionTitle}</h3>`;
        items.forEach(item => {
            const itemStatus = item.status || item.statut_bug || item.statut_asset || item.status_tache || '';
            const colorClass = getStatusClass(itemStatus);
            html += `
                <div class="card-padding dashboard-card">
                    <div>
                        <p>${item.title || item.name}</p>
                        <span class="card-meta">${item.responsable_nom || 'Non assigné'}</span>
                    </div>
                    <span class="badge ${colorClass}">${itemStatus}</span>
                </div>
            `;
        });
        return html;
    };
    dashboardContent.innerHTML += renderSection('📋 Backlog de fonctionnalités', currentDashboardData.backlog || []);
    dashboardContent.innerHTML += renderSection('🐛 Suivi des bugs', currentDashboardData.bugs || []);
    dashboardContent.innerHTML += renderSection('🎨 Gestion des assets', currentDashboardData.assets || []);
}

document.addEventListener('DOMContentLoaded', loadWorkspaces);