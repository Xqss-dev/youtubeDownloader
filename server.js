const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();

// Настройка директории для статики
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница с формой для ввода ссылки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка запроса на скачивание видео
app.get('/download', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("URL is required!");
    }

    try {
        const info = await ytdl.getInfo(url);
        res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        ytdl(url, { format: 'mp4' }).pipe(res); // Скачивание видео и передача его клиенту
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to download video");
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
