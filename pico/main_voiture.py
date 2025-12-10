from fasapico import *
import time

# --- Configuration Logging ---
# --- Configuration Logging ---
enable_logging_types(LOG_DEBUG)

# --- Configuration du Projet ---
# Tentative d'import depuis settings.py, sinon valeurs par defaut
try:
    from settings import WIFI_SSID, WIFI_PWD, SERVER_BROKER, PORT_BROKER, NOM_GROUPE
except ImportError:
    WIFI_SSID = "icam_iot"
    WIFI_PWD = "Summ3#C@mp2022"
    SERVER_BROKER = "mqtt.dev.icam.school"
    PORT_BROKER = 1883
    NOM_GROUPE = "monGroupe"

# --- Topics MQTT ---
TOPIC_BASE = f"bzh/iot/voiture/{NOM_GROUPE}"
TOPIC_CMD = f"{TOPIC_BASE}/cmd"
TOPIC_DISTANCE = f"{TOPIC_BASE}/distance"
TOPIC_STATUS = f"{TOPIC_BASE}/status"

# --- Variables globales ---
clientMQTT = None
# Pin definition à vérifier sur votre montage (ex: Pin 16 ou port Grove)
distance_sensor = GroveUltrasonicRanger(16)



# Init Moteurs 
moteur_a = Moteur(broche_in1=11, broche_in2=12, broche_pwm=13, vitesse=50000)
moteur_b = Moteur(broche_in1=9, broche_in2=10, broche_pwm=8, vitesse=50000)
moteur_c = Moteur(broche_in1=6, broche_in2=5, broche_pwm=7, vitesse=50000)
moteur_d = Moteur(broche_in1=4, broche_in2=3, broche_pwm=2, vitesse=50000)
voiture = Voiture(moteur_a, moteur_b, moteur_c, moteur_d)

# Vitesse par défaut




def on_message_callback(topic, msg):
    try:
        topic_str = decode_bytes(topic)
        msg_str = decode_bytes(msg)
        
        if topic_str.endswith("/cmd"):
            cmd = msg_str.strip()
            info(f"ACTION: {cmd}")
            
            if cmd == "avancer": 
                voiture.avancer()
            elif cmd == "reculer": 
                voiture.reculer()
            elif cmd == "stop": 
                voiture.stop()
            elif cmd == "gauche": 
                voiture.glisser_gauche()
            elif cmd == "droite": 
                voiture.glisser_droite()
            elif cmd == "rotation_horaire": 
                voiture.rotation_horaire()
            elif cmd == "rotation_anti_horaire": 
                voiture.rotation_anti_horaire()
            elif cmd == "diagonale_av_gauche": 
                voiture.diagonale_avant_gauche()
            elif cmd == "diagonale_av_droite": 
                voiture.diagonale_avant_droite()
            elif cmd == "diagonale_ar_gauche": 
                voiture.diagonale_arriere_gauche()
            elif cmd == "diagonale_ar_droite": 
                voiture.diagonale_arriere_droite()
            else:
                warn(f"Commande inconnue: {cmd}")
                    
    except Exception as e:
        error(f"Erreur Callback: {e}")

 

def publish_mqtt(topic, payload):
    global clientMQTT
    if clientMQTT is None: return
    try:
        clientMQTT.publish(topic, str(payload))
    except Exception as e:
        error(f"Erreur publish {topic}: {e}")

def publish_distance(timer):
    try:
        publish_mqtt(TOPIC_DISTANCE, distance_sensor.get_distance())
    except Exception as e:
        error(f"Erreur lecture distance: {e}")


# --- Statut Heartbeat ---
def publier_statut(timer):
    publish_mqtt(TOPIC_STATUS, "Online")

def network_check(timer):
    global clientMQTT
    client = manage_mqtt_connection(
        client=clientMQTT,
        server_broker=SERVER_BROKER,
        client_id=f"pico_char_{NOM_GROUPE}",
        topic_cmd=TOPIC_CMD,
        callback=on_message_callback,
        port=PORT_BROKER
    )
    # Update global client
    clientMQTT = client

# --- Timers System ---
# Lecture Capteurs: toutes les 500ms
Timer(mode=Timer.PERIODIC, period=500, callback=publish_distance)
# Heartbeat Statut: toutes les 5s
Timer(mode=Timer.PERIODIC, period=5000, callback=publier_statut)
# Watchdog Réseau: toutes les 10s
Timer(mode=Timer.PERIODIC, period=10000, callback=network_check)

# --- Démarrage ---
info("--- Démarrage Voiture Mecanum IoT ---")
# Premier check immédiat pour lancer la connexion
network_check(None)

# --- Boucle Principale ---
while True:
    try:
        if clientMQTT:
            clientMQTT.check_msg() # Ou wait_msg selon la lib, check_msg est non-bloquant souvent mieux avec timers
        else:
            time.sleep(1)
    except Exception as e:
        error(f"Erreur Main Loop: {e}")
        time.sleep(1)
