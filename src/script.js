document.addEventListener("DOMContentLoaded", () => {
    // Inicializar todos os módulos
    Navigation.init()
    SmoothScroll.init()
    ContactForm.init()
    ProjectManager.init()
    GitHubAPI.init()
})

// Módulo de navegação
const Navigation = {
    init: function () {
        this.setupMobileMenu()
    },

    setupMobileMenu: () => {
        const menuToggle = document.getElementById("menu-toggle")
        const mobileMenu = document.getElementById("mobile-menu")

        if (!menuToggle || !mobileMenu) return

        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("is-active")
            mobileMenu.classList.toggle("is-active")
        })

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll("a")
        mobileLinks.forEach((link) => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("is-active")
                mobileMenu.classList.remove("is-active")
            })
        })
    },
}

// Módulo de rolagem suave
const SmoothScroll = {
    init: function () {
        this.setupSmoothScrolling()
    },

    setupSmoothScrolling: () => {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault()
                const targetId = this.getAttribute("href")
                if (targetId === "#") return

                const targetElement = document.querySelector(targetId)
                if (targetElement) {
                    const headerOffset = 60
                    const elementPosition = targetElement.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    })
                }
            })
        })
    },
}

// Módulo de formulário de contato
const ContactForm = {
    init: function () {
        this.setupFormSubmission()
    },

    setupFormSubmission: () => {
        const contactForm = document.getElementById("contact-form")
        if (!contactForm) return

        contactForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Get form values
            const name = document.getElementById("name").value
            const email = document.getElementById("email").value
            const message = document.getElementById("message").value

            // Basic validation
            if (!name || !email || !message) {
                alert("Por favor, preencha todos os campos obrigatórios.")
                return
            }

            // Here you would typically send the form data to a server
            // For demo purposes, we'll just show an alert
            alert("Obrigado pela sua mensagem! Entrarei em contato em breve.")
            contactForm.reset()
        })
    },
}

