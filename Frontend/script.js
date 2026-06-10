const API_URL = 'http://localhost:3000/api/workspaces';

const workspacesSection = document.getElementById('workspaces-section');
const dashboardSection = document.getElementById('dashboard-section');
const workspacesContainer = document.getElementById('workspaces-container');
const dashboardContent = document.getElementById('dashboard-content');
const dashboardTitle = document.getElementById('dashboard-title');
const btnBack = document.getElementById('btn-back');

btnBack.addEventListener('click', showWorkspacesList);

function getStatusClass(status) {
    const s = status ? status.toLowerCase() : '';
    if (['terminé', 'résolu', 'intégré'].includes(s)) return 'status-green';
    if (['en cours', 'en création'].includes(s)) return 'status-orange';
    if (['à faire', 'critique', 'en attente'].includes(s)) return 'status-red';
    return '';
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
        
        if (workspaces.length === 0) {
            workspacesContainer.innerHTML = '<p class="italic-text">Aucun workspace trouvé.</p>';
            return;
        }
        
        workspaces.forEach(ws => {
            const card = document.createElement('div');
            card.className = 'card-padding space-y workspace-card';
            
            card.innerHTML = `
                <h3 class="workspace-title">${ws.name}</h3>
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
    dashboardTitle.textContent = `Studio Dashboard : ${workspaceName}`;
    dashboardContent.innerHTML = '<p class="italic-text">Chargement...</p>';

    try {
        const response = await fetch(`${API_URL}/${workspaceId}/dashboard`);
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        
        const data = await response.json();
        dashboardContent.innerHTML = '';

        const renderSection = (sectionTitle, items) => {
            let html = `<h3 class="space-y">${sectionTitle}</h3>`;
            
            if (items.length === 0) {
                html += '<p class="italic-text">Aucun élément disponible.</p>';
                return html;
            }

            items.forEach(item => {
                const itemStatus = item.status || '';
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

        dashboardContent.innerHTML += renderSection('📋 Backlog de fonctionnalités', data.backlog);
        dashboardContent.innerHTML += renderSection('🐛 Suivi des bugs', data.bugs);
        dashboardContent.innerHTML += renderSection('🎨 Gestion des assets', data.assets);

    } catch (error) {
        console.error(error);
        dashboardContent.innerHTML = '<p class="italic-text status-red">Erreur de chargement.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadWorkspaces);