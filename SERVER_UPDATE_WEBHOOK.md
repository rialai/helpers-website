# Автоматическое обновление через GitHub Webhook

## Вариант 1: Создать endpoint на сервере

На сервере нужно создать простой скрипт, который будет принимать webhook от GitHub:

```python
# Создать файл: ~/bench/apps/helpers_website/deploy_webhook.py
import frappe
import subprocess
import hmac
import hashlib

@frappe.whitelist(allow_guest=True)
def deploy():
    # Проверить GitHub secret (опционально для безопасности)
    signature = frappe.get_request_header("X-Hub-Signature-256")
    
    try:
        # Запустить обновление
        result = subprocess.run([
            'bash', '-c',
            'cd ~/bench/apps/helpers_website && git pull origin main && cd ../.. && bench migrate && bench clear-cache'
        ], capture_output=True, text=True, timeout=300)
        
        return {
            "success": True,
            "output": result.stdout,
            "errors": result.stderr
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
```

Затем в GitHub Settings → Webhooks добавить:
- URL: https://helpers.ie/api/method/helpers_website.deploy_webhook.deploy
- Content type: application/json
- Secret: (любой секретный ключ)

## Вариант 2: Настроить SSH ключ правильно

1. Открыть Google Cloud Console: https://console.cloud.google.com/compute/instances?project=debraker-bot
2. Найти инстанс wordpress-gcp (или как он называется)
3. Нажать SSH → View gcloud command
4. Скопировать и выполнить команду локально

## Вариант 3: Использовать Cloud Shell

Уже запущен Cloud Shell? Выполните там:
```bash
gcloud compute instances list --project=debraker-bot
gcloud compute ssh [INSTANCE_NAME] --project=debraker-bot --zone=[ZONE]
```

