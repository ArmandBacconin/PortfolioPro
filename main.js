/**
 * Script Principal - Portfolio
 * Gère les micro-interactions, les animations et le rendu dynamique des projets
 */

// Liste des IDs de projets correspondant aux fichiers JSON dans data/projects/
const projectIds = [
    "support-utilisateur",
    "maintenance-equipements-mco",
    "gestion-droits-acces",
    "projet-nas-2fa",
    "ingenierie-reseau",
    "scripts-c-2fa",
    "visualisation-vols-java",
    "reseau-social-sportifs",
    "deploiement-ocs-inventory",
    "remplacement-postes",
    "base-donnees-oracle",
    "dashboard-powerbi",
    "homeserver-personnel",
    "cluster-virtualisation-ceph",
    "pra-pca-ccvg",
    "soc-wazuh-suricata-misp",
    "active-directory-veeam-truenas"
];
let projectsData = {}; // Pour stocker les données afin de les réutiliser dans la modale

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mise en place de l'Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fonction utilitaire pour observer les nouveaux éléments
    window.observeElements = function(elements) {
        elements.forEach(el => observer.observe(el));
    };

    // Observer les éléments initiaux
    observeElements(document.querySelectorAll('.fade-in-up, .fade-in-left'));

    // 2. Comportement du header au défilement
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });

    // 3. Charger et générer les projets
    loadProjects();

    // 4. Initialiser la lueur violette aléatoire sur les cadres
    initRandomCyberSweep();
});

