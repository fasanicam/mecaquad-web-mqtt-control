# MecaQuad Control - WebApp 🚗

Application de pilotage pour robot Mecanum (Raspberry Pi Pico W) via MQTT.

## 🌟 Fonctionnalités

- **Pilotage Directionnel** : Avancer, reculer, rotations, diagonales, déplacements latéraux.
- **Contrôle Différentiel** : Sliders indépendants pour chaque train de chenilles/roues (0-65535).
- **Télémétrie Temps Réel** : Distance (capteur ultrason) et statut de connexion.
- **Interface Moderne** : Glassmorphism, Responsive, Dark Mode.
- **Configuration** : Nom de la voiture configurable (localStorage).

## 🛠 Tech Stack

- **Framework** : Next.js 15 (App Router)
- **UI** : React 18, TailwindCSS, Lucide Icons
- **Communication** : MQTT over WebSockets (`mqtt` library)
- **Hosting** : Vercel Ready

## 🚀 Installation & Développement

1. **Cloner le projet**
   ```bash
   git clone https://github.com/fasanicam/mecaquad-web-mqtt-control.git
   cd mecaquad-web-mqtt-control
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env.local` à la racine :
   ```env
   NEXT_PUBLIC_MQTT_URL=wss://mqtt.dev.icam.school:9001/mqtt
   NEXT_PUBLIC_MQTT_USERNAME=votre-user
   NEXT_PUBLIC_MQTT_PASSWORD=votre-pass
   ```
   *Note : L'URL du broker peut aussi être configurée directement dans l'interface de l'application (via le bouton paramètres).*

4. **Lancer en local**
   ```bash
   npm run dev
   ```
   Accédez à [http://localhost:3000](http://localhost:3000).

## 📦 Déploiement sur Vercel

1. Poussez votre code sur GitHub.
2. Importez le projet dans Vercel ("Add New Project").
3. Sélectionnez le dépôt `mecaquad-web-mqtt-control`.
4. Ajoutez les Variables d'Environnement dans la console Vercel (si nécessaire, sinon elles peuvent être configurées côté client) :
   - `NEXT_PUBLIC_MQTT_URL` (Défaut : `wss://mqtt.dev.icam.school:9001/mqtt`)
5. Déployez ! 🚀

## 📡 Protocole MQTT

**Topic Base** : `bzh/iot/voiture/[nomVoiture]/`

| Topic | Direction | Description |
|-------|-----------|-------------|
| `.../cmd` | Publier | Commandes simples (ex: `avancer`, `stop`) ou JSON pour le différentiel (`{traingauche: val, traindroit: val}`). |
| `.../distance` | S'abonner | Valeur du capteur ultrason (en cm ou brut). |
| `.../status` | S'abonner | Statut de connexion du robot (ex: `Online`, `Offline`). |

## 🕹️ Commandes Joystick supportées

- `avancer`, `reculer`, `stop`
- `glisser_gauche`, `glisser_droite`
- `rotation_horaire`, `rotation_anti_horaire`
- Diagonales : `diagonale_avant_gauche`, `diagonale_avant_droite`, `diagonale_arriere_gauche`, `diagonale_arriere_droite`
