#
# Подключение сотрудников
######
Необходимо всем сотрудникам написать боту.
Зарегистрировать каждого в админ чате, где в адресе https://docs.google.com/spreadsheets/d/1vJRJTlKAWhIVFqUjrkpvy1gFIZuLDiARYkjinfCLKhаA/edit#gid=1264158638, 1vJRJTlKAWhIVFqUjrkpvy1gFIZuLDiARYkjinfCLKhаA - это spreadsheet_id.
#
pageId = 1264158638 цифры в конце URL адреса, это id конкретной страницы таблицы.
#
######
#
# Подключение google.doc
#
######
# Создание сервисного аккаунта 
#
1. Нажмите API и сервисыа затемУчетные данные.
2. Нажмите Создать учетные данные, а затем – Сервисный аккаунт.
3. Перейдите в https://console.cloud.google.com/cloud-resource-manager и нажмите «Create project». Введите название проекта и нажмите «Создать».
4. Название проекта и продолжить.
5. Процесс создания проекта может занять несколько минут. После создания он появится на главной странице Google Cloud Platform Console «Управление ресурсами». https://console.cloud.google.com/cloud-resource-manager
6. Перейдите в панель управления созданного проекта. В верхнем левом углу нажмите на иконку меню. Выберите в этом меню «API и сервисы» —> «Панель управления».
5. В панели управления нажмите на «Включить API и сервисы». На появившейся странице найдите Google Sheets API и установите.
7. Вернитесь на главную страницу вашего проекта. Перейдите в раздел «Учетные данные». Нажмите на «Создать учетные данные» -> «Ключ сервисного аккаунта».
8. На странице создания сервисного аккаунта укажите тип ключа «JSON» и роль «Проект -> Владелец». Нажмите «Создать». Сохраните полученный .json файл. Этот файл является ключом вашего сервисного аккаунта. Этот ключ необходимо поместить в корневую директорию.
9. Чтобы можно было подключиться к таблице администратор аккаунта google должен дать права доступа сервисному аккаунту (пригласить его, указав его почту) на необходимые файлы (директорию).
#
# Env файл
#
В env. файле необходимо заполнить следующие поля:
TOKEN= токен телеграм бота
ADMIN_CHAT_ID = chat id админов
#
# Postgres
#
Подключение через DATABASE_URL