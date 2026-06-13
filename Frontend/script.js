const API_URL = 'http://localhost:3000/api/workspaces';

const workspacesSection = document.getElementById('workspaces-section');
const dashboardSection = document.getElementById('dashboard-section');
const workspacesContainer = document.getElementById('workspaces-container');
const dashboardContent = document.getElementById('dashboard-content');
const dashboardTitle = document.getElementById('dashboard-title');
const btnBack = document.getElementById('btn-back');
const btnFav = document.getElementById('btn-fav');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

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

searchInput.addEventListener('input', applyFiltersAndRender);
statusFilter.addEventListener('change', applyFiltersAndRender);

function getStatusClass(status) {
    const s = status ? status.toLowerCase() : '';
    if (['terminé', 'résolu', 'intégré', 'done'].includes(s)) return 'status-green';
    if (['en cours', 'en création', 'progress'].includes(s)) return 'status-orange';
    if (['à faire', 'critique', 'en attente', 'todo', 'critical'].includes(s)) return 'status-red';
    return 'status-grey';
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

function filterDashboardItems(items, searchTerm = '', filterValue = 'all') {
    return items.filter(item => {
        const titleOrName = item.title || item.name || '';
        const description = item.description || '';
        const matchesSearch = titleOrName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const itemStatus = item.status || item.statut_bug || item.statut_asset || item.status_tache || '';
        let matchesStatus = false;
        const s = itemStatus.toLowerCase();

        if (filterValue === 'all') {
            matchesStatus = true;
        } else if (filterValue === 'todo') {
            matchesStatus = ['à faire', 'critique', 'en attente', 'todo', 'critical'].includes(s);
        } else if (filterValue === 'progress') {
            matchesStatus = ['en cours', 'en création', 'progress'].includes(s);
        } else if (filterValue === 'done') {
            matchesStatus = ['terminé', 'résolu', 'intégré', 'done'].includes(s);
        }

        return matchesSearch && matchesStatus;
    });
}

async function loadWorkspaces() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur de récupération');
        
        const workspaces = await response.json();
        workspacesContainer.innerHTML = '';
        
        if (workspaces.length === 0) {
            workspacesContainer.innerHTML = '<p class="italic-text">Aucun workspace trouvé.</p>';
            return;
        }
        
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
        workspacesContainer.innerHTML = '<p class="italic-text status-red">Impossible de charger les espaces.</p>';
    }
}

async function loadDashboard(workspaceId, workspaceName) {
    workspacesSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    currentWorkspaceId = workspaceId;
    currentWorkspaceName = workspaceName;
    dashboardTitle.textContent = `Studio Dashboard : ${workspaceName}`;
    dashboardContent.innerHTML = '<p class="italic-text">Chargement...</p>';
    updateFavButtonState();

    try {
        const response = await fetch(`${API_URL}/${workspaceId}/dashboard`);
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        
        currentDashboardData = await response.json();
        applyFiltersAndRender();

    } catch (error) {
        console.error(error);
        dashboardContent.innerHTML = '<p class="italic-text status-red">Erreur de chargement.</p>';
    }
}

function applyFiltersAndRender() {
    const searchTerm = searchInput.value;
    const filterValue = statusFilter.value;

    const filteredBacklog = filterDashboardItems(currentDashboardData.backlog || [], searchTerm, filterValue);
    const filteredBugs = filterDashboardItems(currentDashboardData.bugs || [], searchTerm, filterValue);
    const filteredAssets = filterDashboardItems(currentDashboardData.assets || [], searchTerm, filterValue);

    dashboardContent.innerHTML = '';

    const renderSection = (sectionTitle, items) => {
        let html = `<h3 class="section-subtitle">${sectionTitle}</h3>`;
        
        if (items.length === 0) {
            html += '<p class="italic-text space-y">Aucun élément disponible avec ces filtres.</p>';
            return html;
        }

        items.forEach(item => {
            const itemStatus = item.status || item.statut_bug || item.statut_asset || item.status_tache || '';
            const colorClass = getStatusClass(itemStatus);
            
            html += `
                <div class="card-padding dashboard-card">
                    <div class="card-left">
                        <p class="item-title">${item.title || item.name}</p>
                        <span class="card-meta">${item.responsable_nom || item.assignee || 'Non assigné'}</span>
                    </div>
                    <span class="badge ${colorClass}">${itemStatus}</span>
                </div>
            `;
        });
        return html;
    };

    dashboardContent.innerHTML += renderSection('📋 Backlog de fonctionnalités', filteredBacklog);
    dashboardContent.innerHTML += renderSection('🐛 Suivi des bugs', filteredBugs);
    dashboardContent.innerHTML += renderSection('🎨 Gestion des assets', filteredAssets);
}

document.addEventListener('DOMContentLoaded', loadWorkspaces);