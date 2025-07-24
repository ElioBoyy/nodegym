# Documentation Technique Complète - Gym API

## Table des Matières

1. [Vue d'ensemble du Projet](#vue-densemble-du-projet)
2. [Architecture Hexagonale](#architecture-hexagonale)
3. [Principes SOLID](#principes-solid)
4. [CQRS (Command Query Responsibility Segregation)](#cqrs-command-query-responsibility-segregation)
5. [Factory Pattern](#factory-pattern)
6. [Dependency Injection](#dependency-injection)
7. [Structure des Couches](#structure-des-couches)
8. [Gestion des Erreurs](#gestion-des-erreurs)
9. [Validation et DTOs](#validation-et-dtos)
10. [Événements Domaine](#événements-domaine)
11. [Tests](#tests)
12. [Configuration et Déploiement](#configuration-et-déploiement)
13. [Philosophie "Do It Simple"](#philosophie-do-it-simple)

---

## Vue d'ensemble du Projet

### Présentation

Cette API Gym est construite avec **AdonisJS 6** et implémente une architecture hexagonale stricte avec les principes Clean Architecture. Le projet gère un système complet de fitness avec gestion des utilisateurs, salles de sport, défis et badges.

### Technologies Principales

- **Framework**: AdonisJS 6 (Node.js/TypeScript)
- **Base de données**: MongoDB (driver natif, pas d'ORM)
- **Architecture**: Hexagonale + Clean Architecture
- **Patterns**: CQRS, Factory, Repository, Strategy
- **Tests**: Japa (Unit + Functional)
- **Validation**: VineJS

### Pourquoi ces Choix ?

#### AdonisJS sans ORM
```typescript
// ✅ Contrôle total sur les requêtes MongoDB
const users = await db.collection('users').aggregate([
  { $match: { role: 'client' } },
  { $lookup: { from: 'gyms', localField: 'gymId', foreignField: '_id', as: 'gym' } }
])

// ❌ Évite la complexité des ORMs
// - Pas de migrations complexes
// - Performance optimisée
// - Requêtes MongoDB natives
```

---

## Architecture Hexagonale

### Principe Fondamental

L'architecture hexagonale (Ports & Adapters) isole la logique métier des détails techniques en créant des interfaces (ports) et des implémentations (adapters).

```
                    ┌─────────────────────────────┐
                    │                             │
                    │       INFRASTRUCTURE        │
                    │                             │
        ┌───────────┼─────────────────────────────┼───────────┐
        │           │                             │           │
        │    REST   │         MongoDB             │   JWT     │
        │ Controllers│        Repository           │ Service   │
        │           │         Adapter             │           │
        └───────────┼─────────────────────────────┼───────────┘
                    │                             │
                ┌───┴─────────────────────────────┴───┐
                │                                     │
                │           PORTS                     │
                │    (Domain Interfaces)              │
                │                                     │
                └─────────────────┬───────────────────┘
                                  │
                ┌─────────────────┴───────────────────┐
                │                                     │
                │          DOMAIN CORE                │
                │                                     │
                │  ┌─────────────┐ ┌─────────────┐   │
                │  │  Entities   │ │   Factories │   │
                │  └─────────────┘ └─────────────┘   │
                │  ┌─────────────┐ ┌─────────────┐   │
                │  │   Services  │ │   Events    │   │
                │  └─────────────┘ └─────────────┘   │
                │                                     │
                └─────────────────────────────────────┘
```

### Implémentation dans le Projet

#### Ports (Interfaces Domaine)
```typescript
// app/domain/repositories/user_repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<User>
  delete(id: string): Promise<void>
}
```

#### Adapters (Implémentations Infrastructure)
```typescript
// app/infrastructure/repositories/mongodb_user_repository.ts
export class MongoDbUserRepository implements UserRepository {
  constructor(private db: Db) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.db.collection('users').findOne({ _id: new ObjectId(id) })
    return userData ? UserFactory.fromSnapshot(userData) : null
  }

  async save(user: User): Promise<User> {
    const document = this.toDocument(user)
    await this.db.collection('users').replaceOne(
      { _id: new ObjectId(user.id) }, 
      document, 
      { upsert: true }
    )
    return user
  }
}
```

### Avantages de l'Architecture Hexagonale

1. **Testabilité**: Mock facile des dépendances externes
2. **Flexibilité**: Changement de DB/Framework sans impact domaine
3. **Maintenabilité**: Séparation claire des responsabilités
4. **Évolutivité**: Ajout de nouveaux adapters sans modification du core

---

## Principes SOLID

### S - Single Responsibility Principle

Chaque classe a une seule raison de changer.

```typescript
// ✅ UNE responsabilité : créer des utilisateurs
export class CreateUser {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    const hashedPassword = await this.passwordService.hash(request.password)
    const user = UserFactory.create({ ...request, password: hashedPassword })
    
    await this.userRepository.save(user)
    await this.eventDispatcher.dispatch(new UserCreatedEvent(user))
    
    return user
  }
}

// ❌ Évité : classe qui fait tout
// class UserManager {
//   createUser() {}
//   authenticateUser() {}
//   updateUserProfile() {}
//   sendEmailNotification() {}
//   generateReport() {}
// }
```

### O - Open/Closed Principle

Ouvert à l'extension, fermé à la modification.

```typescript
// ✅ Interface ouverte à l'extension
export interface NotificationService {
  send(notification: Notification): Promise<void>
}

// Extensions sans modifier l'existant
export class EmailNotificationService implements NotificationService {
  async send(notification: Notification): Promise<void> {
    // Implémentation email
  }
}

export class SlackNotificationService implements NotificationService {
  async send(notification: Notification): Promise<void> {
    // Implémentation Slack
  }
}

// Utilisation polymorphe
class NotifyUser {
  constructor(private notificationService: NotificationService) {}
  
  async execute(userId: string, message: string): Promise<void> {
    // Fonctionne avec n'importe quelle implémentation
    await this.notificationService.send(new Notification(userId, message))
  }
}
```

### L - Liskov Substitution Principle

Les objets dérivés doivent pouvoir remplacer leurs objets de base.

```typescript
// ✅ Toutes les implémentations respectent le contrat
abstract class ChallengeStrategy {
  abstract calculateRecommendedDuration(challenge: Challenge): number
  abstract calculateMaxParticipants(challenge: Challenge): number
}

class BeginnerStrategy extends ChallengeStrategy {
  calculateRecommendedDuration(): number { return 7 } // 7 jours
  calculateMaxParticipants(): number { return 50 }
}

class AdvancedStrategy extends ChallengeStrategy {
  calculateRecommendedDuration(): number { return 21 } // 21 jours
  calculateMaxParticipants(): number { return 15 }
}

// Substitution transparente
function createChallenge(strategy: ChallengeStrategy, data: ChallengeData) {
  const duration = strategy.calculateRecommendedDuration(challenge) // Fonctionne avec toutes
  const maxParticipants = strategy.calculateMaxParticipants(challenge)
}
```

### I - Interface Segregation Principle

Pas de dépendance sur des interfaces inutilisées.

```typescript
// ✅ Interfaces spécialisées
export interface Readable<T> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
}

export interface Writable<T> {
  save(entity: T): Promise<T>
  delete(id: string): Promise<void>
}

// Les classes n'implémentent que ce qu'elles utilisent
export class ReadOnlyUserService implements Readable<User> {
  // Pas obligé d'implémenter save/delete
}

export class UserRepository implements Readable<User>, Writable<User> {
  // Implémente tout car c'est son rôle
}

// ❌ Évité : interface monolithique
// interface Repository<T> {
//   findById(id: string): Promise<T | null>
//   save(entity: T): Promise<T>
//   delete(id: string): Promise<void>
//   backup(): Promise<void>
//   migrate(): Promise<void>
//   generateReport(): Promise<string>
// }
```

### D - Dependency Inversion Principle

Dépendre des abstractions, pas des implémentations concrètes.

```typescript
// ✅ Use case dépend de l'abstraction
export class AuthenticateUser {
  constructor(
    private userRepository: UserRepository, // Interface
    private passwordService: PasswordService, // Interface
    private jwtService: JwtService // Interface
  ) {}
}

// ✅ DI Container injecte les implémentations
container.bind('UserRepository', () => new MongoDbUserRepository(db))
container.bind('PasswordService', () => new BcryptPasswordService())
container.bind('JwtService', () => new JoseJwtService())

// ❌ Évité : dépendance directe
// export class AuthenticateUser {
//   private userRepository = new MongoDbUserRepository()
//   private passwordService = new BcryptPasswordService()
// }
```

---

## CQRS (Command Query Responsibility Segregation)

### Principe CQRS

Séparation des opérations de lecture (Queries) et d'écriture (Commands).

```
Commands (Écriture)          Queries (Lecture)
      │                           │
      ▼                           ▼
┌─────────────┐              ┌─────────────┐
│   Use Cases │              │   Use Cases │
│             │              │             │
│ CreateUser  │              │ GetUserById │
│ UpdateGym   │              │ GetGyms     │
│ JoinChall.  │              │ GetStats    │
└─────────────┘              └─────────────┘
      │                           │
      ▼                           ▼
┌─────────────┐              ┌─────────────┐
│  Write DB   │              │   Read DB   │
│ (Optimized  │              │ (Optimized  │
│ for writes) │              │ for reads)  │
└─────────────┘              └─────────────┘
```

### Implémentation dans le Projet

#### Commands (Modifications)
```typescript
// app/application/use_cases/user/create_user.ts
export class CreateUser implements CommandHandler<CreateUserCommand, User> {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async handle(command: CreateUserCommand): Promise<User> {
    // Logique d'écriture complexe
    const existingUser = await this.userRepository.findByEmail(command.email)
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email)
    }

    const hashedPassword = await this.passwordService.hash(command.password)
    const user = UserFactory.create({ ...command, password: hashedPassword })
    
    await this.userRepository.save(user)
    await this.eventDispatcher.dispatch(new UserCreatedEvent(user))
    
    return user
  }
}
```

#### Queries (Lectures)
```typescript
// app/application/use_cases/user/get_user_by_id.ts
export class GetUserById implements QueryHandler<GetUserByIdQuery, User> {
  constructor(private userRepository: UserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<User> {
    // Logique de lecture simple
    const user = await this.userRepository.findById(query.userId)
    if (!user) {
      throw new UserNotFoundError(query.userId)
    }
    return user
  }
}
```

#### Médiateur CQRS
```typescript
// app/application/cqrs/mediator.ts
export class CQRSMediator {
  constructor(private container: DIContainer) {}

  async execute<TResult>(command: Command): Promise<TResult> {
    const handlerName = command.constructor.name.replace('Command', '')
    const handler = this.container.get<CommandHandler<any, TResult>>(handlerName)
    return await handler.handle(command)
  }

  async query<TResult>(query: Query): Promise<TResult> {
    const handlerName = query.constructor.name.replace('Query', '') 
    const handler = this.container.get<QueryHandler<any, TResult>>(handlerName)
    return await handler.handle(query)
  }
}
```

### Avantages CQRS

1. **Performance**: Optimisations spécifiques lecture/écriture
2. **Scalabilité**: Scaling indépendant des opérations
3. **Complexité gérée**: Logiques séparées
4. **Évolutivité**: Ajout facile de nouvelles opérations

---

## Factory Pattern

### Principe du Factory Pattern

Les factories encapsulent la logique complexe de création d'objets métier.

### Factories Conservées (Logique Métier Complexe)

#### UserFactory - Gestion des Rôles
```typescript
// app/domain/factories/user_factory.ts
export class UserFactory {
  // ✅ Logique métier : rôles ont des états par défaut différents
  static createClient(email: string, firstName: string, lastName: string, password: string): User {
    return this.create({
      email, firstName, lastName, password,
      role: UserRole.CLIENT,
      isActive: true // Les clients sont actifs immédiatement
    })
  }

  static createGymOwner(email: string, firstName: string, lastName: string, password: string): User {
    return this.create({
      email, firstName, lastName, password,
      role: UserRole.GYM_OWNER,
      isActive: false // Les gym owners nécessitent validation
    })
  }

  static createSuperAdmin(email: string, firstName: string, lastName: string, password: string): User {
    return this.create({
      email, firstName, lastName, password,
      role: UserRole.SUPER_ADMIN,
      isActive: true // Les super admins sont toujours actifs
    })
  }
}
```

#### ChallengeFactory - Intégration Strategy Pattern
```typescript
// app/domain/factories/challenge_factory.ts
export class ChallengeFactory {
  static create(request: CreateChallengeRequest): Challenge {
    // ✅ Logique métier complexe
    const strategy = DifficultyStrategyFactory.createStrategy(request.difficulty)

    // Calculs de dates basés sur la difficulté
    const startDate = request.startDate || new Date()
    const recommendedDuration = strategy.calculateRecommendedDuration({} as Challenge)
    const endDate = request.endDate || 
      new Date(startDate.getTime() + recommendedDuration * 24 * 60 * 60 * 1000)

    // Participants maximum basés sur la difficulté
    const maxParticipants = request.maxParticipants || 
      strategy.calculateMaxParticipants({} as Challenge)

    // Calcul de durée en jours
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const challengeProps: ChallengeProps = {
      title: request.title,
      description: request.description,
      objectives: request.objectives,
      exerciseTypes: request.exerciseTypes,
      duration, // Calculé
      difficulty: request.difficulty,
      creatorId: request.creatorId,
      gymId: request.gymId,
      status: ChallengeStatus.ACTIVE,
      maxParticipants, // Calculé selon stratégie
      startDate,
      endDate
    }

    return Challenge.create(challengeProps)
  }

  // Convenience methods avec logique métier
  static createBeginnerChallenge(request: Omit<CreateChallengeRequest, 'difficulty'>): Challenge {
    return this.create({ ...request, difficulty: ChallengeDifficulty.BEGINNER })
  }
}
```

### Factory Supprimée (Pas de Logique Métier)

#### ControllerFactory - Simple Wiring DI
```typescript
// ❌ Supprimé : juste du wiring de dépendances
export class ControllerFactory {
  constructor(private container: DIContainer) {}

  createAuthController(): AuthController {
    // Aucune logique métier, juste de l'injection
    return new AuthController(
      this.container.get('CreateUser'),
      this.container.get('AuthenticateUser'),
      this.container.get('GetUserById'),
      this.container.get('JwtService'),
      this.container.get('UserRepository')
    )
  }
}

// ✅ Remplacé par : DI directe dans routes
const authController = new AuthController(
  container.get('CreateUser'),
  container.get('AuthenticateUser'),
  container.get('GetUserById'),
  container.get('JwtService'),
  container.get('UserRepository')
)
```

### Règle de Décision Factory

**✅ Créer une Factory si:**
- Logique de création complexe
- Calculs métier pendant la création
- Validation/transformation de données
- Intégration avec autres patterns (Strategy)
- Plusieurs variantes de création

**❌ Éviter une Factory si:**
- Simple mapping de paramètres
- Juste de l'injection de dépendances
- Aucune règle métier
- Création straightforward

---

## Dependency Injection

### Container DI Personnalisé

Le projet utilise un container DI personnalisé pour gérer les dépendances.

```typescript
// app/infrastructure/dependency_injection/container.ts
export class DIContainer {
  private static instance: DIContainer
  private bindings = new Map<string, () => any>()

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  bind<T>(name: string, factory: () => T): void {
    this.bindings.set(name, factory)
  }

  get<T>(name: string): T {
    const factory = this.bindings.get(name)
    if (!factory) {
      throw new Error(`No binding found for ${name}`)
    }
    return factory()
  }

  bindSingleton<T>(name: string, factory: () => T): void {
    let instance: T
    this.bindings.set(name, () => {
      if (!instance) {
        instance = factory()
      }
      return instance
    })
  }
}
```

### Configuration des Bindings

```typescript
// app/infrastructure/dependency_injection/bindings.ts
export function configureBindings(container: DIContainer, db: Db): void {
  // Repositories
  container.bindSingleton('UserRepository', () => new MongoDbUserRepository(db))
  container.bindSingleton('GymRepository', () => new MongoDbGymRepository(db))
  container.bindSingleton('ChallengeRepository', () => new MongoDbChallengeRepository(db))

  // Services
  container.bindSingleton('PasswordService', () => new BcryptPasswordService())
  container.bindSingleton('JwtService', () => new JoseJwtService())
  container.bindSingleton('NotificationService', () => new EmailNotificationService())

  // Use Cases
  container.bind('CreateUser', () => new CreateUser(
    container.get('UserRepository'),
    container.get('PasswordService'),
    container.get('DomainEventDispatcher')
  ))
  
  container.bind('AuthenticateUser', () => new AuthenticateUser(
    container.get('UserRepository'),
    container.get('PasswordService'),
    container.get('JwtService')
  ))

  // Queries
  container.bind('GetUserById', () => new GetUserById(
    container.get('UserRepository')
  ))
}
```

### Injection dans les Contrôleurs

```typescript
// start/routes.ts - DI directe sans factory
const container = DIContainer.getInstance()

const authController = new AuthController(
  container.get('CreateUser'),
  container.get('AuthenticateUser'),
  container.get('GetUserById'),
  container.get('JwtService'),
  container.get('UserRepository')
)

// Utilisation dans les routes
router.post('/api/auth/login', async (ctx) => {
  return authController.login(ctx)
})
```

### Avantages de cette Approche DI

1. **Testabilité**: Mock facile pour les tests
2. **Flexibilité**: Changement d'implémentation sans modification du code
3. **Performance**: Singletons pour les services stateless
4. **Lisibilité**: Dépendances explicites et claires

---

## Structure des Couches

### Domain Layer (Cœur Métier)

```
app/domain/
├── entities/                    # Objets métier purs
│   ├── user.ts                 # User avec méthodes métier
│   ├── gym.ts                  # Gym avec règles d'approbation
│   ├── challenge.ts            # Challenge avec statuts
│   ├── badge.ts                # Badge avec règles d'attribution
│   └── challenge_participation.ts # Participation avec tracking
├── factories/                   # Création complexe d'entités
│   ├── user_factory.ts         # Logique rôles utilisateurs
│   └── challenge_factory.ts    # Intégration stratégies difficulté
├── repositories/               # Interfaces d'accès données
│   ├── user_repository.ts      # Contrat persistance User
│   ├── gym_repository.ts       # Contrat persistance Gym
│   └── challenge_repository.ts # Contrat persistance Challenge
├── services/                   # Services domaine
│   ├── password_service.ts     # Interface hachage mots de passe
│   └── jwt_service.ts          # Interface gestion tokens
├── events/                     # Événements métier
│   ├── user_created_event.ts   # Événement création utilisateur
│   └── challenge_completed_event.ts # Événement fin défi
└── strategies/                 # Pattern Strategy
    └── challenge_difficulty_strategy.ts # Stratégies difficulté
```

#### Exemple d'Entité Métier
```typescript
// app/domain/entities/user.ts
export class User {
  private constructor(private props: UserProps & { id: string; createdAt: Date; updatedAt: Date }) {}

  // Factory method
  static create(props: UserProps): User {
    return new User({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Méthodes métier
  activate(): User {
    return new User({
      ...this.props,
      isActive: true,
      updatedAt: new Date()
    })
  }

  deactivate(): User {
    return new User({
      ...this.props,
      isActive: false,
      updatedAt: new Date()
    })
  }

  canManageGym(gymId: string): boolean {
    return this.props.role === UserRole.GYM_OWNER && this.props.isActive
  }

  // Getters immutables
  get id(): string { return this.props.id }
  get email(): string { return this.props.email }
  get role(): UserRole { return this.props.role }
  get isActive(): boolean { return this.props.isActive }
}
```

### Application Layer (Use Cases)

```
app/application/
├── use_cases/                  # Logique applicative
│   ├── user/                   # Use cases utilisateurs
│   │   ├── create_user.ts      # Création utilisateur
│   │   ├── authenticate_user.ts # Authentification
│   │   ├── activate_user.ts    # Activation compte
│   │   └── get_user_by_id.ts   # Récupération utilisateur
│   ├── gym/                    # Use cases salles
│   │   ├── create_gym.ts       # Création salle
│   │   ├── approve_gym.ts      # Approbation salle
│   │   └── get_gym_stats.ts    # Statistiques salle
│   └── challenge/              # Use cases défis
│       ├── create_challenge.ts # Création défi
│       ├── join_challenge.ts   # Rejoindre défi
│       └── complete_challenge.ts # Compléter défi
├── commands/                   # Commandes CQRS
│   ├── create_user_command.ts  # Commande création utilisateur
│   └── join_challenge_command.ts # Commande rejoindre défi
├── queries/                    # Requêtes CQRS
│   ├── get_user_by_id_query.ts # Requête utilisateur par ID
│   └── get_gym_stats_query.ts  # Requête stats salle
└── cqrs/                       # Infrastructure CQRS
    ├── mediator.ts             # Médiateur commandes/requêtes
    ├── command_handler.ts      # Interface handlers commandes
    └── query_handler.ts        # Interface handlers requêtes
```

#### Exemple Use Case
```typescript
// app/application/use_cases/challenge/join_challenge.ts
export class JoinChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ParticipationRepository,
    private userRepository: UserRepository,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async execute(request: JoinChallengeRequest): Promise<ChallengeParticipation> {
    // Validation métier
    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new ChallengeNotFoundError(request.challengeId)
    }

    if (!challenge.isActive()) {
      throw new ChallengeNotActiveError(request.challengeId)
    }

    // Vérification utilisateur
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isActive) {
      throw new UserNotActiveError(request.userId)
    }

    // Vérification participation existante
    const existingParticipation = await this.participationRepository
      .findByUserAndChallenge(request.userId, request.challengeId)
    if (existingParticipation) {
      throw new AlreadyParticipatingError(request.userId, request.challengeId)
    }

    // Vérification capacité
    const participantCount = await this.participationRepository
      .countByChallengeId(request.challengeId)
    if (participantCount >= challenge.maxParticipants) {
      throw new ChallengeFullError(request.challengeId)
    }

    // Création participation
    const participation = ChallengeParticipation.create({
      challengeId: request.challengeId,
      userId: request.userId
    })

    await this.participationRepository.save(participation)

    // Événement métier
    await this.eventDispatcher.dispatch(
      new UserJoinedChallengeEvent(participation.id, request.userId, request.challengeId)
    )

    return participation
  }
}
```

### Infrastructure Layer (Détails Techniques)

```
app/infrastructure/
├── database/                   # Configuration base de données
│   └── connection.ts           # Connexion MongoDB
├── repositories/               # Implémentations persistance
│   ├── mongodb_user_repository.ts     # Repo User MongoDB
│   ├── mongodb_gym_repository.ts      # Repo Gym MongoDB
│   └── mongodb_challenge_repository.ts # Repo Challenge MongoDB
├── services/                   # Implémentations services
│   ├── bcrypt_password_service.ts     # Service mot de passe Bcrypt
│   ├── jose_jwt_service.ts            # Service JWT Jose
│   └── email_notification_service.ts  # Service notification email
├── dependency_injection/       # Container DI
│   ├── container.ts            # Container personnalisé
│   └── bindings.ts             # Configuration bindings
└── anti_corruption/            # Couche anti-corruption
    └── external_notification_adapter.ts # Adapter services externes
```

#### Exemple Repository
```typescript
// app/infrastructure/repositories/mongodb_user_repository.ts
export class MongoDbUserRepository implements UserRepository {
  constructor(private db: Db) {}

  async findById(id: string): Promise<User | null> {
    try {
      const userData = await this.db.collection<UserDocument>('users')
        .findOne({ _id: new ObjectId(id) })
      
      return userData ? this.toDomainEntity(userData) : null
    } catch (error) {
      throw new DatabaseError(`Failed to find user by id: ${id}`, error)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userData = await this.db.collection<UserDocument>('users')
        .findOne({ email })
      
      return userData ? this.toDomainEntity(userData) : null
    } catch (error) {
      throw new DatabaseError(`Failed to find user by email: ${email}`, error)
    }
  }

  async save(user: User): Promise<User> {
    try {
      const document = this.toDocument(user)
      await this.db.collection('users').replaceOne(
        { _id: new ObjectId(user.id) },
        document,
        { upsert: true }
      )
      return user
    } catch (error) {
      throw new DatabaseError(`Failed to save user: ${user.id}`, error)
    }
  }

  private toDomainEntity(document: UserDocument): User {
    return UserFactory.fromSnapshot({
      id: document._id.toString(),
      email: document.email,
      firstName: document.firstName,
      lastName: document.lastName,
      password: document.password,
      role: document.role,
      isActive: document.isActive,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    })
  }

  private toDocument(user: User): UserDocument {
    return {
      _id: new ObjectId(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
```

### Presentation Layer (Controllers)

```
app/controllers/
├── auth_controller.ts          # Authentification
├── admin_controller.ts         # Administration
├── gym_owner_controller.ts     # Propriétaires salles
├── client_controller.ts        # Clients
├── gyms_controller.ts          # Gestion salles
├── challenges_controller.ts    # Gestion défis
├── participations_controller.ts # Participations
├── badges_controller.ts        # Badges
└── exercise_types_controller.ts # Types d'exercices
```

#### Exemple Controller
```typescript
// app/controllers/auth_controller.ts
export default class AuthController {
  constructor(
    private createUser: CreateUser,
    private authenticateUser: AuthenticateUser,
    private getUserById: GetUserById,
    private jwtService: JwtService,
    private userRepository: UserRepository
  ) {}

  async register(ctx: HttpContext): Promise<{ user: UserResponse; token: string }> {
    // Validation entrée
    const payload = await vine.validate({
      schema: createUserValidator,
      data: ctx.request.body()
    })

    try {
      // Exécution use case
      const user = await this.createUser.execute(payload)

      // Génération token
      const token = await this.jwtService.sign({ userId: user.id })

      // Réponse formatée
      return {
        user: this.toUserResponse(user),
        token
      }
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictError('Un utilisateur avec cet email existe déjà')
      }
      throw error
    }
  }

  async login(ctx: HttpContext): Promise<{ user: UserResponse; token: string }> {
    const payload = await vine.validate({
      schema: authenticateUserValidator,
      data: ctx.request.body()
    })

    try {
      const user = await this.authenticateUser.execute(payload)
      const token = await this.jwtService.sign({ userId: user.id })

      return {
        user: this.toUserResponse(user),
        token
      }
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedError('Email ou mot de passe incorrect')
      }
      throw error
    }
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  }
}
```

---

## Gestion des Erreurs

### Hiérarchie d'Erreurs

```typescript
// app/domain/errors/base_error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, public readonly details?: any) {
    super(message)
    this.name = this.constructor.name
  }
}

// Erreurs métier spécifiques
export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND'
  readonly statusCode = 404

  constructor(userId: string) {
    super(`User with id ${userId} not found`)
  }
}

export class ChallengeFullError extends DomainError {
  readonly code = 'CHALLENGE_FULL'
  readonly statusCode = 409

  constructor(challengeId: string) {
    super(`Challenge ${challengeId} is full`)
  }
}
```

### Middleware de Gestion d'Erreurs

```typescript
// app/middleware/error_handler.ts
export default class ErrorHandler {
  async handle(error: any, ctx: HttpContext) {
    if (error instanceof DomainError) {
      return ctx.response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      })
    }

    if (error instanceof ValidationError) {
      return ctx.response.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: error.messages
        }
      })
    }

    // Erreur interne
    ctx.logger.error(error)
    return ctx.response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue'
      }
    })
  }
}
```

---

## Validation et DTOs

### Validation avec VineJS

```typescript
// app/validators/user_validator.ts
import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    firstName: vine.string().minLength(2).maxLength(50),
    lastName: vine.string().minLength(2).maxLength(50),
    password: vine.string().minLength(8).maxLength(100),
    role: vine.enum(['client', 'gym_owner'])
  })
)

export const authenticateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string()
  })
)
```

### DTOs de Réponse

```typescript
// app/types/response_types.ts
export interface UserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

export interface GymResponse {
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  status: GymStatus
  owner: UserResponse
  createdAt: Date
}

export interface ChallengeResponse {
  id: string
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  difficulty: ChallengeDifficulty
  duration: number
  status: ChallengeStatus
  maxParticipants: number
  participantCount: number
  gym: GymResponse
  creator: UserResponse
  startDate: Date
  endDate: Date
  createdAt: Date
}
```

---

## Événements Domaine

### Event Sourcing Partiel

```typescript
// app/domain/events/domain_event.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date = new Date()
  public readonly eventId: string = crypto.randomUUID()

  abstract readonly eventType: string
}

// Événements spécifiques
export class UserCreatedEvent extends DomainEvent {
  readonly eventType = 'USER_CREATED'

  constructor(public readonly user: User) {
    super()
  }
}

export class ChallengeCompletedEvent extends DomainEvent {
  readonly eventType = 'CHALLENGE_COMPLETED'

  constructor(
    public readonly participationId: string,
    public readonly userId: string,
    public readonly challengeId: string
  ) {
    super()
  }
}
```

### Event Handlers

```typescript
// app/application/integration/domain_event_handlers.ts
export class DomainEventHandlers {
  constructor(
    private notificationService: NotificationService,
    private badgeService: BadgeService
  ) {}

  @EventHandler(UserCreatedEvent)
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // Envoi email de bienvenue
    await this.notificationService.send(new WelcomeNotification(event.user))
  }

  @EventHandler(ChallengeCompletedEvent)
  async handleChallengeCompleted(event: ChallengeCompletedEvent): Promise<void> {
    // Attribution automatique de badges
    await this.badgeService.checkAndAwardBadges(event.userId)
    
    // Notification de félicitations
    await this.notificationService.send(
      new ChallengeCompletionNotification(event.userId, event.challengeId)
    )
  }
}
```

---

## Tests

### Structure des Tests

```
tests/
├── unit/                       # Tests unitaires
│   ├── domain/
│   │   ├── entities/           # Tests entités
│   │   └── factories/          # Tests factories
│   └── application/
│       └── use_cases/          # Tests use cases
├── functional/                 # Tests d'intégration
│   ├── auth/                   # Tests authentification
│   ├── gyms/                   # Tests gestion salles
│   └── challenges/             # Tests défis
└── helpers/                    # Utilitaires tests
    ├── test_database.ts        # Base de données test
    └── fixtures.ts             # Données de test
```

### Tests Unitaires Domaine

```typescript
// tests/unit/domain/entities/user.test.ts
import { test } from '@japa/runner'
import { User, UserRole } from '#domain/entities/user'
import { UserFactory } from '#domain/factories/user_factory'

test.group('User Entity', () => {
  test('should activate user', async ({ assert }) => {
    const user = UserFactory.createGymOwner('test@example.com', 'John', 'Doe', 'password')
    assert.isFalse(user.isActive)

    const activatedUser = user.activate()
    assert.isTrue(activatedUser.isActive)
    assert.notEqual(user.updatedAt, activatedUser.updatedAt)
  })

  test('should check gym management permission', async ({ assert }) => {
    const gymOwner = UserFactory.createGymOwner('owner@example.com', 'Jane', 'Smith', 'password')
    const activeOwner = gymOwner.activate()

    assert.isFalse(gymOwner.canManageGym('gym-id'))
    assert.isTrue(activeOwner.canManageGym('gym-id'))
  })
})
```

### Tests Use Cases avec Mocks

```typescript
// tests/unit/application/use_cases/create_user.test.ts
import { test } from '@japa/runner'
import { CreateUser } from '#application/use_cases/user/create_user'
import { UserAlreadyExistsError } from '#domain/errors/user_errors'

test.group('CreateUser Use Case', () => {
  test('should create new user successfully', async ({ assert }) => {
    const mockUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((user) => Promise.resolve(user))
    }
    const mockPasswordService = {
      hash: vi.fn().mockResolvedValue('hashedPassword')
    }
    const mockEventDispatcher = {
      dispatch: vi.fn().mockResolvedValue(void 0)
    }

    const createUser = new CreateUser(
      mockUserRepository,
      mockPasswordService,
      mockEventDispatcher
    )

    const request = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: UserRole.CLIENT
    }

    const user = await createUser.execute(request)

    assert.equal(user.email, request.email)
    assert.isTrue(user.isActive)
    assert.equal(mockPasswordService.hash.mock.calls[0][0], 'password123')
    assert.equal(mockUserRepository.save.mock.calls.length, 1)
  })

  test('should throw error if user already exists', async ({ assert }) => {
    const existingUser = UserFactory.createClient('test@example.com', 'Jane', 'Doe', 'password')
    const mockUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      save: vi.fn()
    }

    const createUser = new CreateUser(mockUserRepository, null, null)

    await assert.rejects(
      () => createUser.execute({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: UserRole.CLIENT
      }),
      UserAlreadyExistsError
    )
  })
})
```

### Tests Fonctionnels

```typescript
// tests/functional/auth/registration.test.ts
import { test } from '@japa/runner'
import { TestDatabase } from '#tests/helpers/test_database'

test.group('User Registration', (group) => {
  group.setup(async () => {
    await TestDatabase.setup()
  })

  group.teardown(async () => {
    await TestDatabase.cleanup()
  })

  test('should register new client successfully', async ({ client, assert }) => {
    const userData = {
      email: 'client@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: 'client'
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'client',
        isActive: true
      }
    })

    assert.properties(response.body(), ['user', 'token'])
    assert.isString(response.body().token)
  })

  test('should not register user with existing email', async ({ client }) => {
    const userData = {
      email: 'duplicate@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'password123',
      role: 'client'
    }

    await client.post('/api/auth/register').json(userData)

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(409)
    response.assertBodyContains({
      error: {
        code: 'USER_ALREADY_EXISTS'
      }
    })
  })
})
```

---

## Configuration et Déploiement

### Variables d'Environnement

```bash
# .env
NODE_ENV=development
PORT=3333
APP_KEY=your-secret-app-key

# Database
MONGODB_URI=mongodb://localhost:27017/gym_api
MONGODB_DATABASE=gym_api

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Notifications
NOTIFICATION_EMAIL_FROM=noreply@gymapi.com
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: gym_api
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  app:
    build: .
    ports:
      - "3333:3333"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/gym_api?authSource=admin
    depends_on:
      - mongodb
    volumes:
      - ./uploads:/app/uploads

volumes:
  mongodb_data:
```

### Scripts de Déploiement

```json
{
  "scripts": {
    "dev": "node ace serve --hmr",
    "build": "node ace build",
    "start": "node build/bin/server.js",
    "test": "node ace test",
    "test:unit": "node ace test --filter=unit",
    "test:functional": "node ace test --filter=functional",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "docker:build": "docker build -t gym-api .",
    "docker:run": "docker-compose up -d",
    "docker:stop": "docker-compose down",
    "db:seed": "node ace db:seed",
    "db:migrate": "node ace migration:run"
  }
}
```

---

## Philosophie "Do It Simple"

### Principes Appliqués

#### 1. Pas de Sur-Ingénierie

**✅ Bon exemple - Factory supprimée:**
```typescript
// Avant (sur-ingénierie)
const factory = getControllerFactory()
const controller = factory.createAuthController()
return controller.login(ctx)

// Après (simple)
return authController.login(ctx)
```

**✅ Bon exemple - Repository direct:**
```typescript
// Simple et efficace
async findById(id: string): Promise<User | null> {
  const userData = await this.db.collection('users').findOne({ _id: new ObjectId(id) })
  return userData ? UserFactory.fromSnapshot(userData) : null
}
```

#### 2. Séparation Clara des Responsabilités

**Une classe = une responsabilité:**
```typescript
// ✅ Use case focalisé
export class CreateUser {
  async execute(request: CreateUserRequest): Promise<User> {
    // Seule responsabilité: créer un utilisateur
  }
}

// ✅ Repository focalisé
export class MongoDbUserRepository {
  // Seule responsabilité: persistance User
}
```

#### 3. Code Lisible et Maintenable

**✅ Nommage explicite:**
```typescript
class ChallengeFactory {
  static createBeginnerChallenge() {} // Intention claire
  static createAdvancedChallenge() {}  // Pas d'ambiguïté
}

class UserFactory {
  static createClient() {}     // Rôle évident
  static createGymOwner() {}   // Comportement prévisible
}
```

#### 4. Éviter la Complexité Inutile

**✅ CQRS simple:**
```typescript
// Commands simples
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly password: string,
    public readonly role: UserRole
  ) {}
}

// Queries simples
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}
```

#### 5. Tests Compréhensibles

```typescript
test('should create beginner challenge with correct defaults', async ({ assert }) => {
  const request = {
    title: 'Mon Premier Défi',
    description: 'Un défi pour débuter',
    objectives: ['Objectif 1'],
    exerciseTypes: ['Cardio'],
    creatorId: 'user-id',
    gymId: 'gym-id'
  }

  const challenge = ChallengeFactory.createBeginnerChallenge(request)

  assert.equal(challenge.difficulty, ChallengeDifficulty.BEGINNER)
  assert.equal(challenge.maxParticipants, 50) // Défaut débutant
  assert.equal(challenge.duration, 7) // 7 jours pour débutant
})
```

### Règles "Do It Simple"

1. **YAGNI** (You Aren't Gonna Need It) - Ne pas implémenter ce qui n'est pas nécessaire maintenant
2. **KISS** (Keep It Simple, Stupid) - Toujours choisir la solution la plus simple qui fonctionne
3. **DRY** (Don't Repeat Yourself) - Mais pas au détriment de la lisibilité
4. **Composition over Inheritance** - Préférer la composition à l'héritage
5. **Explicit over Implicit** - Le code doit être explicite et sans surprise

### Métriques de Simplicité

**✅ Bonnes métriques du projet:**
- **Cyclomatic Complexity**: < 10 par méthode
- **Ligne par méthode**: < 20 lignes
- **Paramètres par méthode**: < 5 paramètres
- **Dépendances par classe**: < 7 dépendances
- **Niveau d'imbrication**: < 4 niveaux

### Anti-Patterns Évités

```typescript
// ❌ God Class évitée
// class UserManager {
//   createUser() {}
//   updateUser() {}
//   deleteUser() {}
//   authenticateUser() {}
//   sendEmail() {}
//   generateReport() {}
//   managePermissions() {}
// }

// ❌ Feature Envy évitée
// class OrderProcessor {
//   process(order: Order) {
//     order.customer.address.validate()
//     order.customer.creditCard.charge()
//     order.customer.email.send()
//   }
// }

// ❌ Primitive Obsession évitée
// function createUser(email: string, firstName: string, lastName: string, 
//                    password: string, role: string, isActive: boolean,
//                    createdAt: string, updatedAt: string) {}
```

---

## Conclusion

Cette architecture représente un équilibre optimal entre:

- **Robustesse** grâce aux principes SOLID et à l'architecture hexagonale
- **Simplicité** grâce à la philosophie "Do It Simple"
- **Maintenabilité** grâce à la séparation claire des responsabilités
- **Testabilité** grâce à l'injection de dépendances et aux interfaces
- **Évolutivité** grâce à la structure modulaire et aux patterns appliqués

Le projet démontre qu'il est possible d'avoir une architecture sophistiquée tout en gardant le code simple, lisible et maintenable. Chaque pattern et principe utilisé apporte une valeur concrète sans ajouter de complexité inutile.

### Prochaines Évolutions Possibles

1. **Event Sourcing Complet** - Si le tracking historique devient critique
2. **CQRS avec Base Séparée** - Si les performances lecture/écriture divergent
3. **Microservices** - Si l'équipe grandit et les domaines deviennent autonomes
4. **Cache Distribué** - Si la scalabilité devient un enjeu
5. **GraphQL** - Si les clients ont des besoins de requêtes flexibles

Mais toujours en gardant le principe : **"Do It Simple"** - n'implémenter que ce qui est nécessaire, quand c'est nécessaire.