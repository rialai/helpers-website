# Deployment Guide для helpers.ie

## Быстрый деплой

```bash
# 1. Авторизоваться (если нужно)
gcloud auth login
gcloud config set project helpers-ie-prod-260210

# 2. Создать архив и скопировать на сервер
cd /Users/riabets/helpers-website
tar --exclude '._*' --exclude '.DS_Store' -czf /tmp/helpers_website.tar.gz helpers_website/
gcloud compute scp /tmp/helpers_website.tar.gz erpnext-vm:/tmp/ --project=helpers-ie-prod-260210 --zone=europe-west1-b

# 3. Развернуть на сервере
gcloud compute ssh erpnext-vm --project=helpers-ie-prod-260210 --zone=europe-west1-b --command="
cd /tmp && tar -xzf helpers_website.tar.gz
sudo find helpers_website -name '._*' -delete
sudo rm -rf /opt/erpnext/apps/helpers_website/helpers_website/*
sudo cp -r helpers_website/* /opt/erpnext/apps/helpers_website/helpers_website/
rm -rf /tmp/helpers_website /tmp/helpers_website.tar.gz
BACKEND=\$(sudo docker ps --filter 'name=backend' --format '{{.Names}}' | head -1)
sudo docker exec \$BACKEND bench migrate
sudo docker exec \$BACKEND bench clear-cache
echo '✅ Done'
"
```

## Информация о сервере

- **Project**: helpers-ie-prod-260210
- **Instance**: erpnext-vm
- **Zone**: europe-west1-b
- **IP**: 35.241.133.80
- **Site**: https://helpers.ie
- **App Path**: /opt/erpnext/apps/helpers_website
- **Backend Container**: erpnext-backend-1

## Примечания

- Сервер использует Docker-based ERPNext
- Git на сервере настроен на SSH, но ключи не работают
- Используем архивирование + scp для деплоя
- Обязательно удалять macOS служебные файлы (._*, .DS_Store)
