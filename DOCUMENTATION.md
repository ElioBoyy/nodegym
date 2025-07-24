# Gym API - Documentation Technique

## Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture Clean & Hexagonale](#architecture-clean--hexagonale)
3. [Principes SOLID](#principes-solid)
4. [Patterns Architecturaux](#patterns-architecturaux)
5. [Injection de Dépendances](#injection-de-dépendances)
6. [Technologies et Infrastructure](#technologies-et-infrastructure)
7. [Structure de l'API](#structure-de-lapi)
8. [Sécurité et Authentification](#sécurité-et-authentification)
9. [Base de Données](#base-de-données)
10. [Philosophie Do It Simple](#philosophie-do-it-simple)

## Vue d'ensemble du projet

Le **Gym API** est une application Node.js construite avec **AdonisJS 6** qui implémente les principes de l'**Architecture Clean** et **Hexagonale**. Cette API de gestion de fitness offre un système complet avec des rôles d'accès différenciés.

### Fonctionnalités actuelles :

- **Authentification JWT** avec 3 rôles : super_admin, gym_owner, client
- **Gestion des salles de sport** avec workflow d'approbation
- **Système de défis** avec participation et suivi
- **Système de badges** avec attribution automatique
- **Types d'exercices** configurables
- **Sessions d'entraînement** avec métriques
- **Tableaux de bord** personnalisés par rôle

### Architecture actuelle :

- **Domain Layer** : Entités métier, interfaces des repositories
- **Application Layer** : Use cases organisés par contexte métier
- **Infrastructure Layer** : Implémentations MongoDB, services externes
- **Presentation Layer** : Contrôleurs REST avec injection directe des dépendances

## Architecture Clean & Hexagonale

L'application suit les principes de la **Clean Architecture** avec une approche **Hexagonale** (Ports & Adapters) pour isoler la logique métier.

### Structure actuelle des couches :

```
┌────────────────────────────────────────────────┐
│              Presentation Layer                │
│     Controllers + Routes (start/routes.ts)     │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────┴────────────────────────┐
│               Application Layer                │
│        Use Cases (par contexte métier)         │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────┴────────────────────────┐
│                 Domain Layer                   │
│  Entities + Repository Interfaces + Factories  │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────┴────────────────────────┐
│             Infrastructure Layer               │
│    MongoDB Repos + Services + DI Container     │
└────────────────────────────────────────────────┘
```

### Avantages actuels :

- **Logique métier isolée** dans le domaine
- **Dépendances inversées** via interfaces
- **Use cases testables** en isolation
- **Changement d'infrastructure** sans impact métier

### Structure du domaine actuel :

#### Entités métier (`app/domain/entities/`) :

```typescript
// Entité User avec logique métier
export class User {
  isGymOwner(): boolean
  canManageGym(gymId: string): boolean
  activate(): User
  deactivate(): User
}

// Entité Challenge avec règles métier
export class Challenge {
  canBeJoinedBy(user: User): boolean
  isActive(): boolean
  addParticipant(userId: string): Challenge
}
```

#### Example de Use Cases par contexte :

- **Admin** : GetDashboardStats, ActivateUser, ApproveGym
- **Client** : GetDashboardData, GetUserStats, GetWorkoutHistory
- **GymOwner** : GetGymStats, GetGymChallenges
- **Challenge** : CreateChallenge, JoinChallenge, LeaveChallenge
- **Badge** : GetUserBadges, CreateBadge

#### Factories avec logique métier :

- **UserFactory** : Création avec règles par rôle (clients actifs, gym owners inactifs)
- **ChallengeFactory** : Intégration avec stratégies de difficulté

## Principes SOLID

### S - Single Responsibility Principle

Chaque classe a une seule responsabilité :

```typescript
export class CreateUser {
  // Responsabilité unique : créer des utilisateurs
  async execute(request: CreateUserRequest): Promise<User>
}
```

### O - Open/Closed Principle

Ouvert à l'extension, fermé à la modification via interfaces :

```typescript
export interface NotificationService {
  send(notification: Notification): Promise<void>
}
// Nouvelles implémentations sans modifier l'existant
```

### L - Liskov Substitution Principle

Substitution transparente des implémentations :

```typescript
// Toutes les strategies respectent le même contrat
class BeginnerStrategy implements DifficultyStrategy
class AdvancedStrategy implements DifficultyStrategy
```

### I - Interface Segregation Principle

Interfaces spécialisées plutôt qu'interfaces monolithiques :

```typescript
export interface Readable<T> {
  findById(id: string): Promise<T | null>
}
export interface Writable<T> {
  save(entity: T): Promise<T>
}
```

### D - Dependency Inversion Principle

Dépendances sur les abstractions, pas les implémentations :

```typescript
export class CreateUser {
  constructor(
    private userRepository: UserRepository, // Interface
    private passwordService: PasswordService // Interface
  ) {}
}
```

## Patterns Architecturaux

### Pattern Factory

Deux factories conservées pour leur logique métier :

#### UserFactory :

```typescript
static createClient(): User // Actif par défaut
static createGymOwner(): User // Inactif, nécessite approbation
static createSuperAdmin(): User // Actif avec privilèges complets
```

#### ChallengeFactory :

```typescript
static create(request): Challenge {
  const strategy = DifficultyStrategyFactory.createStrategy(request.difficulty)
  const recommendedDuration = strategy.calculateRecommendedDuration()
  const maxParticipants = strategy.calculateMaxParticipants()
  // Logique de calcul automatique des propriétés
}
```

### Pattern Repository

Abstraction de la persistance via interfaces :

```typescript
// Interface domaine
export interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}

// Implémentation MongoDB
export class MongoDBUserRepository implements UserRepository {
  // Implémentation spécifique MongoDB
}
```

### Pattern Use Case

Un use case = une action métier :

```typescript
export class CreateUser {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    // Logique métier pure
  }
}
```

### Pattern Strategy

Gestion des difficultés de défis :

```typescript
class BeginnerStrategy implements DifficultyStrategy {
  calculateMaxParticipants(): number {
    return 50
  }
  calculateRecommendedDuration(): number {
    return 7
  }
}
```

## Injection de Dépendances

Container IoC personnalisé centralisé dans `app/infrastructure/dependency_injection/container.ts`.

### Structure actuelle :

```typescript
export class DIContainer {
  private static instance: DIContainer
  private services: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    await MongoDBConnection.getInstance().connect()
    this.registerRepositories() // Repos MongoDB
    this.registerServices() // Services techniques
    this.registerUseCases() // Use cases métier
  }
}
```

### Injection directe dans les routes :

```typescript
// start/routes.ts
const container = DIContainer.getInstance()

const authController = new AuthController(
  container.get('CreateUser'),
  container.get('AuthenticateUser'),
  container.get('GetUserById'),
  container.get('JwtService'),
  container.get('UserRepository')
)
```

### Services enregistrés :

- **Repositories** : MongoDB\*Repository (7 repos)
- **Services** : PasswordService, JwtService, NotificationService, BadgeService
- **Use Cases** : 25+ use cases organisés par contexte métier

### Avantages :

- **Configuration centralisée** des dépendances
- **Testabilité** via injection de mocks
- **Découplage** des couches
- **Simplicité** sans abstractions inutiles

## Technologies et Infrastructure

### Stack technique actuelle :

- **Runtime** : Node.js
- **Framework** : AdonisJS 6
- **Langage** : TypeScript strict mode
- **Base de données** : MongoDB (driver natif, pas d'ORM)
- **Authentification** : Service JWT personnalisé
- **Tests** : Japa (46 fichiers de tests)
- **Validation** : Vine (validation AdonisJS)
- **Code Quality** : ESLint + Prettier

### Infrastructure :

- **Docker Compose** : MongoDB avec persistance
- **HMR** activé pour le développement
- **Path mapping TypeScript** pour imports propres

### Commandes disponibles :

```bash
npm run dev        # Serveur développement
npm run build      # Build production
npm run lint       # Vérification code
npm run typecheck  # Vérification types
npm test           # Tests complets
```

## Structure de l'API

API RESTful avec endpoints organisés par rôle (dans `start/routes.ts`).

### Routes publiques :

```
GET  /                     # Infos API
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
```

### Routes authentifiées générales :

```
POST /api/auth/logout      # Déconnexion
GET  /api/auth/me          # Profil utilisateur

# Ressources CRUD standard
/api/gyms                  # Salles de sport
/api/challenges            # Défis avec join/leave
/api/participations        # Sessions d'entraînement
/api/badges               # Badges système
/api/exercise-types       # Types d'exercices
```

### Routes par rôle :

#### Super Admin (`/api/admin`) :

- Gestion utilisateurs (activate/deactivate)
- Approbation salles de sport
- CRUD badges et types d'exercices
- Statistiques globales

#### Propriétaire (`/api/owner`) :

- Gestion de sa salle
- Défis de sa salle
- Statistiques salle

#### Client (`/api/client`) :

- Tableau de bord personnel
- Participations aux défis
- Badges obtenus
- Historique d'entraînement

### Middleware de protection :

- `middleware.auth()` : Authentification JWT
- `middleware.superAdmin()` : Rôle super admin
- `middleware.gymOwner()` : Rôle propriétaire
- `middleware.client()` : Rôle client

## Sécurité et Authentification

### JWT Service personnalisé :

```typescript
// app/infrastructure/services/jwt_service.ts
export class JwtService {
  async generateToken(payload: TokenPayload): Promise<string>
  async verifyToken(token: string): Promise<TokenPayload>
}
```

### Middleware d'authentification :

- **AuthMiddleware** : Vérification token JWT
- **SuperAdminMiddleware** : Accès super administrateur
- **GymOwnerMiddleware** : Accès propriétaire salle
- **ClientMiddleware** : Accès client

### Sécurité mots de passe :

```typescript
// Service utilisant le hachage AdonisJS
export class AdonisPasswordService {
  async hash(password: string): Promise<string>
  async verify(hashed: string, plain: string): Promise<boolean>
}
```

### Protection des routes :

- Routes publiques : register, login
- Routes authentifiées : auth() middleware
- Routes par rôle : auth() + role middleware

### Gestion des utilisateurs :

- **Clients** : Actifs à la création
- **Gym Owners** : Inactifs, nécessitent approbation admin
- **Super Admins** : Actifs avec tous privilèges

## Base de Données

### MongoDB avec driver natif :

```typescript
// Connexion centralisée
export class MongoDBConnection {
  private static instance: MongoDBConnection
  async connect(): Promise<void>
  getDatabase(): Db
}
```

### Collections principales :

- **users** : Utilisateurs avec rôles et statuts
- **gyms** : Salles de sport avec approbation
- **challenges** : Défis avec difficulté et participants
- **challenge_participations** : Participations avec sessions
- **badges** : Badges avec règles d'attribution
- **user_badges** : Attribution badges aux utilisateurs
- **exercise_types** : Types d'exercices configurables

### Repositories MongoDB :

7 repositories implémentant les interfaces domaine :

```typescript
export class MongoDBUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null>
  async save(user: User): Promise<void>
  async findByEmail(email: string): Promise<User | null>
  // Mapping entité <-> document MongoDB
}
```

### Avantages driver natif :

- **Performance** optimale
- **Flexibilité** requêtes complexes
- **Contrôle** total sur la persistance
- **Simplicité** sans couche ORM

## Philosophie Do It Simple

### Optimisations appliquées :

#### Suppression des abstractions inutiles :

- **ControllerFactory supprimée** : Pas de logique métier, juste du câblage
- **Injection directe** dans routes.ts : Plus simple et transparent

#### Conservation des patterns utiles :

- **UserFactory** : Règles métier par rôle (statuts différents)
- **ChallengeFactory** : Calculs complexes avec stratégies

#### Code lisible et expressif :

```typescript
// Direct et compréhensible
const authController = new AuthController(
  container.get('CreateUser'),
  container.get('AuthenticateUser')
  // ...
)
```

### Règles appliquées :

1. **Pas d'abstractions** sans logique métier réelle
2. **Code expressif** et humanisé
3. **Suppression systématique** du code mort
4. **Patterns justifiés** par la valeur métier
5. **Architecture simple** mais maintenable

### Résultat :

Architecture **Clean & Hexagonale** optimisée :

- Patterns appliqués avec discernement
- Code simple mais professionnel
- Maintenabilité sans sur-ingénierie
- Équilibre parfait simplicité/qualité

Cette documentation reflète l'état actuel de l'application : une architecture Clean optimisée avec des patterns appliqués uniquement quand ils apportent une vraie valeur métier.
