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
   git clone https://github.com/dfasani/fasapico.git
   cd fasapico/examples/webapp/mecaquad_control
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env.local` à la racine de `examples/webapp/mecaquad_control` :
   ```env
   NEXT_PUBLIC_MQTT_URL=wss://mqtt.dev.icam.school:9001/mqtt
   NEXT_PUBLIC_MQTT_USERNAME=votre-user
   NEXT_PUBLIC_MQTT_PASSWORD=votre-pass
   ```

4. **Lancer en local**
   ```bash
   npm run dev
   ```
   Accédez à `http://localhost:3000`.

## 📦 Déploiement sur Vercel

1. Poussez votre code sur GitHub.
2. Importez le projet dans Vercel ("Add New Project").
3. Sélectionnez le dossier racine : `examples/webapp/mecaquad_control`.
4. Ajoutez les Variables d'Environnement dans la console Vercel :
   - `NEXT_PUBLIC_MQTT_URL` (valeur par défaut: `wss://mqtt.dev.icam.school:9001/mqtt`)
   - `NEXT_PUBLIC_MQTT_USERNAME`
   - `NEXT_PUBLIC_MQTT_PASSWORD`
5. Déployez ! 🚀

## 📡 Protocole MQTT

**Topic Base** : `bzh/iot/voiture/[nomVoiture]/`

| Topic   | Direction | Description |
|OS|OS|OS|
| `.../cmd` | Publier | Commandes : `avancer`, `reculer`, `stop`, JSON `{traingauche: val, traindroit: val}` |
| `.../distance` | S'abonner | Valeur du capteur ultrason (cm) |
| `.../status` | S'abonner | Statut du robot (Online/Offline) |
