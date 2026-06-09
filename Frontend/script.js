const API_URL = 'http://localhost:5000/api/workspace';

async function loadWorkspaces() {
    const container = document.getElementById('workspaces-container');
    
    try {

        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Erreur de recuperation');
        }
        
        const workspaces = await response.json();
        
        container.innerHTML = '';
        
        if (workspaces.length === 0) {
            container.innerHTML = '<p class="italic-text">Aucun workspace trouve.</p>';
            return;
        }
        
        workspaces.forEach(ws => {
            const card = document.createElement('div');
            card.className = 'card-padding space-y';
            card.style.backgroundColor = 'var(--bg-card)';
            card.style.borderRadius = '8px';
            card.style.borderLeft = '4px solid var(--primary)';
            
            card.innerHTML = `
                <h3 style="font-weight: bold; color: var(--primary);">${ws.name}</h3>
                <p style="font-size: 0.875rem; color: var(--text-muted);">${ws.description || 'Pas de description'}</p>
            `;
            
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="italic-text" style="color: #ef4444;">Impossible de charger les tableaux de bord.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadWorkspaces);