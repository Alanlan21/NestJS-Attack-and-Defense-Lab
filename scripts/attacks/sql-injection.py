"""
Script de Ataque Controlado - SQL Injection
Testa a detecção de tentativas de SQL Injection
"""

import requests
import time
from typing import List
import argparse

BASE_URL = "http://localhost:3000"

# Payloads comuns de SQL Injection
SQL_INJECTION_PAYLOADS = [
    # Union-based
    "' UNION SELECT NULL--",
    "' UNION SELECT NULL, NULL--",
    "' UNION SELECT username, password FROM users--",
    
    # Boolean-based
    "' OR '1'='1",
    "' OR 1=1--",
    "admin' --",
    "admin' #",
    "' or 1=1 limit 1 --",
    
    # Time-based
    "'; WAITFOR DELAY '00:00:05'--",
    "'; SELECT SLEEP(5)--",
    
    # Stacked queries
    "'; DROP TABLE users--",
    "'; DELETE FROM users WHERE '1'='1",
    
    # Error-based
    "' AND 1=CONVERT(int, @@version)--",
    "' AND 1=CAST((SELECT @@version) AS int)--",
    
    # Authentication bypass
    "admin' OR '1'='1' /*",
    "' OR ''='",
    "' OR 1 -- -",
    "') OR ('1'='1",
    
    # Advanced
    "1' UNION SELECT NULL, NULL, NULL, table_name FROM information_schema.tables--",
    "1' AND (SELECT COUNT(*) FROM users) > 0--",
]


def test_sql_injection_login(payloads: List[str], delay: float = 0.5):
    """
    Testa SQL injection no endpoint de login
    """
    endpoint = f"{BASE_URL}/auth/login"
    
    print(f"\n🔴 Testando SQL Injection - Login Endpoint")
    print(f"   Payloads: {len(payloads)}\n")
    
    results = {
        "total_attempts": 0,
        "blocked": 0,
        "success": 0,
        "errors": 0,
        "details": [],
    }

    for idx, payload in enumerate(payloads, 1):
        try:
            results["total_attempts"] += 1

            # Testa no campo email
            response1 = requests.post(
                endpoint,
                json={"email": payload, "password": "test123"},
                timeout=5,
            )

            # Testa no campo password
            response2 = requests.post(
                endpoint,
                json={"email": "test@test.com", "password": payload},
                timeout=5,
            )

            print(f"[{idx}/{len(payloads)}] Payload: {payload[:40]:<40}")
            print(f"              Email field:    {response1.status_code}")
            print(f"              Password field: {response2.status_code}")

            # Detecta bloqueio
            if response1.status_code == 403 or response2.status_code == 403:
                results["blocked"] += 1
                print(f"              ⚠️  WAF BLOQUEOU!")

            # Detecta sucesso indevido
            if response1.status_code == 200 or response2.status_code == 200:
                results["success"] += 1
                print(f"              🚨 VULNERÁVEL! Bypass detectado!")

            results["details"].append({
                "payload": payload,
                "email_status": response1.status_code,
                "password_status": response2.status_code,
            })

            time.sleep(delay)

        except Exception as e:
            results["errors"] += 1
            print(f"              ❌ Erro: {e}")

    return results


def test_sql_injection_params(endpoint: str = "/users", payloads: List[str] = None, delay: float = 0.5):
    """
    Testa SQL injection em query parameters
    """
    if payloads is None:
        payloads = SQL_INJECTION_PAYLOADS[:10]
    
    full_url = f"{BASE_URL}{endpoint}"
    
    print(f"\n🔴 Testando SQL Injection - Query Parameters")
    print(f"   Endpoint: {endpoint}")
    print(f"   Payloads: {len(payloads)}\n")
    
    results = {"total": 0, "blocked": 0, "details": []}

    for idx, payload in enumerate(payloads, 1):
        try:
            results["total"] += 1

            response = requests.get(
                full_url,
                params={"id": payload, "search": payload},
                timeout=5,
            )

            print(f"[{idx}/{len(payloads)}] {payload[:50]:<50} | Status: {response.status_code}")

            if response.status_code == 403:
                results["blocked"] += 1
                print(f"              🛡️  BLOQUEADO pelo WAF")

            results["details"].append({
                "payload": payload,
                "status": response.status_code,
            })

            time.sleep(delay)

        except Exception as e:
            print(f"              ❌ Erro: {e}")

    return results


def advanced_sql_injection_test():
    """
    Testes avançados de SQL injection com técnicas de evasão
    """
    print(f"\n🔴 Testes Avançados de SQL Injection (Evasão)")
    
    evasion_payloads = [
        # Case manipulation
        "' Or '1'='1",
        "' oR '1'='1",
        
        # URL encoding
        "%27%20OR%20%271%27%3D%271",
        
        # Double encoding
        "%2527%2520OR%2520%25271%2527%253D%25271",
        
        # Comments
        "' OR/**/1=1--",
        "' OR/*comment*/1=1--",
        
        # Whitespace manipulation
        "'OR\t1=1--",
        "'OR\n1=1--",
    ]

    return test_sql_injection_login(evasion_payloads, delay=0.3)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SQL Injection Attack Simulator")
    parser.add_argument(
        "--target",
        choices=["login", "params", "advanced", "all"],
        default="all",
        help="Target to test",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Delay between requests",
    )

    args = parser.parse_args()

    if args.target == "login" or args.target == "all":
        results = test_sql_injection_login(SQL_INJECTION_PAYLOADS, args.delay)
        
        print(f"\n{'='*60}")
        print("RELATÓRIO - SQL Injection (Login)")
        print(f"{'='*60}")
        print(f"Total de payloads testados: {results['total_attempts']}")
        print(f"Bloqueados pelo WAF: {results['blocked']}")
        print(f"Bypasses (VULNERÁVEL): {results['success']}")
        print(f"Taxa de bloqueio: {(results['blocked']/results['total_attempts']*100):.1f}%")
        print(f"{'='*60}\n")

    if args.target == "params" or args.target == "all":
        results = test_sql_injection_params(delay=args.delay)
        
        print(f"\n{'='*60}")
        print("RELATÓRIO - SQL Injection (Params)")
        print(f"{'='*60}")
        print(f"Total: {results['total']}")
        print(f"Bloqueados: {results['blocked']}")
        print(f"Taxa de bloqueio: {(results['blocked']/results['total']*100):.1f}%")
        print(f"{'='*60}\n")

    if args.target == "advanced" or args.target == "all":
        results = advanced_sql_injection_test()
        
        print(f"\n{'='*60}")
        print("RELATÓRIO - SQL Injection Avançado (Evasão)")
        print(f"{'='*60}")
        print(f"Total: {results['total_attempts']}")
        print(f"Bloqueados: {results['blocked']}")
        print(f"Bypasses: {results['success']}")
        print(f"{'='*60}\n")
