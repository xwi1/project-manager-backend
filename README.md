# Установка серверной части приложения

## 1. Предварительно установите nodejs, npm, postgresql, git
```
sudo apt install nodejs npm postgresql git
```

## 2. Создайте базу данных и пользователя в postgresql (вариант через терминал)
### Зайдите в терминал postgresql
```
sudo -u postgres psql
```
### Выполните следующую команду, просто поменяйте название для базы данных (mydb) и пользователя (myuser) с его паролем (mypassword)
```
CREATE DATABASE mydb;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
\q
```

## 3. Клонируйте данный репозиторий в подходящую папку
```
git clone https://github.com/xwi1/project-manager-backend.git
```


## 3. Перейдите в папку с установленным приложением и установите пакеты для него
```
cd project-manager-backend
npm install
```

## 4. Перед проведением миграций измените строку подключения к базе данных в файле окружения (.env)
### Измените переменную DATABASE_URL
Выглядит она на текущий момент так:
```
DATABASE_URL = "postgresql://admin:Zj4d5c0vmmbNkfq4IqDlrldecsu3fHb5@dpg-d18b52umcj7s73fa3i30-a/projectdb_4ilh"
```
Формат строки такой:
```
DATABASE_URL = "postgresql://[Имя пользователя]:[Пароль пользователя]@[Хост]:[Порт]/[Название базы данных]"
```
Хост обычно localhost, если вы будете размещать базу данных на одном и том же сервере. Порт обычно 5432.
Ваша строка подключения будет другой, при разработке строка была такая:
```
DATABASE_URL="postgresql://postgres:pass@localhost:5432/projectdb"
```
### Измените переменную PORT (при необходимости)
```
PORT=5000
```

## 5. Проведите миграции для базы данных
```
npx prisma migrate dev
```

## 6. Запустите приложение
```
npm run dev
```

Таким образом серверная часть приложения будет запущена, останется только запустить клиентскую часть, для этого перейдите в этот репозиторий:
https://github.com/xwi1/project-manager
