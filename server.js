const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

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
        console.log(`Start downloading: ${info.videoDetails.title}`);
        
        // Устанавливаем заголовок для скачивания
        res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);

        // Логируем начало загрузки
        console.log('Video download started...');
        
        // Создаем поток для скачивания видео и передаем его пользователю
        const videoStream = ytdl(url, { format: 'mp4' });

        // Логируем прогресс скачивания
        videoStream.on('progress', (chunkLength, downloaded, total) => {
            const progress = (downloaded / total) * 100;
            console.log(`Downloading... ${Math.round(progress)}%`);
            // Отправляем прогресс на клиент
            res.write(`<script>window.postMessage({ progress: ${Math.round(progress)} }, '*');</script>`);
        });

        // Передаем видео в поток
        videoStream.pipe(res);

        videoStream.on('end', () => {
            console.log('Video download complete!');
        });

        videoStream.on('error', (err) => {
            console.error('Error downloading video:', err);
            res.status(500).send('Failed to download video');
        });
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
