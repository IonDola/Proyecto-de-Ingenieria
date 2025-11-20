"""
F-061: Utilidad de cifrado AES para campos sensibles
"""
from cryptography.fernet import Fernet
from django.conf import settings
import os

def get_encryption_key():
    """
    Obtiene la clave de cifrado desde settings o variables de entorno.
    En DEBUG, si falta, genera una temporal; en producción, exige que exista.
    """
    key = getattr(settings, "ENCRYPTION_KEY", None) or os.environ.get("ENCRYPTION_KEY")
    if not key:
        # En desarrollo podés permitir generar una temporal, en prod no.
        if getattr(settings, "DEBUG", False):
            key = Fernet.generate_key().decode()
            os.environ['ENCRYPTION_KEY'] = key
            print("[WARN] ENCRYPTION_KEY ausente; usando clave temporal de desarrollo.")
        else:
            raise RuntimeError("ENCRYPTION_KEY no configurada")
    return key.encode() if isinstance(key, str) else key

def encrypt_field(value):
    """
    Cifra un valor usando AES (vía Fernet)
    Retorna el texto cifrado en base64
    """
    if not value or value == "":
        return ""
    
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted = f.encrypt(value.encode())
        return encrypted.decode()
    except Exception as e:
        print(f"Error cifrando: {e}")
        return value  # En caso de error, retornar sin cifrar

def decrypt_field(encrypted_value):
    """
    Descifra un valor cifrado con AES
    Retorna el texto plano original
    """
    if not encrypted_value or encrypted_value == "":
        return ""
    
    try:
        key = get_encryption_key()
        f = Fernet(key)
        decrypted = f.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except Exception as e:
        print(f"Error descifrando: {e}")
        return encrypted_value  # Si falla, retornar el valor tal cual

def rotate_encryption_key(old_key_str, new_key_str):
    """
    F-061: Rotación de clave de cifrado.
    Recibe la clave antigua y la nueva, retorna las instancias Fernet.
    """
    old_key = old_key_str.encode() if isinstance(old_key_str, str) else old_key_str
    new_key = new_key_str.encode() if isinstance(new_key_str, str) else new_key_str
    
    return Fernet(old_key), Fernet(new_key)

def re_encrypt_field(encrypted_value, old_fernet, new_fernet):
    """
    Re-cifra un campo: descifra con clave vieja, cifra con clave nueva.
    """
    if not encrypted_value or encrypted_value == "":
        return ""
    
    try:
        # Descifrar con clave vieja
        decrypted = old_fernet.decrypt(encrypted_value.encode())
        # Cifrar con clave nueva
        re_encrypted = new_fernet.encrypt(decrypted)
        return re_encrypted.decode()
    except Exception as e:
        print(f"Error re-cifrando: {e}")
        return encrypted_value