// Fonction pour charger les fichiers JSON un par un
async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    let delayCounter = 0; // Pour ajouter un delay en cascade

    for (const id of projectIds) {
        try {
            const response = await fetch(`data/projects/${id}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const project = await response.json();
            
            // Stocker pour un accès global via la modale
            projectsData[id] = project;

            // Déterminer la classe de délai
            let delayClass = '';
            if (delayCounter % 3 === 1) delayClass = 'delay-1';
            else if (delayCounter % 3 === 2) delayClass = 'delay-2';

            // Créer l'élément de la carte
            const card = document.createElement('article');
            card.className = `project-card glass-card fade-in-up ${delayClass}`;
            card.style.cursor = 'pointer';
            card.dataset.category = project.category || 'alternance';
            card.dataset.id = id;
            card.onclick = () => openModal(id);

            // Générer les tags HTML
            const tagsHTML = project.tags.map(tag => 
                `<span class="tag" style="background:${tag.bg}; color:${tag.color};">${tag.label}</span>`
            ).join(' ');

            card.innerHTML = `
                <div class="project-img" style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff1;">
                    <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s;">
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p class="project-tags">${tagsHTML}</p>
                    <p>${project.shortDescription}</p>
                    <a href="javascript:void(0)" class="btn btn-text">Voir compétences 🡢</a>
                </div>
            `;

            // Effet de survol sur l'image
            card.addEventListener('mouseenter', () => {
                const img = card.querySelector('img');
                if (img) img.style.transform = 'scale(1.08)';
            });
            card.addEventListener('mouseleave', () => {
                const img = card.querySelector('img');
                if (img) img.style.transform = 'scale(1)';
            });

            container.appendChild(card);
            
            // Observer cette nouvelle carte pour l'animation
            window.observeElements([card]);

            delayCounter++;
        } catch (error) {
            console.error(`Erreur lors du chargement du projet ${id}:`, error);
        }
    }
}

// 4. Logique de la modale
window.openModal = function(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    // Remplir les données de la modale
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-image').src = project.image;
    document.getElementById('modal-image').alt = project.title;
    document.getElementById('modal-desc').textContent = project.detailedDescription;

    // Remplir les tags
    const tagsHTML = project.tags.map(tag => 
        `<span class="tag" style="background:${tag.bg}; color:${tag.color};">${tag.label}</span>`
    ).join(' ');
    document.getElementById('modal-tags').innerHTML = tagsHTML;

    // Gérer le lien GitHub
    const githubBtn = document.getElementById('modal-github');
    if (githubBtn) {
        if (project.github) {
            githubBtn.href = project.github;
            githubBtn.style.display = 'inline-flex';
        } else {
            githubBtn.style.display = 'none';
        }
    }

    // Remplir les compétences
    let skillsHTML = '';
    project.skills.forEach(skillGroup => {
        skillsHTML += `
            <div style="margin-bottom: 5px;">
                <h4 style="color: ${skillGroup.color}; margin-bottom: 8px; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">🔹 ${skillGroup.category}</h4>
                <ul style="list-style-type: none; padding-left: 15px;">
                    ${skillGroup.items.map(item => {
                        // Séparer le code et la description pour mettre le code en gras
                        const parts = item.split(" | ");
                        if(parts.length > 1) {
                            return `<li style="margin-bottom: 4px; font-size: 0.95rem; color: var(--text-main);"><strong>${parts[0]}</strong> | ${parts[1]}</li>`;
                        }
                        return `<li style="margin-bottom: 4px; font-size: 0.95rem; color: var(--text-main);">${item}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    });
    document.getElementById('modal-skills').innerHTML = skillsHTML;

    // Afficher la modale
    const modal = document.getElementById('project-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll en arrière-plan
};

window.closeModal = function() {
    const modal = document.getElementById('project-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restaurer le scroll
};

// Fermer au clic sur Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// 5. Filtrage des projets par catégorie
window.filterProjects = function(category, btn) {
    // Masquer la bannière de filtre par compétence
    const skillBanner = document.getElementById('active-skill-banner');
    if (skillBanner) skillBanner.classList.remove('show');

    // Mise à jour de l'état visuel des boutons
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    } else {
        const allBtn = document.querySelector('.filter-btn');
        if (allBtn) allBtn.classList.add('active');
    }

    // Affichage / masquage des cartes selon la catégorie choisie
    document.querySelectorAll('.project-card').forEach((card) => {
        const match = category === 'all' || card.dataset.category === category;
        card.style.display = match ? '' : 'none';
    });
};

// 6. Filtrage dynamique par compétence du référentiel
window.filterBySkill = function(skillName) {
    // 1. Défiler en douceur jusqu'à la section projets
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 2. Réinitialiser les boutons de catégories
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));

    // Normalisation pour ignorer accents et casse
    const normalizeStr = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const target = normalizeStr(skillName);

    // 3. Filtrer les cartes ayant la compétence
    let matchCount = 0;
    document.querySelectorAll('.project-card').forEach((card) => {
        const id = card.dataset.id;
        const project = projectsData[id];
        let hasSkill = false;
        if (project && project.skills) {
            hasSkill = project.skills.some(s => normalizeStr(s.category) === target);
        }
        card.style.display = hasSkill ? '' : 'none';
        if (hasSkill) matchCount++;
    });

    // 4. Afficher la bannière de filtre actif
    const skillBanner = document.getElementById('active-skill-banner');
    const skillNameEl = document.getElementById('active-skill-name');
    if (skillBanner && skillNameEl) {
        skillNameEl.textContent = `${skillName} (${matchCount} projets associés)`;
        skillBanner.classList.add('show');
    }
};

// 7. Lueur violette subtile se déclenchant aléatoirement sur tous les cadres
function initRandomCyberSweep() {
    function triggerSweep() {
        const cards = document.querySelectorAll('.glass-card, .skill-card, .project-card, .portrait-container');
        
        cards.forEach((card, index) => {
            // Effet d'onde en cascade subtil
            setTimeout(() => {
                card.classList.add('cyber-sweep-active');
                setTimeout(() => {
                    card.classList.remove('cyber-sweep-active');
                }, 2300);
            }, (index % 4) * 110);
        });

        // Prochaine exécution aléatoire (entre 18 et 32 secondes)
        const nextDelay = Math.floor(Math.random() * (32000 - 18000 + 1)) + 18000;
        setTimeout(triggerSweep, nextDelay);
    }

    // Premier déclenchement 8 secondes après le chargement
    setTimeout(triggerSweep, 8000);
}