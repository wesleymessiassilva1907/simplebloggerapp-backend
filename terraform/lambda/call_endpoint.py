import os
import urllib.request

def handler(event, context):
    endpoint = os.environ.get("TARGET_ENDPOINT")
    if not endpoint:
        return {
            "statusCode": 500,
            "body": "TARGET_ENDPOINT não configurado"
        }

    try:
        # Faz um GET simples no endpoint parametrizado
        with urllib.request.urlopen(endpoint) as resp:
            status = resp.getcode()
            body_preview = resp.read(1024).decode("utf-8", errors="ignore")
        return {
            "statusCode": 200,
            "body": f"GET {endpoint} -> {status}; body_preview={body_preview[:200]}"
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"Erro ao chamar {endpoint}: {e}"
        }