// Módulo de gerenciamento de projetos
const ProjectManager = {
    // Nome do usuário do GitHub
    githubUsername: "devAndreNicolas",

    // Lista de repositórios a serem exibidos (nome exato do repositório no GitHub)
    // Você pode adicionar/remover/reordenar esta lista para controlar quais projetos são exibidos
    featuredRepos: ["Dotask", "gerenciamento-financeiro", "bot-uncisal-restaurantes", "analise-de-vendas" ,"arg-flog", "andplayer"],

    // Mapeamento de imagens personalizadas para cada repositório
    // A chave é o nome do repositório, o valor é a URL da imagem
    repoImages: {
        "Dotask": "https://www.macobserver.com/wp-content/uploads/2019/05/workfeatured-GitHub-2.png",
        "gerenciamento-financeiro": "https://via.placeholder.com/400x300/e74c3c/ffffff?text=API",
        "bot-uncisal-restaurantes": "https://via.placeholder.com/400x300/2ecc71/ffffff?text=Data",
        "analise-de-vendas": "https://via.placeholder.com/400x300/9b59b6/ffffff?text=Mobile",
        "arg-flog": "https://via.placeholder.com/400x300/f39c12/ffffff?text=Dashboard",
        "andplayer": "https://via.placeholder.com/400x300/1abc9c/ffffff?text=E-Commerce",
    },

    // Imagem padrão caso o repositório não tenha uma imagem definida
    defaultImage: "https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_1280.png",

    // Armazena os dados dos repositórios
    repoData: {},

    init: function () {
        this.showLoadingState()
        this.fetchRepositories()
    },

    showLoadingState: () => {
        const projectsContainer = document.getElementById("projects-container")
        if (!projectsContainer) return

        projectsContainer.innerHTML = `
      <div class="column is-12 has-text-centered">
        <div class="py-6">
          <span class="icon is-large">
            <i class="fas fa-spinner fa-pulse fa-3x"></i>
          </span>
          <p class="mt-4 is-size-5">Carregando projetos...</p>
        </div>
      </div>
    `
    },

    fetchRepositories: function () {
        // Primeiro, buscar todos os repositórios do usuário
        fetch(`https://api.github.com/users/${this.githubUsername}/repos`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Falha ao buscar repositórios do GitHub")
                }
                return response.json()
            })
            .then((repos) => {
                // Filtrar apenas os repositórios que estão na lista de destaque
                const filteredRepos = repos.filter((repo) => this.featuredRepos.includes(repo.name))

                // Se não encontrou todos os repositórios da lista, buscar os que faltam individualmente
                if (filteredRepos.length < this.featuredRepos.length) {
                    // Para cada repositório na lista de destaque
                    const promises = this.featuredRepos.map((repoName) => {
                        // Verificar se já foi encontrado
                        const found = filteredRepos.find((repo) => repo.name === repoName)
                        if (found) {
                            return Promise.resolve(found)
                        } else {
                            // Se não foi encontrado, buscar individualmente
                            return fetch(`https://api.github.com/repos/${this.githubUsername}/${repoName}`)
                                .then((response) => {
                                    if (!response.ok) {
                                        console.warn(`Repositório ${repoName} não encontrado`)
                                        return null
                                    }
                                    return response.json()
                                })
                                .catch((error) => {
                                    console.error(`Erro ao buscar repositório ${repoName}:`, error)
                                    return null
                                })
                        }
                    })

                    return Promise.all(promises)
                }

                return filteredRepos
            })
            .then((repos) => {
                // Filtrar repositórios nulos (que não foram encontrados)
                const validRepos = repos.filter((repo) => repo !== null)

                // Ordenar os repositórios conforme a ordem na lista de destaque
                validRepos.sort((a, b) => {
                    return this.featuredRepos.indexOf(a.name) - this.featuredRepos.indexOf(b.name)
                })

                // Armazenar os dados e exibir os projetos
                this.repoData = validRepos
                this.displayProjects()
            })
            .catch((error) => {
                console.error("Erro ao buscar repositórios:", error)
                this.displayErrorState()
            })
    },

    displayErrorState: () => {
        const projectsContainer = document.getElementById("projects-container")
        if (!projectsContainer) return

        projectsContainer.innerHTML = `
      <div class="column is-12">
        <div class="notification is-warning">
          <p>Não foi possível carregar os projetos do GitHub. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    `
    },

    displayProjects: function () {
        const projectsContainer = document.getElementById("projects-container")
        if (!projectsContainer) return

        // Limpar o container
        projectsContainer.innerHTML = ""

        // Se não há dados, mostrar mensagem
        if (!this.repoData || this.repoData.length === 0) {
            projectsContainer.innerHTML = `
        <div class="column is-12">
          <div class="notification is-info">
            <p>Nenhum projeto encontrado.</p>
          </div>
        </div>
      `
            return
        }

        // Exibir cada repositório
        this.repoData.forEach((repo) => {
            // Obter a imagem personalizada ou usar a padrão
            const imageUrl = this.repoImages[repo.name] || this.defaultImage

            // Criar tags para as linguagens (se disponíveis)
            let languageTags = ""
            if (repo.language) {
                languageTags = `<span class="tag is-light">${this.escapeHTML(repo.language)}</span>`
            }

            // Criar o card do projeto
            const projectCard = document.createElement("div")
            projectCard.className = "column is-4"

            projectCard.innerHTML = `
        <div class="card project-card">
          <div class="card-image project-image">
            <figure class="image is-4by3">
              <img src="${imageUrl}" alt="${this.escapeHTML(repo.name)}">
            </figure>
          </div>
          <div class="card-content">
            <h3 class="title is-4">${this.escapeHTML(repo.name)}</h3>
            <p class="subtitle is-6 has-text-grey mb-4">${this.escapeHTML(repo.description || "Sem descrição disponível")}</p>
            <div class="tags mb-4">
              ${languageTags}
            </div>
            <div class="level">
              <div class="level-left">
                <a href="${repo.html_url}" target="_blank" class="project-link">
                  Ver Projeto
                  <span class="icon">
                    <i class="fas fa-arrow-right"></i>
                  </span>
                </a>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <span class="icon">
                    <i class="fas fa-star"></i>
                  </span>
                  <span>${repo.stargazers_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

            projectsContainer.appendChild(projectCard)
        })
    },

    // Função de segurança para escapar HTML e prevenir XSS
    escapeHTML: (str) => {
        if (!str) return ""
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
    },
}

// Módulo de API do GitHub
const GitHubAPI = {
    username: "devAndreNicolas",

    init: function () {
        this.fetchProfile()
    },

    fetchProfile: function () {
        const profileImage = document.getElementById("profile-image")
        if (!profileImage) return

        // Usar uma URL de fallback caso a API falhe
        const fallbackImageUrl = "https://via.placeholder.com/320"

        fetch(`https://api.github.com/users/${this.username}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Falha na requisição à API do GitHub")
                }
                return response.json()
            })
            .then((data) => {
                if (data && data.avatar_url) {
                    // Criar uma nova imagem para pré-carregar e verificar se carrega corretamente
                    const img = new Image()
                    img.onload = () => {
                        profileImage.src = data.avatar_url
                    }
                    img.onerror = () => {
                        console.error("Erro ao carregar a imagem do perfil")
                        profileImage.src = fallbackImageUrl
                    }
                    img.src = data.avatar_url
                } else {
                    profileImage.src = fallbackImageUrl
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar perfil do GitHub:", error)
                profileImage.src = fallbackImageUrl
            })
    },
}