"""
Script de Ataque Simulado - Múltiplos IPs
Simula ataques vindos de diferentes endereços IP
"""

import requests
import random
import time
import argparse

BASE_URL = "http://localhost:3000"

# IPs fictícios para simular ataques de diferentes origens
ATTACKER_IPS = [
    "203.0.113.10",    # IP documentação RFC 5737
    "198.51.100.50",   # IP documentação RFC 5737
    "192.0.2.100",     # IP documentação RFC 5737
    "45.33.32.156",    # IP suspeito fictício
    "185.220.101.1",   # IP suspeito fictício
    "104.28.0.1",      # IP suspeito fictício
    "8.8.8.8",         # Google DNS (exemplo de IP legítimo)
]

SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "admin' --",
    "' UNION SELECT NULL--",
    "'; DROP TABLE users--",
]


def attack_from_ip(ip: str, payload: str, attack_type: str = "SQL Injection"):
    """
    Simula um ataque vindo de um IP específico
    """
    endpoint = f"{BASE_URL}/auth/login"
    
    try:
        response = requests.post(
            endpoint,
            json={"email": payload, "password": "test123"},
            headers={
                "X-Forwarded-For": ip,  # Simula IP de origem
                "User-Agent": f"AttackBot/1.0 ({attack_type})",
            },
            timeout=5,
        )

        if response.status_code == 403:
            return "🛡️  BLOCKED"
        elif response.status_code == 401:
            return "⚠️  DETECTED (401)"
        elif response.status_code == 400:
            return "⚠️  DETECTED (400)"
        else:
            return f"⚠️  DETECTED ({response.status_code})"

    except requests.exceptions.Timeout:
        return "⏱️  TIMEOUT"
    except Exception as e:
        return f"❌ ERROR: {str(e)[:30]}"


def simulate_distributed_attack(num_attacks: int = 20, delay: float = 0.5):
    """
    Simula um ataque distribuído de múltiplos IPs
    """
    print("\n" + "=" * 60)
    print("🌐 ATAQUE DISTRIBUÍDO - MÚLTIPLOS IPs")
    print("=" * 60)
    print(f"Total de ataques: {num_attacks}")
    print(f"IPs atacantes:    {len(ATTACKER_IPS)}")
    print(f"Delay:            {delay}s")
    print("=" * 60 + "\n")

    results = {
        "total": 0,
        "blocked": 0,
        "detected": 0,
        "by_ip": {},
    }

    for i in range(1, num_attacks + 1):
        # Escolhe IP aleatório
        ip = random.choice(ATTACKER_IPS)
        payload = random.choice(SQL_INJECTION_PAYLOADS)
        
        # Inicializa contador do IP se necessário
        if ip not in results["by_ip"]:
            results["by_ip"][ip] = {"total": 0, "blocked": 0}
        
        # Executa ataque
        status = attack_from_ip(ip, payload)
        
        results["total"] += 1
        results["by_ip"][ip]["total"] += 1
        
        if "BLOCKED" in status:
            results["blocked"] += 1
            results["by_ip"][ip]["blocked"] += 1
        else:
            results["detected"] += 1
        
        print(f"[{i:2d}/{num_attacks}] {ip:15s} | {status:20s} | {payload[:30]}")
        
        time.sleep(delay)

    return results


def simulate_focused_attack(target_ip: str, num_attacks: int = 10):
    """
    Simula múltiplos ataques de um único IP (para testar blocklist)
    """
    print("\n" + "=" * 60)
    print(f"🎯 ATAQUE FOCADO - IP {target_ip}")
    print("=" * 60)
    print(f"Total de ataques: {num_attacks}")
    print("=" * 60 + "\n")

    results = {
        "total": 0,
        "blocked": 0,
        "detected": 0,
    }

    for i in range(1, num_attacks + 1):
        payload = random.choice(SQL_INJECTION_PAYLOADS)
        status = attack_from_ip(target_ip, payload)
        
        results["total"] += 1
        
        if "BLOCKED" in status:
            results["blocked"] += 1
        else:
            results["detected"] += 1
        
        print(f"[{i:2d}/{num_attacks}] {status:20s} | {payload[:30]}")
        
        time.sleep(0.5)

    return results


def print_summary(results: dict):
    """
    Exibe resumo dos resultados
    """
    print("\n" + "=" * 60)
    print("📊 RESUMO DO ATAQUE")
    print("=" * 60)
    print(f"Total de Ataques: {results['total']}")
    print(f"Bloqueados:       {results['blocked']}")
    print(f"Detectados:       {results['detected']}")
    
    if results['total'] > 0:
        block_rate = (results['blocked'] / results['total']) * 100
        print(f"\nTaxa de Bloqueio: {block_rate:.1f}%")
    
    if 'by_ip' in results:
        print("\n📍 Ataques por IP:")
        print("-" * 60)
        for ip, stats in sorted(results['by_ip'].items(), key=lambda x: x[1]['total'], reverse=True):
            print(f"  {ip:15s} | {stats['total']:2d} ataques | {stats['blocked']:2d} bloqueados")
    
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Simula ataques de múltiplos IPs"
    )
    parser.add_argument(
        "--mode",
        choices=["distributed", "focused"],
        default="distributed",
        help="Modo de ataque (padrão: distributed)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Número de ataques (padrão: 20)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.3,
        help="Delay entre ataques em segundos (padrão: 0.3)",
    )
    parser.add_argument(
        "--ip",
        type=str,
        default="203.0.113.10",
        help="IP alvo para modo focused (padrão: 203.0.113.10)",
    )

    args = parser.parse_args()

    try:
        if args.mode == "distributed":
            results = simulate_distributed_attack(args.count, args.delay)
        else:  # focused
            results = simulate_focused_attack(args.ip, args.count)

        print_summary(results)

    except KeyboardInterrupt:
        print("\n\n⚠️  Ataque interrompido pelo usuário\n")


if __name__ == "__main__":
    main()
