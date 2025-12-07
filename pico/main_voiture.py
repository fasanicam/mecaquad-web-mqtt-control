from mqtt import MQTTClientSimple
from fasapico import *
from machine import *
import network
import time
import ujson
import logging
import socket

# --- Configuration Logging ---
logging.enable_logging_types(logging.LOG_DEBUG)

# --- Configuration du Projet (A MODIFIER) ---
NOM_GROUPE = "monGroupe"  # <--- METTRE LE NOM DE VOTRE GROUPE ICI (ex: miam, robot-01)
SERVER_BROKER = "mqtt.dev.icam.school"
PORT_BROKER = 1883        # Port standard (non-SSL) pour le pico (interne reseau) ou via bridge
# NOTE: Le broker de l'icam est en 1883 pour TCP standard. Si SSL requis par Pico: ajuster.
# Souvent en interne: 1883.

# --- Topics MQTT ---
TOPIC_BASE = f"bzh/iot/voiture/{NOM_GROUPE}"
TOPIC_CMD = f"{TOPIC_BASE}/cmd"
TOPIC_DISTANCE = f"{TOPIC_BASE}/distance"
TOPIC_STATUS = f"{TOPIC_BASE}/status"

# --- Identifiants WiFi (A MODIFIER ou utiliser fasapico) ---
WIFI_SSID = "icam_iot"
WIFI_PWD = "Summ3#C@mp2022"

# --- Variables globales ---
clientMQTT = None

# --- Actionneurs (Classes Réelles) ---
from Voiture import Voiture
from Moteur import Moteur
from GroveUltrasonicRanger import GroveUltrasonicRanger

# Init Moteurs (Shield Moteur I2C ou PWM standard - adaptation selon hardware reel)
# Supposons l'usage standard fasapico:
moteur_a = Moteur(1) # Vérifier les pins ou ID
moteur_b = Moteur(2)
moteur_c = Moteur(3)
moteur_d = Moteur(4)
voiture = Voiture(moteur_a, moteur_b, moteur_c, moteur_d)

# Vitesse par défaut
VITESSE_DEFAULT = 30000 
voiture.definir_vitesse(VITESSE_DEFAULT)

def avancer():
    logging.info("ACTION: Avancer")
    voiture.avancer()

def reculer():
    logging.info("ACTION: Reculer")
    voiture.reculer()

def stop():
    logging.info("ACTION: STOP")
    voiture.stop()

def gauche():
    logging.info("ACTION: Glisser Gauche")
    voiture.glisser_gauche()

def droite():
    logging.info("ACTION: Glisser Droite")
    voiture.glisser_droite()
    
def rotation_horaire():
    logging.info("ACTION: Rotation Horaire")
    voiture.rotation_horaire()

def rotation_anti_horaire():
    logging.info("ACTION: Rotation Anti-Horaire")
    voiture.rotation_anti_horaire()

def diagonale_av_gauche():
    logging.info("ACTION: Diagonale AV Gauche")
    voiture.diagonale_avant_gauche()

def diagonale_av_droite():
    logging.info("ACTION: Diagonale AV Droite")
    voiture.diagonale_avant_droite()

def diagonale_ar_gauche():
    logging.info("ACTION: Diagonale AR Gauche")
    voiture.diagonale_arriere_gauche()

def diagonale_ar_droite():
    logging.info("ACTION: Diagonale AR Droite")
    voiture.diagonale_arriere_droite()

def map_value(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

def controle_differentiel(gauche_raw, droite_raw):
    # Mapping 0-65535 (Webapp) -> -100 à 100 (Voiture.py)
    # Note: Si la webapp envoie 0-65535, c'est probablement juste 0-100% avant.
    # Si on veut reculer, la webapp devrait envoyer du négatif ou un bouton inversion.
    # Pour l'instant, on mappe 0-65535 en 0-100.
    mg = map_value(gauche_raw, 0, 65535, 0, 100)
    md = map_value(droite_raw, 0, 65535, 0, 100)
    
    logging.info(f"ACTION: Differentiel G={mg:.1f} D={md:.1f}")
    try:
        voiture.differentiel(mg, md)
    except Exception as e:
        logging.error(f"Erreur Differentiel: {e}")

# ... MQTT Callback reste identique, appelant ces fonctions ...

# --- Capteurs (Ultrason) ---
# Pin definition à vérifier sur votre montage (ex: Pin 16 ou port Grove)
distance_sensor = GroveUltrasonicRanger(16) 

def lire_capteurs(timer):
    global clientMQTT
    if clientMQTT is None: return

    try:
        dist = distance_sensor.get_distance()
        clientMQTT.publish(TOPIC_DISTANCE, str(dist))
        # logging.debug(f"Publié distance: {dist} cm")
    except Exception as e:
        logging.error(f"Erreur pub distance: {e}")


# --- Statut Heartbeat ---
def publier_statut(timer):
    global clientMQTT
    if clientMQTT is None: return
    try:
        clientMQTT.publish(TOPIC_STATUS, "Online")
    except:
        pass

# --- Vérification Réseau & Reconnexion Auto ---
def test_acces_internet():
    try:
        # Test basic DNS resolution or connection to Google DNS (8.8.8.8) on port 53
        # Or simple HTTP get like in example
        addr = socket.getaddrinfo("8.8.8.8", 53)[0][-1]
        s = socket.socket()
        s.settimeout(3)
        s.connect(addr)
        s.close()
        return True
    except:
        return False

def network_check(timer):
    global clientMQTT
    try:
        # 1. Check WiFi
        wlan = network.WLAN(network.STA_IF)
        if not wlan.isconnected():
            logging.warning("WiFi perdu. Tentative de reconnexion...")
            connect_to_wifi(ssid=WIFI_SSID, password=WIFI_PWD)
        
        # 1c. Check Internet Access
        if not test_acces_internet():
            logging.error("Pas d'accès internet (DNS/Ping fail).")
            # On ne tente pas MQTT si pas d'internet
            return
        
        # 2. Check MQTT
        if clientMQTT:
            try:
                clientMQTT.ping() # Si la lib le supporte, sinon publish test
            except:
                logging.error("Lien MQTT mort.")
                clientMQTT = None # Force reconnexion

        # 3. (Re)Connect MQTT
        if clientMQTT is None:
            logging.info(f"Connexion au broker {SERVER_BROKER}...")
            # Petit délai pour laisser le wifi se stabiliser si besoin
            time.sleep(1)
            
            client = MQTTClientSimple(
                client_id=f"pico_char_{NOM_GROUPE}",
                server=SERVER_BROKER,
                port=PORT_BROKER
            )
            client.set_callback(on_message_callback)
            client.connect()
            
            logging.info(f"Abonnement à {TOPIC_CMD}")
            client.subscribe(TOPIC_CMD)
            
            clientMQTT = client
            logging.info("MQTT Connecté & Abonné !")

    except Exception as e:
        logging.error(f"Erreur Network Check: {e}")
        clientMQTT = None

# --- Timers System ---
# Lecture Capteurs: toutes les 500ms
Timer(mode=Timer.PERIODIC, period=500, callback=lire_capteurs)
# Heartbeat Statut: toutes les 5s
Timer(mode=Timer.PERIODIC, period=5000, callback=publier_statut)
# Watchdog Réseau: toutes les 10s
Timer(mode=Timer.PERIODIC, period=10000, callback=network_check)

# --- Démarrage ---
logging.info("--- Démarrage Voiture Mecanum IoT ---")
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
        logging.error(f"Erreur Main Loop: {e}")
        time.sleep(1)
