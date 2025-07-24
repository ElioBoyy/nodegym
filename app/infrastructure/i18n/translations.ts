import { I18nTranslations } from '../services/i18n_service.js'

export const englishTranslations: I18nTranslations = {
  email: {
    welcome: {
      subject: 'Welcome to Gym API!',
      body: 'Welcome {{userName}}!\n\nThank you for joining our fitness community.\nStart your fitness journey today by exploring challenges and earning badges!',
    },
    challengeInvitation: {
      subject: 'New Challenge: {{challengeTitle}}',
      body: 'New Challenge Available!\n\nA new challenge "{{challengeTitle}}" is now available.\nJoin now and compete with other fitness enthusiasts!',
    },
    badgeEarned: {
      subject: 'Congratulations! You earned a badge',
      body: 'Badge Earned!\n\nCongratulations! You have earned the "{{badgeName}}" badge.\nKeep up the great work!',
    },
    gymApproval: {
      subject: 'Gym Application Approved',
      body: 'Gym Approved!\n\nYour gym "{{gymName}}" has been approved.\nYou can now start creating challenges for your members!',
    },
    challengeCompleted: {
      subject: 'Challenge Completed: {{challengeTitle}}',
      body: 'Challenge Completed!\n\nCongratulations! You have completed the "{{challengeTitle}}" challenge.\nGreat job on finishing this challenge!',
    },
    challengeJoined: {
      subject: 'Challenge Joined: {{challengeTitle}}',
      body: 'Challenge Joined!\n\nYou have successfully joined the "{{challengeTitle}}" challenge.\nGood luck and have fun!',
    },
    fallback: {
      email: 'fallback@example.com',
    },
  },
  errors: {
    userNotFound: 'User with ID {{userId}} not found',
    smtpError: 'SMTP email service error: {{error}}',
  },
}

export const frenchTranslations: I18nTranslations = {
  email: {
    welcome: {
      subject: 'Bienvenue sur Gym API !',
      body: "Bienvenue {{userName}} !\n\nMerci de rejoindre notre communauté fitness.\nCommencez votre parcours fitness dès aujourd'hui en explorant les défis et en gagnant des badges !",
    },
    challengeInvitation: {
      subject: 'Nouveau Défi : {{challengeTitle}}',
      body: 'Nouveau Défi Disponible !\n\nUn nouveau défi "{{challengeTitle}}" est maintenant disponible.\nRejoignez-nous et mesurez-vous aux autres passionnés de fitness !',
    },
    badgeEarned: {
      subject: 'Félicitations ! Vous avez gagné un badge',
      body: 'Badge Gagné !\n\nFélicitations ! Vous avez gagné le badge "{{badgeName}}".\nContinuez votre excellent travail !',
    },
    gymApproval: {
      subject: 'Candidature de Salle Approuvée',
      body: 'Salle Approuvée !\n\nVotre salle "{{gymName}}" a été approuvée.\nVous pouvez maintenant commencer à créer des défis pour vos membres !',
    },
    challengeCompleted: {
      subject: 'Défi Terminé : {{challengeTitle}}',
      body: 'Défi Terminé !\n\nFélicitations ! Vous avez terminé le défi "{{challengeTitle}}".\nBravo pour avoir terminé ce défi !',
    },
    challengeJoined: {
      subject: 'Défi Rejoint : {{challengeTitle}}',
      body: 'Défi Rejoint !\n\nVous avez rejoint avec succès le défi "{{challengeTitle}}".\nBonne chance et amusez-vous bien !',
    },
    fallback: {
      email: 'fallback@example.com',
    },
  },
  errors: {
    userNotFound: "Utilisateur avec l'ID {{userId}} introuvable",
    smtpError: 'Erreur du service email SMTP : {{error}}',
  },
}

export const spanishTranslations: I18nTranslations = {
  email: {
    welcome: {
      subject: '¡Bienvenido a Gym API!',
      body: '¡Bienvenido {{userName}}!\n\nGracias por unirte a nuestra comunidad fitness.\n¡Comienza tu viaje fitness hoy explorando desafíos y ganando insignias!',
    },
    challengeInvitation: {
      subject: 'Nuevo Desafío: {{challengeTitle}}',
      body: '¡Nuevo Desafío Disponible!\n\nUn nuevo desafío "{{challengeTitle}}" está ahora disponible.\n¡Únete ahora y compite con otros entusiastas del fitness!',
    },
    badgeEarned: {
      subject: '¡Felicidades! Has ganado una insignia',
      body: '¡Insignia Ganada!\n\n¡Felicidades! Has ganado la insignia "{{badgeName}}".\n¡Sigue con el excelente trabajo!',
    },
    gymApproval: {
      subject: 'Solicitud de Gimnasio Aprobada',
      body: '¡Gimnasio Aprobado!\n\nTu gimnasio "{{gymName}}" ha sido aprobado.\n¡Ahora puedes comenzar a crear desafíos para tus miembros!',
    },
    challengeCompleted: {
      subject: 'Desafío Completado: {{challengeTitle}}',
      body: '¡Desafío Completado!\n\n¡Felicidades! Has completado el desafío "{{challengeTitle}}".\n¡Excelente trabajo terminando este desafío!',
    },
    challengeJoined: {
      subject: 'Desafío Unido: {{challengeTitle}}',
      body: '¡Desafío Unido!\n\nTe has unido exitosamente al desafío "{{challengeTitle}}".\n¡Buena suerte y diviértete!',
    },
    fallback: {
      email: 'fallback@example.com',
    },
  },
  errors: {
    userNotFound: 'Usuario con ID {{userId}} no encontrado',
    smtpError: 'Error del servicio de email SMTP: {{error}}',
  },
}
